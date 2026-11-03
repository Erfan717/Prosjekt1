import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';

import { useBruker } from '@/hooks/bruker';
import { Nokler, useLagret } from '@/lib/lagring';
import { datoNokkel } from '@/lib/streak';

/** Det som lagres på telefonen om fremgangen din. */
export type FremgangData = {
  /** Dagene du har gjort noe i appen, som `ÅÅÅÅ-MM-DD`. */
  aktiveDager: string[];
  /** Ordene du har markert som lært. */
  laerteOrd: string[];
  /** Hvor mange øvelser du har fullført totalt. */
  ovelserFullfort: number;
  /** Siste dag du markerte dagens ord som lært, som `ÅÅÅÅ-MM-DD`. */
  sisteOrdDag?: string;
};

const tom: FremgangData = { aktiveDager: [], laerteOrd: [], ovelserFullfort: 0 };

type FremgangKontekst = FremgangData & {
  /** `true` til den lagrede fremgangen er hentet. */
  laster: boolean;
  /** Om du allerede har markert dagens ord som lært i dag. */
  harLaertIDag: () => boolean;
  /**
   * Markerer et ord som lært og teller dagen med i streaken.
   * Ordlisten går i ring, så et ord du har lært før kan komme igjen. Da teller dagen,
   * men «Ord lært» øker ikke.
   */
  registrerOrd: (ord: string) => void;
  /** Teller en fullført øvelse og dagen med i streaken. */
  registrerOvelse: () => void;
};

const Kontekst = createContext<FremgangKontekst | null>(null);

/** Legger til dagens dato i listen hvis den ikke er der fra før. */
function medIDag(dager: string[]): string[] {
  const iDag = datoNokkel(new Date());
  return dager.includes(iDag) ? dager : [...dager, iDag];
}

/**
 * Holder styr på streak, lærte ord og fullførte øvelser, og lagrer det på telefonen.
 * En dag teller i streaken så snart du har lært et ord eller fullført en øvelse.
 */
export function FremgangProvider({ children }: { children: ReactNode }) {
  const { bruker } = useBruker();
  const [data, setData, laster] = useLagret<FremgangData>(Nokler.fremgang, tom);

  // Når brukeren logger ut, slettes lagringen. Da nullstiller vi også det som ligger i minnet.
  const varInnlogget = useRef(bruker !== null);
  useEffect(() => {
    if (varInnlogget.current && bruker === null) setData(tom);
    varInnlogget.current = bruker !== null;
  }, [bruker, setData]);

  const verdi = useMemo<FremgangKontekst>(
    () => ({
      ...data,
      laster,
      harLaertIDag: () => data.sisteOrdDag === datoNokkel(new Date()),
      registrerOrd: (ord) =>
        setData((forrige) => ({
          ...forrige,
          aktiveDager: medIDag(forrige.aktiveDager),
          sisteOrdDag: datoNokkel(new Date()),
          laerteOrd: forrige.laerteOrd.includes(ord) ? forrige.laerteOrd : [...forrige.laerteOrd, ord],
        })),
      registrerOvelse: () =>
        setData((forrige) => ({
          ...forrige,
          aktiveDager: medIDag(forrige.aktiveDager),
          ovelserFullfort: forrige.ovelserFullfort + 1,
        })),
    }),
    [data, laster, setData],
  );

  return <Kontekst.Provider value={verdi}>{children}</Kontekst.Provider>;
}

export function useFremgang() {
  const verdi = useContext(Kontekst);
  if (!verdi) throw new Error('useFremgang må brukes inni <FremgangProvider>');
  return verdi;
}
