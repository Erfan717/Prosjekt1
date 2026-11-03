import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Felles lagring på telefonen (AsyncStorage).
 *
 * Alt som skal huskes mellom hver gang appen åpnes, går gjennom denne filen.
 * Legg til en ny nøkkel i `Nokler` når du trenger å lagre noe nytt, så har alle
 * nøklene ett sted og ingen skriver over hverandre ved et uhell.
 *
 * Verdiene lagres som JSON. På web brukes nettleserens localStorage automatisk.
 */

/** Alle nøklene appen lagrer under. `v1` gjør det lett å bytte format senere. */
export const Nokler = {
  bruker: 'allin:v1:bruker',
  fremgang: 'allin:v1:fremgang',
  ovinger: 'allin:v1:ovinger',
} as const;

export type Nokkel = (typeof Nokler)[keyof typeof Nokler];

// Alle lese- og skriveoperasjoner står i kø og kjøres én etter én, i den rekkefølgen
// de ble startet. Da kan for eksempel ikke en utlogging slette en ny registrering
// som ble lagret rett etterpå.
let ko: Promise<unknown> = Promise.resolve();
function iKo<T>(oppgave: () => Promise<T>): Promise<T> {
  const resultat = ko.then(oppgave);
  ko = resultat.catch(() => undefined);
  return resultat;
}

/** Henter en lagret verdi. Gir `null` hvis ingenting er lagret eller dataene er ødelagt. */
export async function hent<T>(nokkel: Nokkel): Promise<T | null> {
  try {
    const tekst = await iKo(() => AsyncStorage.getItem(nokkel));
    return tekst === null ? null : (JSON.parse(tekst) as T);
  } catch (feil) {
    console.warn(`Klarte ikke å lese «${nokkel}» fra lagringen`, feil);
    return null;
  }
}

/** Lagrer en verdi (overskriver det som lå der fra før). */
export async function lagre<T>(nokkel: Nokkel, verdi: T): Promise<void> {
  try {
    await iKo(() => AsyncStorage.setItem(nokkel, JSON.stringify(verdi)));
  } catch (feil) {
    console.warn(`Klarte ikke å lagre «${nokkel}»`, feil);
  }
}

/** Sletter én verdi. */
export async function fjern(nokkel: Nokkel): Promise<void> {
  try {
    await iKo(() => AsyncStorage.removeItem(nokkel));
  } catch (feil) {
    console.warn(`Klarte ikke å slette «${nokkel}»`, feil);
  }
}

/** Sletter alt appen har lagret, f.eks. ved utlogging. */
export async function fjernAlt(): Promise<void> {
  try {
    await iKo(() => AsyncStorage.multiRemove(Object.values(Nokler)));
  } catch (feil) {
    console.warn('Klarte ikke å slette lagringen', feil);
  }
}

/**
 * Som `useState`, men verdien huskes på telefonen.
 *
 * ```tsx
 * const [fremgang, setFremgang, laster] = useLagret(Nokler.fremgang, { dagerPaRad: 0 });
 * ```
 *
 * `laster` er `true` til den lagrede verdien er hentet. Frem til da er verdien `standard`.
 * `setFremgang` tar enten en ny verdi eller en funksjon `(forrige) => ny`, akkurat som `useState`.
 */
export function useLagret<T>(nokkel: Nokkel, standard: T) {
  const [verdi, setVerdi] = useState<T>(standard);
  const [laster, setLaster] = useState(true);
  // Blir `true` første gang verdien endres fra appen. Da skal den lagres, og en
  // lagret verdi som kommer inn senere skal ikke overskrive endringen.
  const endret = useRef(false);

  useEffect(() => {
    let aktiv = true;
    hent<T>(nokkel).then((lagret) => {
      if (!aktiv) return;
      if (lagret !== null && !endret.current) setVerdi(lagret);
      setLaster(false);
    });
    return () => {
      aktiv = false;
    };
  }, [nokkel]);

  // Lagre etter at React har tatt i bruk den nye verdien.
  useEffect(() => {
    if (endret.current) void lagre(nokkel, verdi);
  }, [nokkel, verdi]);

  const oppdater = useCallback((ny: T | ((forrige: T) => T)) => {
    endret.current = true;
    setVerdi(ny as T | ((forrige: T) => T));
  }, []);

  return [verdi, oppdater, laster] as const;
}
