/**
 * Ordbank for "Dagens ord".
 * Hvert ord har en betydning, eksempler, synonymer og de enkle ordene det kan erstatte.
 * Ordene er merket med situasjonene de passer til (samme id-er som i målspørsmålene),
 * slik at "Dagens ord" kan velges ut fra hva brukeren vil øve på.
 * Senere flytter vi listen til databasen (Supabase) og utvider den.
 */

import type { MaalSvar } from '@/data/maal-sporsmal';

/** Situasjoner et ord passer til. Samme id-er som alternativene på «Hvor vil du snakke bedre?». */
export type Tema = 'hverdag' | 'mote' | 'intervju' | 'presentasjon' | 'diskusjon' | 'skriftlig';

/** Utfordringer et ord kan hjelpe mot. Samme id-er som på «Hva synes du er vanskeligst i dag?». */
export type Utfordring = 'finne-ord' | 'samme-ord' | 'fyllord' | 'presis' | 'nerver';

export type Ord = {
  ord: string;
  ordklasse: 'adjektiv' | 'verb' | 'substantiv' | 'adverb';
  betydning: string;
  /** Generelt eksempel, brukes når det ikke finnes et eget for situasjonen. */
  eksempel: string;
  /** Eksempler tilpasset situasjonene ordet passer til. */
  eksempler: Partial<Record<Tema, string>>;
  synonymer: string[];
  erstatter: string[];
  temaer: Tema[];
  /** Utfordringer ordet er ekstra nyttig mot. */
  hjelperMot?: Utfordring[];
};

export const temaNavn: Record<Tema, string> = {
  hverdag: 'Hverdagsprat',
  mote: 'Møter på jobb',
  intervju: 'Jobbintervju',
  presentasjon: 'Presentasjoner',
  diskusjon: 'Diskusjoner',
  skriftlig: 'Skriftlig',
};

/** Et kort råd per utfordring, som vises sammen med dagens ord. */
export const utfordringTips: Record<Utfordring, string> = {
  'finne-ord': 'Si ordet høyt tre ganger i dag, i tre ulike setninger. Da sitter det lettere neste gang.',
  'samme-ord': 'Legg merke til når du sier et av ordene under «Bruk det i stedet for», og prøv dagens ord der.',
  fyllord: 'Ta en kort pause i stedet for «eh». En pause høres trygg ut, og gir deg tid til å finne ordet.',
  presis: 'Prøv å si poenget ditt i én setning med dagens ord, før du forklarer mer.',
  nerver: 'Øv på eksempelsetningen høyt før du skal bruke den. Det som er øvd på, kommer lettere når du er nervøs.',
};

/** Hvilke situasjoner som passer til hvert svar på «Hvorfor vil du bli bedre til å snakke?». */
const temaerForHvorfor: Record<string, Tema[]> = {
  jobb: ['mote', 'intervju', 'presentasjon'],
  studier: ['presentasjon', 'diskusjon', 'skriftlig'],
  sosialt: ['hverdag'],
  selvtillit: ['hverdag', 'presentasjon'],
  utvikling: ['hverdag', 'diskusjon'],
};

