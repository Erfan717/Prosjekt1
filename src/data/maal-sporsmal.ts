/** Ett svaralternativ på et spørsmål om målene dine. */
export type Alternativ = {
  id: string;
  tekst: string;
  /** Kort forklaring under alternativet (valgfritt). */
  hint?: string;
};

export type Sporsmal = {
  id: 'hvorfor' | 'situasjoner' | 'utfordring' | 'tid';
  tittel: string;
  tekst: string;
  /** `true` hvis man kan velge flere alternativer. */
  flervalg: boolean;
  alternativer: Alternativ[];
};

/** Svarene brukeren har gitt: alternativ-id-er per spørsmål. */
export type MaalSvar = Record<Sporsmal['id'], string[]>;

/**
 * Spørsmålene man får rett etter registrering.
 * Svarene brukes senere til å velge ord, scenarioer og hvor mye øving appen foreslår.
 */
export const maalSporsmal: Sporsmal[] = [
  {
    id: 'hvorfor',
    tittel: 'Hvorfor vil du bli bedre til å snakke?',
    tekst: 'Velg alt som passer.',
    flervalg: true,
    alternativer: [
      { id: 'jobb', tekst: 'Jobb og karriere' },
      { id: 'studier', tekst: 'Studier og skole' },
      { id: 'sosialt', tekst: 'Samtaler med venner og nye folk' },
      { id: 'selvtillit', tekst: 'Mer selvtillit når jeg snakker' },
      { id: 'utvikling', tekst: 'Personlig utvikling' },
    ],
  },
  {
    id: 'situasjoner',
    tittel: 'Hvor vil du snakke bedre?',
    tekst: 'Vi lager øvingsscenarioer ut fra dette. Velg alt som passer.',
    flervalg: true,
    alternativer: [
      { id: 'hverdag', tekst: 'Hverdagsprat' },
      { id: 'mote', tekst: 'Møter på jobb' },
      { id: 'intervju', tekst: 'Jobbintervju' },
      { id: 'presentasjon', tekst: 'Presentasjoner og foredrag' },
      { id: 'diskusjon', tekst: 'Diskusjoner og debatter' },
      { id: 'skriftlig', tekst: 'Skriftlig, f.eks. e-post og meldinger' },
    ],
  },
  {
    id: 'utfordring',
    tittel: 'Hva synes du er vanskeligst i dag?',
    tekst: 'Velg alt som passer.',
    flervalg: true,
    alternativer: [
      { id: 'finne-ord', tekst: 'Å finne de rette ordene', hint: 'Ordet er «på tungen», men kommer ikke.' },
      { id: 'samme-ord', tekst: 'Jeg bruker de samme ordene hele tiden' },
      { id: 'fyllord', tekst: 'For mange fyllord', hint: '«eh», «liksom», «på en måte»' },
      { id: 'presis', tekst: 'Å si ting kort og presist' },
      { id: 'nerver', tekst: 'Jeg blir nervøs når jeg snakker' },
    ],
  },
  {
    id: 'tid',
    tittel: 'Hvor mye tid vil du øve hver dag?',
    tekst: 'Du kan endre dette senere.',
    flervalg: false,
    alternativer: [
      { id: '5', tekst: '5 minutter', hint: 'Lett: dagens ord og en rask øvelse' },
      { id: '10', tekst: '10 minutter', hint: 'Vanlig: ord, repetisjon og ett scenario' },
      { id: '15', tekst: '15 minutter', hint: 'Seriøs: flere scenarioer hver dag' },
      { id: '20', tekst: '20 minutter eller mer', hint: 'Intens: for deg som vil raskt fremover' },
    ],
  },
];
