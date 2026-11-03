import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/** Brukeren som er registrert på denne enheten. */
export type Bruker = {
  navn: string;
  epost: string;
};

type BrukerKontekst = {
  bruker: Bruker | null;
  registrer: (bruker: Bruker) => void;
  loggUt: () => void;
};

const Kontekst = createContext<BrukerKontekst | null>(null);

/**
 * Holder styr på hvem som er logget inn.
 *
 * Foreløpig ligger brukeren bare i minnet, så du må registrere deg på nytt når appen
 * startes helt på nytt. Senere bytter vi dette ut med ekte innlogging (f.eks. Supabase)
 * uten at skjermene trenger å endres.
 */
export function BrukerProvider({ children }: { children: ReactNode }) {
  const [bruker, setBruker] = useState<Bruker | null>(null);

  const verdi = useMemo<BrukerKontekst>(
    () => ({
      bruker,
      registrer: (ny) => setBruker(ny),
      loggUt: () => setBruker(null),
    }),
    [bruker],
  );

  return <Kontekst.Provider value={verdi}>{children}</Kontekst.Provider>;
}

export function useBruker() {
  const verdi = useContext(Kontekst);
  if (!verdi) throw new Error('useBruker må brukes inni <BrukerProvider>');
  return verdi;
}
