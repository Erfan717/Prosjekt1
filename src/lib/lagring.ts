import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

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

/** Henter en lagret verdi. Gir `null` hvis ingenting er lagret eller dataene er ødelagt. */
export async function hent<T>(nokkel: Nokkel): Promise<T | null> {
  try {
    const tekst = await AsyncStorage.getItem(nokkel);
    return tekst === null ? null : (JSON.parse(tekst) as T);
  } catch (feil) {
    console.warn(`Klarte ikke å lese «${nokkel}» fra lagringen`, feil);
    return null;
  }
}

/** Lagrer en verdi (overskriver det som lå der fra før). */
export async function lagre<T>(nokkel: Nokkel, verdi: T): Promise<void> {
  try {
    await AsyncStorage.setItem(nokkel, JSON.stringify(verdi));
  } catch (feil) {
    console.warn(`Klarte ikke å lagre «${nokkel}»`, feil);
  }
}

/** Sletter én verdi. */
export async function fjern(nokkel: Nokkel): Promise<void> {
  try {
    await AsyncStorage.removeItem(nokkel);
  } catch (feil) {
    console.warn(`Klarte ikke å slette «${nokkel}»`, feil);
  }
}

/** Sletter alt appen har lagret, f.eks. ved utlogging. */
export async function fjernAlt(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(Nokler));
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

  useEffect(() => {
    let aktiv = true;
    hent<T>(nokkel).then((lagret) => {
      if (!aktiv) return;
      if (lagret !== null) setVerdi(lagret);
      setLaster(false);
    });
    return () => {
      aktiv = false;
    };
  }, [nokkel]);

  const oppdater = useCallback(
    (ny: T | ((forrige: T) => T)) => {
      setVerdi((forrige) => {
        const neste = typeof ny === 'function' ? (ny as (forrige: T) => T)(forrige) : ny;
        void lagre(nokkel, neste);
        return neste;
      });
    },
    [nokkel],
  );

  return [verdi, oppdater, laster] as const;
}