export const ordliste: Ord[] = [
  {
    ord: 'imponerende',
    ordklasse: 'adjektiv',
    betydning: 'Som gjør sterkt inntrykk; svært god eller stor.',
    eksempel: 'Presentasjonen hennes var imponerende godt forberedt.',
    eksempler: {
      hverdag: 'Det var imponerende at du rakk alt det på én helg.',
      presentasjon: 'Resultatene fra prosjektet er ganske imponerende, og her er hvorfor.',
    },
    synonymer: ['beundringsverdig', 'bemerkelsesverdig', 'storartet'],
    erstatter: ['bra', 'kult', 'veldig bra'],
    temaer: ['hverdag', 'presentasjon'],
    hjelperMot: ['samme-ord'],
  },
  {
    ord: 'utfordrende',
    ordklasse: 'adjektiv',
    betydning: 'Krevende, men på en måte som får deg til å strekke deg.',
    eksempel: 'Det første semesteret var utfordrende, men lærerikt.',
    eksempler: {
      intervju: 'Det mest utfordrende prosjektet jeg har hatt, lærte meg å planlegge bedre.',
      mote: 'Tidsfristen er utfordrende, så vi bør prioritere de viktigste oppgavene.',
      hverdag: 'Det har vært en utfordrende uke, men nå er det helg.',
    },
    synonymer: ['krevende', 'vanskelig', 'tøff'],
    erstatter: ['vanskelig', 'hardt'],
    temaer: ['intervju', 'mote', 'hverdag'],
    hjelperMot: ['samme-ord'],
  },
  {
    ord: 'tydeliggjøre',
    ordklasse: 'verb',
    betydning: 'Gjøre noe klarere og lettere å forstå.',
    eksempel: 'Kan du tydeliggjøre hva du mener med det?',
    eksempler: {
      mote: 'La meg tydeliggjøre hva vi faktisk ble enige om sist.',
      diskusjon: 'Kan du tydeliggjøre hva du mener med det?',
      skriftlig: 'Jeg vil bare tydeliggjøre hva jeg trenger fra deg innen fredag.',
    },
    synonymer: ['klargjøre', 'presisere', 'belyse'],
    erstatter: ['forklare', 'si bedre'],
    temaer: ['mote', 'diskusjon', 'skriftlig'],
    hjelperMot: ['presis'],
  },
  {
    ord: 'vesentlig',
    ordklasse: 'adjektiv',
    betydning: 'Som har stor betydning; viktig for helheten.',
    eksempel: 'Det er en vesentlig forskjell på de to løsningene.',
    eksempler: {
      mote: 'Det vesentlige nå er at kunden får svar i dag.',
      diskusjon: 'Det er en vesentlig forskjell på å være uenig og å være uhøflig.',
      presentasjon: 'Den vesentligste endringen ser dere på neste lysbilde.',
    },
    synonymer: ['avgjørende', 'betydelig', 'sentral'],
    erstatter: ['viktig', 'stor'],
    temaer: ['mote', 'diskusjon', 'presentasjon'],
    hjelperMot: ['samme-ord', 'presis'],
  },
  {
    ord: 'nysgjerrighet',
    ordklasse: 'substantiv',
    betydning: 'Lyst til å vite mer eller oppdage noe nytt.',
    eksempel: 'Nysgjerrigheten drev ham til å lese videre.',
    eksempler: {
      intervju: 'Det var nysgjerrighet som fikk meg til å søke på akkurat denne stillingen.',
      hverdag: 'Av ren nysgjerrighet: hvordan havnet du i det yrket?',
    },
    synonymer: ['vitebegjær', 'interesse', 'undring'],
    erstatter: ['interesse'],
    temaer: ['intervju', 'hverdag'],
  },
  {
    ord: 'påfallende',
    ordklasse: 'adjektiv',
    betydning: 'Som lett blir lagt merke til; slående.',
    eksempel: 'Det var påfallende stille i rommet.',
    eksempler: {
      presentasjon: 'Det som er påfallende i tallene, er hvor raskt veksten kom.',
      diskusjon: 'Det er påfallende at ingen har nevnt kostnadene.',
    },
    synonymer: ['slående', 'iøynefallende', 'merkbar'],
    erstatter: ['rar', 'veldig', 'tydelig'],
    temaer: ['presentasjon', 'diskusjon'],
    hjelperMot: ['samme-ord'],
  },
  {
    ord: 'reflektere',
    ordklasse: 'verb',
    betydning: 'Tenke grundig over noe.',
    eksempel: 'Jeg har reflektert over det du sa i går.',
    eksempler: {
      intervju: 'Etter prosjektet reflekterte jeg over hva jeg ville gjort annerledes.',
      hverdag: 'Jeg har reflektert litt over det du sa i går.',
    },
    synonymer: ['grunne', 'overveie', 'tenke gjennom'],
    erstatter: ['tenke'],
    temaer: ['intervju', 'hverdag'],
  },
  {
    ord: 'ansvarsbevisst',
    ordklasse: 'adjektiv',
    betydning: 'Som tar ansvar på alvor og følger opp det man har lovet.',
    eksempel: 'Hun er ansvarsbevisst og gjør alltid ferdig det hun begynner på.',
    eksempler: {
      intervju: 'Tidligere ledere beskriver meg som ansvarsbevisst og løsningsorientert.',
    },
    synonymer: ['pliktoppfyllende', 'pålitelig', 'samvittighetsfull'],
    erstatter: ['flink', 'seriøs'],
    temaer: ['intervju'],
    hjelperMot: ['finne-ord'],
  },
  {
    ord: 'løsningsorientert',
    ordklasse: 'adjektiv',
    betydning: 'Som ser etter måter å løse et problem på, i stedet for å bli værende i problemet.',
    eksempel: 'Teamet var løsningsorientert selv da planen sprakk.',
    eksempler: {
      intervju: 'Jeg er løsningsorientert: når noe går galt, spør jeg først hva vi kan gjøre nå.',
      mote: 'La oss være løsningsorienterte og se på hva vi kan få til innen fristen.',
    },
    synonymer: ['handlekraftig', 'konstruktiv', 'praktisk anlagt'],
    erstatter: ['flink til å fikse ting'],
    temaer: ['intervju', 'mote'],
    hjelperMot: ['presis'],
  },
  {
    ord: 'motivasjon',
    ordklasse: 'substantiv',
    betydning: 'Det som gir deg lyst og driv til å gjøre noe.',
    eksempel: 'Motivasjonen kommer ofte etter at man har begynt.',
    eksempler: {
      intervju: 'Min største motivasjon er å se at arbeidet mitt gjør en forskjell for brukerne.',
      hverdag: 'Jeg har ikke hatt motivasjon til å trene denne uken.',
    },
    synonymer: ['drivkraft', 'pågangsmot', 'inspirasjon'],
    erstatter: ['lyst'],
    temaer: ['intervju', 'hverdag'],
  },
  {
    ord: 'prioritere',
    ordklasse: 'verb',
    betydning: 'Bestemme hva som er viktigst, og gjøre det først.',
    eksempel: 'Vi må prioritere de oppgavene som haster mest.',
    eksempler: {
      mote: 'Hvis vi bare rekker én ting denne uken, foreslår jeg at vi prioriterer testingen.',
      intervju: 'Når jeg har mye å gjøre, prioriterer jeg ut fra frister og hva som påvirker flest.',
    },
    synonymer: ['vektlegge', 'sette først', 'rangere'],
    erstatter: ['gjøre først', 'fokusere på'],
    temaer: ['mote', 'intervju'],
    hjelperMot: ['presis'],
  },
  {
    ord: 'forankre',
    ordklasse: 'verb',
    betydning: 'Sørge for at en beslutning har støtte hos de som berøres.',
    eksempel: 'Planen må forankres i ledelsen før vi går videre.',
    eksempler: {
      mote: 'Før vi bestemmer oss, bør vi forankre forslaget hos resten av avdelingen.',
    },
    synonymer: ['få støtte for', 'sikre oppslutning om', 'avklare med'],
    erstatter: ['sjekke med', 'få med på'],
    temaer: ['mote'],
  },
  {
    ord: 'oppsummere',
    ordklasse: 'verb',
    betydning: 'Gjenta det viktigste kort og samlet.',
    eksempel: 'Kan noen oppsummere hva vi har bestemt?',
    eksempler: {
      mote: 'For å oppsummere: Ali tar kunden, og jeg sender referatet i dag.',
      presentasjon: 'For å oppsummere har vi sett på tre ting: problemet, løsningen og prisen.',
      skriftlig: 'Kort oppsummert: vi trenger svar innen fredag.',
    },
    synonymer: ['sammenfatte', 'summere opp', 'gjengi kort'],
    erstatter: ['si på nytt', 'det jeg mente var'],
    temaer: ['mote', 'presentasjon', 'skriftlig'],
    hjelperMot: ['presis', 'fyllord'],
  },
  {
    ord: 'illustrere',
    ordklasse: 'verb',
    betydning: 'Vise eller forklare noe med et eksempel eller bilde.',
    eksempel: 'La meg illustrere poenget med en historie.',
    eksempler: {
      presentasjon: 'For å illustrere hvor stort problemet er, kan vi se på denne grafen.',
      diskusjon: 'La meg illustrere det med et eksempel fra min egen hverdag.',
    },
    synonymer: ['anskueliggjøre', 'vise', 'eksemplifisere'],
    erstatter: ['vise', 'forklare'],
    temaer: ['presentasjon', 'diskusjon'],
    hjelperMot: ['fyllord'],
  },
  {
    ord: 'avgjørende',
    ordklasse: 'adjektiv',
    betydning: 'Som bestemmer utfallet; helt nødvendig.',
    eksempel: 'Det var et avgjørende øyeblikk i kampen.',
    eksempler: {
      presentasjon: 'Det avgjørende spørsmålet er: hva skjer hvis vi ikke gjør noe?',
      diskusjon: 'Jeg mener tid er den avgjørende faktoren her, ikke penger.',
    },
    synonymer: ['utslagsgivende', 'kritisk', 'vesentlig'],
    erstatter: ['veldig viktig', 'superviktig'],
    temaer: ['presentasjon', 'diskusjon'],
    hjelperMot: ['samme-ord'],
  },
  {
    ord: 'engasjere',
    ordklasse: 'verb',
    betydning: 'Vekke interesse og få folk til å bry seg.',
    eksempel: 'Saken engasjerer mange unge.',
    eksempler: {
      presentasjon: 'Jeg starter med et spørsmål for å engasjere salen fra første minutt.',
      hverdag: 'Det er tydelig at musikk engasjerer deg.',
    },
    synonymer: ['fenge', 'begeistre', 'interessere'],
    erstatter: ['gjøre interessert', 'få folk med'],
    temaer: ['presentasjon', 'hverdag'],
  },
  {
    ord: 'argumentere',
    ordklasse: 'verb',
    betydning: 'Gi grunner for det man mener.',
    eksempel: 'Hun argumenterte godt for forslaget sitt.',
    eksempler: {
      diskusjon: 'Jeg vil argumentere for det motsatte, og her er to grunner.',
      mote: 'Kan du argumentere litt mer for hvorfor vi bør velge det alternativet?',
    },
    synonymer: ['begrunne', 'underbygge', 'føre bevis for'],
    erstatter: ['si hvorfor', 'mase om'],
    temaer: ['diskusjon', 'mote'],
  },
  {
    ord: 'nyansere',
    ordklasse: 'verb',
    betydning: 'Vise at noe er mer sammensatt enn det først ser ut.',
    eksempel: 'Jeg vil gjerne nyansere bildet litt.',
    eksempler: {
      diskusjon: 'Jeg er enig i hovedpoenget, men vil nyansere det litt.',
      skriftlig: 'Takk for innspillet. Jeg vil bare nyansere ett punkt.',
    },
    synonymer: ['utdype', 'modifisere', 'differensiere'],
    erstatter: ['ja, men', 'det er ikke helt sånn'],
    temaer: ['diskusjon', 'skriftlig'],
    hjelperMot: ['presis'],
  },
  {
    ord: 'standpunkt',
    ordklasse: 'substantiv',
    betydning: 'Det man mener om en sak.',
    eksempel: 'Hun har endret standpunkt etter debatten.',
    eksempler: {
      diskusjon: 'Mitt standpunkt er at vi bør vente til vi vet mer.',
    },
    synonymer: ['syn', 'holdning', 'oppfatning'],
    erstatter: ['mening', 'det jeg tenker'],
    temaer: ['diskusjon'],
    hjelperMot: ['finne-ord', 'samme-ord'],
  },
  {
    ord: 'tilbakemelding',
    ordklasse: 'substantiv',
    betydning: 'Svar eller vurdering på noe man har gjort.',
    eksempel: 'Takk for en god tilbakemelding.',
    eksempler: {
      skriftlig: 'Jeg setter pris på en kort tilbakemelding når du har sett på utkastet.',
      mote: 'Har noen tilbakemeldinger før vi går videre?',
      intervju: 'Jeg ber ofte om tilbakemelding, fordi det gjør meg bedre raskere.',
    },
    synonymer: ['respons', 'innspill', 'vurdering'],
    erstatter: ['svar', 'hva du synes'],
    temaer: ['skriftlig', 'mote', 'intervju'],
  },
  {
    ord: 'henvendelse',
    ordklasse: 'substantiv',
    betydning: 'Det at man tar kontakt med noen, f.eks. med et spørsmål.',
    eksempel: 'Takk for henvendelsen.',
    eksempler: {
      skriftlig: 'Takk for henvendelsen. Jeg kommer tilbake til deg innen i morgen.',
    },
    synonymer: ['forespørsel', 'kontakt', 'spørsmål'],
    erstatter: ['meldingen din', 'at du spurte'],
    temaer: ['skriftlig'],
  },
  {
    ord: 'avklare',
    ordklasse: 'verb',
    betydning: 'Gjøre noe klart, så det ikke er tvil lenger.',
    eksempel: 'Vi må avklare hvem som har ansvaret.',
    eksempler: {
      skriftlig: 'Kan vi ta en rask prat for å avklare de siste detaljene?',
      mote: 'Før vi går, vil jeg avklare hvem som gjør hva.',
      hverdag: 'Bare for å avklare: møtes vi klokka sju eller åtte?',
    },
    synonymer: ['klargjøre', 'oppklare', 'få på det rene'],
    erstatter: ['finne ut av', 'sjekke'],
    temaer: ['skriftlig', 'mote', 'hverdag'],
    hjelperMot: ['presis'],
  },
  {
    ord: 'koselig',
    ordklasse: 'adjektiv',
    betydning: 'Hyggelig og trivelig, så man føler seg vel.',
    eksempel: 'Det var en koselig kveld.',
    eksempler: {
      hverdag: 'Så koselig at du tok deg tid til å komme innom.',
    },
    synonymer: ['hyggelig', 'trivelig', 'lun'],
    erstatter: ['fint', 'kult', 'bra'],
    temaer: ['hverdag'],
    hjelperMot: ['samme-ord'],
  },
  {
    ord: 'spontan',
    ordklasse: 'adjektiv',
    betydning: 'Som skjer uten planlegging, ut fra lyst eller innfall.',
    eksempel: 'Vi tok en spontan tur til sjøen.',
    eksempler: {
      hverdag: 'Har du lyst på en spontan middag i kveld?',
    },
    synonymer: ['impulsiv', 'umiddelbar', 'uplanlagt'],
    erstatter: ['plutselig', 'bare sånn'],
    temaer: ['hverdag'],
  },
  {
    ord: 'egentlig',
    ordklasse: 'adverb',
    betydning: 'I virkeligheten; når man tenker nærmere etter. Brukes bevisst, ikke som fyllord.',
    eksempel: 'Hva er det egentlig du lurer på?',
    eksempler: {
      hverdag: 'Hva er det egentlig du har lyst til å gjøre i helgen?',
      diskusjon: 'Hva handler denne saken egentlig om?',
    },
    synonymer: ['i grunnen', 'faktisk', 'i bunn og grunn'],
    erstatter: ['liksom', 'på en måte'],
    temaer: ['hverdag', 'diskusjon'],
    hjelperMot: ['fyllord'],
  },
];

