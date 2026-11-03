/**
 * Hjelpefunksjoner for muntlig øving: sender opptaket til server-funksjonen
 * (`src/app/api/tilbakemelding+api.ts`) og regner ut enkle tall om talen.
 */

import { File } from 'expo-file-system';
import { Platform } from 'react-native';

import type { Ord } from '@/data/ord';

export type AiTilbakemelding = {
  brukteOrdet: boolean;
  nivaa: 'sterkt' | 'godt' | 'provIgjen';
  overskrift: string;
  styrker: string[];
  forbedringer: string[];
  bedreFormulering: string;
};

export type TilbakemeldingSvar = {
  transkripsjon: string;
  /** `null` når AI-nøkkelen mangler eller AI-en ikke svarte. Da lager appen tilbakemelding selv. */
  ai: AiTilbakemelding | null;
};

/** Sender lydopptaket til serveren og får tilbake det du sa som tekst, og eventuelt AI-tilbakemelding. */
export async function sendOpptak(uri: string, ord: Ord, oppgave?: string): Promise<TilbakemeldingSvar> {
  const skjema = new FormData();
  if (Platform.OS === 'web') {
    // På nettet er opptaket en blob-adresse som må hentes først.
    const blob = await (await fetch(uri)).blob();
    skjema.append('lyd', blob, 'opptak.webm');
  } else {
    // På mobil leser vi filen med expo-file-system. Expo sin fetch godtar ikke
    // React Native-varianten `{ uri, name, type }` i FormData, men en `File` går fint.
    skjema.append('lyd', new File(uri) as unknown as Blob);
  }
  skjema.append('ord', ord.ord);
  skjema.append('betydning', ord.betydning);
  if (oppgave) skjema.append('oppgave', oppgave);

  let svar: Response;
  try {
    svar = await fetch('/api/tilbakemelding', { method: 'POST', body: skjema });
  } catch (e) {
    // Vises i terminalen der `npx expo start` kjører, så det er lettere å finne feilen.
    console.warn('Sending av opptak feilet', e);
    throw new Error('Fikk ikke kontakt med serveren. Sjekk at appen kjører fra `npx expo start`.');
  }
  const json = (await svar.json().catch(() => ({}))) as Partial<TilbakemeldingSvar> & { feil?: string };
  if (!svar.ok) throw new Error(json.feil ?? 'Noe gikk galt. Prøv igjen.');
  return { transkripsjon: json.transkripsjon ?? '', ai: json.ai ?? null };
}

/** Ord per minutt. Rundt 120–160 er et behagelig tempo for de fleste. */
export function ordPerMinutt(transkripsjon: string, varighetMs: number): number | null {
  const antall = transkripsjon.trim().split(/\s+/).filter(Boolean).length;
  if (varighetMs < 2000 || antall === 0) return null;
  return Math.round(antall / (varighetMs / 60_000));
}

/** Kort vurdering av tempoet. */
export function tempoTekst(opm: number): string {
  if (opm < 100) return 'Rolig tempo. Du kan gjerne øke litt.';
  if (opm > 175) return 'Raskt tempo. Prøv å ta små pauser.';
  return 'Behagelig tempo.';
}
