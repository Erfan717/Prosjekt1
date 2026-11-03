import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { MaalSvar } from '@/data/maal-sporsmal';
import { fjernAlt, hent, lagre, Nokler } from '@/lib/lagring';

/** Brukeren som er registrert på denne enheten. */
export type Bruker = {
  navn: string;
  epost: string;
  /** Svarene på målspørsmålene etter registrering. Mangler til man har svart. */
  maal?: MaalSvar;
};

type BrukerKontekst = {
  bruker: Bruker | null;
  /** `true` mens vi henter den lagrede brukeren når appen starter. */
  laster: boolean;
  registrer: (bruker: Bruker) => void;
  lagreMaal: (maal: MaalSvar) => void;
  loggUt: () => void;
};

const Kontekst = createContext<BrukerKontekst | null>(null);

/**
 * Holder styr på hvem som er logget inn.
 *
 * Brukeren og målsvarene lagres på telefonen (se `src/lib/lagring.ts`), så appen husker
 * deg neste gang den åpnes. Senere kan vi bytte til ekte innlogging (f.eks. Supabase)
 * uten at skjermene trenger å endres.
 */
export function BrukerProvider({ children }: { children: ReactNode }) {
  const [bruker, setBruker] = useState<Bruker | null>(null);
  const [laster, setLaster] = useState(true);

  // Hent lagret bruker én gang når appen starter.
  useEffect(() => {
    hent<Bruker>(Nokler.bruker).then((lagret) => {
      setBruker(lagret);
      setLaster(false);
    });
  }, []);

  const verdi = useMemo<BrukerKontekst>(() => {
    const oppdater = (ny: Bruker) => {
      setBruker(ny);
      void lagre(Nokler.bruker, ny);
    };
    return {
      bruker,
      laster,
      registrer: oppdater,
      lagreMaal: (maal) => {
        if (bruker) oppdater({ ...bruker, maal });
      },
      loggUt: () => {
        setBruker(null);
        void fjernAlt();
      },
    };
  }, [bruker, laster]);

  return <Kontekst.Provider value={verdi}>{children}</Kontekst.Provider>;
}

export function useBruker() {
  const verdi = useContext(Kontekst);
  if (!verdi) throw new Error('useBruker må brukes inni <BrukerProvider>');
  return verdi;
}