/** Antall hele dager siden nyttår for en kalenderdato. Samme tall for alle brukere samme dag. */
function dagNummer(dato: Date): number {
  // Bruker kalenderdatoen (år, måned, dag) i stedet for millisekunder i lokal tid,
  // slik at sommertid ikke flytter ordbyttet bort fra midnatt.
  const iDag = Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate());
  const nyttar = Date.UTC(dato.getFullYear(), 0, 1);
  return (iDag - nyttar) / 86_400_000;
}

/**
 * Situasjonene brukeren vil øve på. Det brukeren har valgt på «Hvor vil du snakke bedre?»
 * gjelder. Har brukeren ikke valgt noe der, bruker vi svaret på «Hvorfor».
 */
export function brukerensTemaer(maal?: MaalSvar): Tema[] {
  if (!maal) return [];
  const valgte = maal.situasjoner.filter((s): s is Tema => s in temaNavn);
  if (valgte.length > 0) return valgte;
  return [...new Set(maal.hvorfor.flatMap((h) => temaerForHvorfor[h] ?? []))];
}

export type DagensOrd = {
  ord: Ord;
  /** Eksempelet som passer best til brukeren. */
  eksempel: string;
  /** Situasjonen ordet er valgt for, hvis det er tilpasset. */
  tema?: Tema;
  /** Et råd ut fra hva brukeren synes er vanskeligst. */
  tips?: string;
};

