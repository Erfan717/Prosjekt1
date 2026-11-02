/**
 * Startordliste for "Dagens ord".
 * Hvert ord har en betydning, et eksempel, synonymer og de enkle ordene det kan erstatte.
 * Senere flytter vi listen til databasen (Supabase) og utvider den.
 */

export type Ord = {
  ord: string;
  ordklasse: 'adjektiv' | 'verb' | 'substantiv' | 'adverb';
  betydning: string;
  eksempel: string;
  synonymer: string[];
  erstatter: string[];
};

export const ordliste: Ord[] = [
  {
    ord: 'imponerende',
    ordklasse: 'adjektiv',
    betydning: 'Som gjør sterkt inntrykk; svært god eller stor.',
    eksempel: 'Presentasjonen hennes var imponerende godt forberedt.',
    synonymer: ['beundringsverdig', 'bemerkelsesverdig', 'storartet'],
    erstatter: ['bra', 'kult', 'veldig bra'],
  },
  {
    ord: 'utfordrende',
    ordklasse: 'adjektiv',
    betydning: 'Krevende, men på en måte som får deg til å strekke deg.',
    eksempel: 'Det første semesteret var utfordrende, men lærerikt.',
    synonymer: ['krevende', 'vanskelig', 'tøff'],
    erstatter: ['vanskelig', 'hardt'],
  },
  {
    ord: 'tydeliggjøre',
    ordklasse: 'verb',
    betydning: 'Gjøre noe klarere og lettere å forstå.',
    eksempel: 'Kan du tydeliggjøre hva du mener med det?',
    synonymer: ['klargjøre', 'presisere', 'belyse'],
    erstatter: ['forklare', 'si bedre'],
  },
  {
    ord: 'vesentlig',
    ordklasse: 'adjektiv',
    betydning: 'Som har stor betydning; viktig for helheten.',
    eksempel: 'Det er en vesentlig forskjell på de to løsningene.',
    synonymer: ['avgjørende', 'betydelig', 'sentral'],
    erstatter: ['viktig', 'stor'],
  },
  {
    ord: 'nysgjerrighet',
    ordklasse: 'substantiv',
    betydning: 'Lyst til å vite mer eller oppdage noe nytt.',
    eksempel: 'Nysgjerrigheten drev ham til å lese videre.',
    synonymer: ['vitebegjær', 'interesse', 'undring'],
    erstatter: ['interesse'],
  },
  {
    ord: 'påfallende',
    ordklasse: 'adjektiv',
    betydning: 'Som lett blir lagt merke til; slående.',
    eksempel: 'Det var påfallende stille i rommet.',
    synonymer: ['slående', 'iøynefallende', 'merkbar'],
    erstatter: ['rar', 'veldig', 'tydelig'],
  },
  {
    ord: 'reflektere',
    ordklasse: 'verb',
    betydning: 'Tenke grundig over noe.',
    eksempel: 'Jeg har reflektert over det du sa i går.',
    synonymer: ['grunne', 'overveie', 'tenke gjennom'],
    erstatter: ['tenke'],
  },
];

/** Velger samme ord for alle brukere på en gitt dag. */
export function dagensOrd(dato: Date = new Date()): Ord {
  const startAvAret = new Date(dato.getFullYear(), 0, 0);
  const dagNummer = Math.floor((dato.getTime() - startAvAret.getTime()) / 86_400_000);
  return ordliste[dagNummer % ordliste.length];
}
