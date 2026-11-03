/**
 * Scenarioer brukeren kan øve på.
 * Hvert scenario åpner øvingsskjermen (`src/app/ovelse.tsx`). Senere kan vi legge til opptak og muntlig tilbakemelding.
 */

export type Scenario = {
  id: string;
  tittel: string;
  beskrivelse: string;
  oppgave: string;
};

export const scenarioer: Scenario[] = [
  {
    id: 'jobbintervju',
    tittel: 'Jobbintervju',
    beskrivelse: 'Presenter deg selv og svar på typiske intervjuspørsmål.',
    oppgave: 'Fortell om en gang du løste et vanskelig problem.',
  },
  {
    id: 'presentasjon',
    tittel: 'Presentasjon',
    beskrivelse: 'Forklar et tema tydelig for en gruppe.',
    oppgave: 'Forklar på ett minutt hva du studerer og hvorfor.',
  },
  {
    id: 'smalltalk',
    tittel: 'Small talk',
    beskrivelse: 'Hold en uformell samtale i gang.',
    oppgave: 'Fortell om den beste opplevelsen din denne måneden.',
  },
  {
    id: 'uenighet',
    tittel: 'Være uenig',
    beskrivelse: 'Si din mening høflig og saklig.',
    oppgave: 'Argumenter for eller mot mobilforbud i skolen.',
  },
];