/**
 * Velger dagens ord.
 *
 * Uten målsvar får alle samme ord. Med målsvar velges ordet blant de som passer til
 * situasjonene brukeren vil øve på, og ord som hjelper mot brukerens utfordringer kommer
 * oftere. Samme bruker får samme ord hele dagen.
 */
export function dagensOrd(dato: Date = new Date(), maal?: MaalSvar): DagensOrd {
  const dag = dagNummer(dato);
  const temaer = brukerensTemaer(maal);
  const utfordringer = (maal?.utfordring ?? []) as Utfordring[];

  if (temaer.length === 0) {
    const ord = ordliste[dag % ordliste.length];
    return { ord, eksempel: ord.eksempel, tips: tipsFor(utfordringer, dag) };
  }

  // Ord som passer til minst én situasjon. Ord som også hjelper mot en utfordring
  // legges inn én gang til, så de dukker opp oftere.
  const passer = ordliste.filter((ord) => ord.temaer.some((t) => temaer.includes(t)));
  const hjelper = passer.filter((ord) => ord.hjelperMot?.some((u) => utfordringer.includes(u)));
  const utvalg = medEkstraOrd(passer, hjelper);
  const kandidater = utvalg.length > 0 ? utvalg : ordliste;
  const ord = kandidater[dag % kandidater.length];

  // Første situasjon (i brukerens rekkefølge) som ordet har et eget eksempel for.
  const tema = temaer.find((t) => ord.eksempler[t]) ?? temaer.find((t) => ord.temaer.includes(t));
  const eksempel = (tema && ord.eksempler[tema]) ?? ord.eksempel;

  return { ord, eksempel, tema, tips: tipsFor(utfordringer, dag) };
}

/**
 * Legger hvert ekstra ord inn én gang til i listen, spredt utover og aldri ved siden av
 * seg selv (heller ikke mellom siste og første plass, siden listen går i ring).
 * Da får man aldri samme ord to dager på rad.
 */
function medEkstraOrd(liste: Ord[], ekstra: Ord[]): Ord[] {
  const utvalg = [...liste];
  ekstra.forEach((ord, j) => {
    const start = Math.round(((j + 1) * utvalg.length) / (ekstra.length + 1));
    for (let forsok = 0; forsok < utvalg.length; forsok++) {
      const i = (start + forsok) % utvalg.length;
      const forrige = utvalg[(i - 1 + utvalg.length) % utvalg.length];
      if (forrige !== ord && utvalg[i] !== ord) {
        utvalg.splice(i, 0, ord);
        return;
      }
    }
  });
  return utvalg;
}

/** Bytter mellom rådene for brukerens utfordringer fra dag til dag. */
function tipsFor(utfordringer: Utfordring[], dag: number): string | undefined {
  const gyldige = utfordringer.filter((u) => u in utfordringTips);
  if (gyldige.length === 0) return undefined;
  return utfordringTips[gyldige[dag % gyldige.length]];
}
