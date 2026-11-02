# Ordforråd

En mobilapp for iOS og Android som hjelper deg å få et bredere norsk ordforråd og bli tryggere når du snakker. Planen og konseptet ligger i [plan-dokumentet](https://claude.ai/artifact/MZAohBXGzkcMxmeTX5Rdms).

Bygget med [Expo](https://expo.dev) og React Native (TypeScript).

## Kom i gang

Du trenger [Node.js](https://nodejs.org) (versjon 20 eller nyere) og appen **Expo Go** på mobilen din (App Store / Google Play).

```bash
npm install     # installerer avhengigheter (første gang)
npm start       # starter utviklingsserveren
```

Skann QR-koden i terminalen med kameraet (iPhone) eller Expo Go-appen (Android). Appen åpnes på mobilen, og endringer du lagrer i koden vises med en gang.

Andre nyttige kommandoer:

```bash
npm run typecheck   # sjekker TypeScript-feil
npm run web         # åpner appen i nettleseren
```

## Mappestruktur

```
src/
  app/            Skjermene. Hver fil her blir en side (Expo Router).
    _layout.tsx   Rammen rundt appen (fanemenyen).
    index.tsx     Dagens ord
    ov.tsx        Øv på å snakke (scenarioer)
    fremgang.tsx  Fremgang
  components/     Gjenbrukbare byggeklosser (tekst, fanemeny osv.)
  constants/      Farger og avstander
  data/           Ordliste og scenarioer (flyttes til database senere)
  hooks/          Små hjelpefunksjoner for React
```

## Status

Dette er grunnmuren. Neste steg i planen:

1. Lagre ord og repetisjon (spaced repetition)
2. «Oppgrader ordet»-søk
3. Supabase for innlogging og database
4. Muntlig svar og AI-tilbakemelding i scenarioene
