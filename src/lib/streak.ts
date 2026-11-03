/**
 * Regner ut «dager på rad» og ukeoversikten fra listen over dager man har vært aktiv.
 *
 * En dag lagres som tekst på formen `ÅÅÅÅ-MM-DD` i lokal tid, så sommertid og
 * tidssoner ikke gjør at en dag telles to ganger eller hoppes over.
 */

/** Gjør en dato om til `ÅÅÅÅ-MM-DD` i lokal tid. */
export function datoNokkel(dato: Date): string {
  const aar = dato.getFullYear();
  const maaned = String(dato.getMonth() + 1).padStart(2, '0');
  const dag = String(dato.getDate()).padStart(2, '0');
  return `${aar}-${maaned}-${dag}`;
}

/** Samme klokkeslett-uavhengige dag flyttet `antall` dager frem (eller tilbake med negativt tall). */
function flyttDager(dato: Date, antall: number): Date {
  return new Date(dato.getFullYear(), dato.getMonth(), dato.getDate() + antall);
}

/**
 * Antall dager på rad man har vært aktiv.
 *
 * Har du ikke øvd i dag ennå, teller rekken fra i går, så den ikke nullstilles
 * om morgenen før du har rukket å åpne appen. Den brytes først når en hel dag går tom.
 */
export function dagerPaRad(aktiveDager: readonly string[], iDag: Date = new Date()): number {
  const sett = new Set(aktiveDager);
  let dag = sett.has(datoNokkel(iDag)) ? iDag : flyttDager(iDag, -1);
  let antall = 0;
  while (sett.has(datoNokkel(dag))) {
    antall++;
    dag = flyttDager(dag, -1);
  }
  return antall;
}

/** Den lengste rekken med dager på rad noensinne. */
export function lengsteRekke(aktiveDager: readonly string[]): number {
  const sortert = [...new Set(aktiveDager)].sort();
  let lengste = 0;
  let naa = 0;
  let forrige: string | null = null;
  for (const dag of sortert) {
    const [aar, maaned, dato] = dag.split('-').map(Number);
    const gaarDagen = datoNokkel(new Date(aar, maaned - 1, dato - 1));
    naa = forrige === gaarDagen ? naa + 1 : 1;
    lengste = Math.max(lengste, naa);
    forrige = dag;
  }
  return lengste;
}

/** Sju verdier, mandag først: om du var aktiv den dagen denne uken. */
export function denneUken(aktiveDager: readonly string[], iDag: Date = new Date()): boolean[] {
  const sett = new Set(aktiveDager);
  // getDay() gir 0 for søndag. Vi vil ha mandag = 0.
  const ukedag = (iDag.getDay() + 6) % 7;
  const mandag = flyttDager(iDag, -ukedag);
  return Array.from({ length: 7 }, (_, i) => sett.has(datoNokkel(flyttDager(mandag, i))));
}
