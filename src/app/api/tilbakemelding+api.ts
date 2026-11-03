/**
 * Server-funksjon for muntlig øving. Kjører på serveren (utviklingsserveren til Expo når du tester),
 * aldri på telefonen, så API-nøklene blir ikke med i appen.
 *
 * 1. Tar imot lydopptaket fra appen.
 * 2. Gjør talen om til tekst (OpenAI sin tale-til-tekst).
 * 3. Ber en AI-modell om tilbakemelding på det brukeren sa.
 *
 * Nøklene ligger i `.env.local` i rotmappen (se `.env.example`):
 *   OPENAI_API_KEY     – trengs for tale-til-tekst
 *   ANTHROPIC_API_KEY  – trengs for AI-tilbakemelding. Mangler den, gir appen enkel tilbakemelding selv.
 */

import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';

import type { TilbakemeldingSvar } from '@/utils/muntlig';

const AiSvar = z.object({
  brukteOrdet: z.boolean().describe('Om dagens ord (eller en bøyd form av det) ble brukt naturlig.'),
  nivaa: z.enum(['sterkt', 'godt', 'provIgjen']),
  overskrift: z.string().describe('Kort, oppmuntrende overskrift, maks 5 ord.'),
  styrker: z.array(z.string()).describe('1–2 ting som fungerte godt.'),
  forbedringer: z.array(z.string()).describe('1–3 konkrete tips om ordvalg, struktur eller tydelighet.'),
  bedreFormulering: z.string().describe('Brukerens poeng sagt litt bedre, med dagens ord, i 1–2 setninger.'),
});

type AiTilbakemelding = z.infer<typeof AiSvar>;

const systemTekst = `Du er en vennlig og ærlig taletrener i en norsk app der folk øver på å snakke bedre i hverdagen.
Brukeren har sagt noe høyt, og du får det som tekst fra tale-til-tekst (det kan ha små feil i transkripsjonen; ikke kommenter skrivefeil eller tegnsetting).
Gi kort tilbakemelding på norsk bokmål om hvordan det ble sagt: ordvalg, om dagens ord ble brukt naturlig, struktur, tydelighet og fyllord.
Vær konkret og oppmuntrende, og snakk direkte til brukeren med «du». Hold hvert punkt til én setning.`;

/** Største opptak vi tar imot. To minutter tale er rundt 2 MB. */
const MAKS_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request): Promise<Response> {
  if (Number(request.headers.get('content-length') ?? 0) > MAKS_BYTES) {
    return Response.json({ feil: 'Opptaket er for langt.' }, { status: 413 });
  }
  const openaiNokkel = process.env.OPENAI_API_KEY;
  if (!openaiNokkel) {
    return Response.json(
      { feil: 'Tale-til-tekst er ikke satt opp ennå. Legg inn OPENAI_API_KEY i .env.local.' },
      { status: 503 },
    );
  }

  // Typene for FormData i React Native mangler `get`, men på serveren finnes den.
  let skjema: { get(navn: string): unknown };
  try {
    skjema = (await request.formData()) as unknown as typeof skjema;
  } catch {
    return Response.json({ feil: 'Fant ikke lydopptaket.' }, { status: 400 });
  }
  const lyd = skjema.get('lyd');
  if (!(lyd instanceof Blob) || lyd.size === 0) {
    return Response.json({ feil: 'Fant ikke lydopptaket.' }, { status: 400 });
  }
  if (lyd.size > MAKS_BYTES) {
    return Response.json({ feil: 'Opptaket er for langt.' }, { status: 413 });
  }
  const ord = String(skjema.get('ord') ?? '');
  const betydning = String(skjema.get('betydning') ?? '');
  const oppgave = String(skjema.get('oppgave') ?? '');

  // 1. Tale til tekst.
  let transkripsjon: string;
  try {
    transkripsjon = await taleTilTekst(lyd, openaiNokkel);
  } catch (e) {
    console.error('Tale-til-tekst feilet', e);
    return Response.json({ feil: 'Klarte ikke å gjøre talen om til tekst. Prøv igjen.' }, { status: 502 });
  }
  if (transkripsjon.trim().length === 0) {
    return Response.json({ feil: 'Jeg hørte ingenting. Prøv å snakke litt nærmere mikrofonen.' }, { status: 422 });
  }

  // 2. AI-tilbakemelding (valgfritt).
  let ai: AiTilbakemelding | null = null;
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      ai = await aiTilbakemelding({ transkripsjon, ord, betydning, oppgave });
    } catch (e) {
      console.error('AI-tilbakemelding feilet', e);
    }
  }

  return Response.json({ transkripsjon, ai } satisfies TilbakemeldingSvar);
}

async function taleTilTekst(lyd: Blob, nokkel: string): Promise<string> {
  const filnavn = lyd.type.includes('webm') ? 'opptak.webm' : 'opptak.m4a';
  const data = new FormData();
  data.append('file', lyd, filnavn);
  data.append('model', 'gpt-4o-mini-transcribe');
  data.append('language', 'no');

  const svar = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${nokkel}` },
    body: data,
  });
  if (!svar.ok) throw new Error(`${svar.status} ${await svar.text()}`);
  const json = (await svar.json()) as { text?: string };
  return json.text ?? '';
}

async function aiTilbakemelding(inn: {
  transkripsjon: string;
  ord: string;
  betydning: string;
  oppgave: string;
}): Promise<AiTilbakemelding | null> {
  const melding = [
    `Dagens ord: «${inn.ord}» (${inn.betydning})`,
    inn.oppgave ? `Oppgave brukeren svarte på: ${inn.oppgave}` : 'Oppgave: Si én setning der du bruker dagens ord.',
    `Dette sa brukeren:\n"""\n${inn.transkripsjon}\n"""`,
  ].join('\n\n');

  // Lages her, etter at POST har sjekket at nøkkelen finnes.
  const klient = new Anthropic();
  const svar = await klient.beta.messages.parse({
    model: 'claude-opus-5-5',
    max_tokens: 4000,
    // Hvis modellen avslår av sikkerhetsgrunner, prøver serveren automatisk en annen modell.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: betaZodOutputFormat(AiSvar) },
    system: systemTekst,
    messages: [{ role: 'user', content: melding }],
  });

  if (svar.stop_reason === 'refusal') return null;
  return svar.parsed_output ?? null;
}
