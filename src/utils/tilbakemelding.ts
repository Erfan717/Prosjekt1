/**
 * Enkel tilbakemelding på en setning eller et kort svar, som kjører helt lokalt på telefonen.
 * Den sjekker om dagens ord er brukt, om man bruker «enkle» ord som kan byttes ut,
 * fyllord, gjentakelser og lengde. Senere kan vi bytte ut eller utvide dette med en AI-tjeneste.
 */

import type { Ord } from '@/data/ord';

export type Punkt = {
  /** «bra» er noe som fungerer, «tips» er noe som kan bli bedre */
  type: 'bra' | 'tips';
  tekst: string;
};

export type Tilbakemelding = {
  brukteOrdet: boolean;
  nivaa: 'sterkt' | 'godt' | 'provIgjen';
  overskrift: string;
  punkter: Punkt[];
};

export type Ovelsestype = 'setning' | 'scenario';

/** Ord som ofte kan byttes ut med noe mer presist. Nøkkelen er ordet, verdien er tipset. */
const svakeOrd: Record<string, string> = {
  bra: 'Prøv et mer presist ord enn «bra», for eksempel «solid», «lovende» eller «gjennomtenkt».',
  kult: '«Kult» er muntlig. Prøv «spennende», «fascinerende» eller «imponerende».',
  greit: '«Greit» sier lite. Hva var det egentlig? Ryddig, enkelt, akseptabelt?',
  fint: '«Fint» er vagt. Prøv å beskrive hva som gjorde det fint.',
  ting: '«Ting» er vagt. Si hva du faktisk mener, så blir det tydeligere.',
};

/** Fyllord som gjør talen mindre tydelig. */
const fyllord = ['liksom', 'typ', 'sånn', 'egentlig', 'på en måte', 'eller noe'];

/** Små vanlige ord vi ikke teller som gjentakelser. */
const stoppord = new Set([
  'jeg', 'meg', 'min', 'mitt', 'mine', 'du', 'deg', 'din', 'han', 'hun', 'den', 'det', 'de', 'dem', 'vi', 'oss',
  'og', 'eller', 'men', 'som', 'at', 'for', 'til', 'fra', 'med', 'på', 'i', 'av', 'om', 'en', 'et', 'ei',
  'er', 'var', 'har', 'hadde', 'kan', 'vil', 'skal', 'ikke', 'så', 'når', 'hvor', 'hva', 'også', 'bare',
  'der', 'her', 'noe', 'mye', 'veldig', 'litt', 'blir', 'ble', 'være', 'vært', 'etter', 'over', 'under',
]);

/** Gjør teksten om til en liste med små bokstaver og bare ord. */
function tilOrd(tekst: string): string[] {
  return tekst.toLowerCase().match(/[a-zæøåéèêóòôüä]+/g) ?? [];
}

/**
 * Lager «stammer» for dagens ord, så bøyde former også teller.
 * F.eks. godtar vi «reflekterte» for «reflektere» og «nysgjerrigheten» for «nysgjerrighet».
 */
export function ordstammer(ord: Ord): string[] {
  const grunnord = ord.ord.toLowerCase();
  const stammer = [grunnord];
  if (ord.ordklasse === 'verb' && grunnord.endsWith('e')) {
    stammer.push(grunnord.slice(0, -1));
    // «gjøre» bøyes uregelmessig: gjorde, gjort.
    if (grunnord.endsWith('gjøre')) stammer.push(grunnord.slice(0, -5) + 'gjor');
  }
  return stammer;
}

function inneholderFrase(ordliste: string[], frase: string): boolean {
  const deler = tilOrd(frase);
  if (deler.length === 0) return false;
  for (let i = 0; i + deler.length <= ordliste.length; i++) {
    if (deler.every((d, j) => ordliste[i + j] === d)) return true;
  }
  return false;
}

/** Deler teksten i setninger på punktum, utropstegn og spørsmålstegn. */
function setninger(tekst: string): string[] {
  return tekst
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function giTilbakemelding(tekst: string, ord: Ord, type: Ovelsestype): Tilbakemelding {
  const renTekst = tekst.trim();
  const ordliste = tilOrd(renTekst);
  const bra: Punkt[] = [];
  const tips: Punkt[] = [];

  // 1. Brukte du dagens ord?
  const stammer = ordstammer(ord);
  const brukt = ordliste.find((o) => stammer.some((s) => o.startsWith(s)));
  const brukteOrdet = brukt !== undefined;
  if (brukt) {
    const form = brukt === ord.ord.toLowerCase() ? `«${ord.ord}»` : `«${brukt}», en form av «${ord.ord}»`;
    bra.push({ type: 'bra', tekst: `Du brukte ${form}. Godt jobbet!` });
  } else {
    const synonym = ord.synonymer.find((s) => inneholderFrase(ordliste, s) && !ord.erstatter.includes(s));
    tips.push({
      type: 'tips',
      tekst: synonym
        ? `Du brukte «${synonym}», som betyr nesten det samme. Prøv å bruke «${ord.ord}» i stedet.`
        : `Dagens ord «${ord.ord}» mangler. Prøv å få det med.`,
    });
  }

  // 2. Enkle ord som dagens ord kan erstatte.
  const erstattet = ord.erstatter.filter((e) => inneholderFrase(ordliste, e));
  for (const e of erstattet.slice(0, 1)) {
    tips.push({ type: 'tips', tekst: `Du skrev «${e}». Her kan «${ord.ord}» passe bedre.` });
  }

  // 3. Andre vage ord.
  const svakt = ordliste.find((o) => svakeOrd[o] && !erstattet.includes(o));
  if (svakt) tips.push({ type: 'tips', tekst: svakeOrd[svakt] });

  // 4. Fyllord.
  const fyll = fyllord.filter((f) => inneholderFrase(ordliste, f));
  if (fyll.length > 0) {
    tips.push({
      type: 'tips',
      tekst: `Fyllord som «${fyll[0]}» gjør budskapet svakere. Prøv å stryke det.`,
    });
  }
  const veldigAntall = ordliste.filter((o) => o === 'veldig').length;
  if (veldigAntall >= 2) {
    tips.push({
      type: 'tips',
      tekst: `Du skrev «veldig» ${veldigAntall} ganger. Et sterkere ord sier mer enn «veldig» + et svakt ord.`,
    });
  }

  // 5. Gjentakelser.
  const antall = new Map<string, number>();
  for (const o of ordliste) {
    if (o.length < 4 || stoppord.has(o)) continue;
    antall.set(o, (antall.get(o) ?? 0) + 1);
  }
  const gjentatt = [...antall].find(([, n]) => n >= 3);
  if (gjentatt) {
    tips.push({ type: 'tips', tekst: `Du gjentar «${gjentatt[0]}» ${gjentatt[1]} ganger. Prøv å variere.` });
  }

  // 6. Lengde og struktur.
  const deler = setninger(renTekst);
  if (type === 'setning') {
    if (ordliste.length < 5) tips.push({ type: 'tips', tekst: 'Setningen er kort. Legg til litt sammenheng rundt ordet.' });
    else if (brukteOrdet) bra.push({ type: 'bra', tekst: 'Setningen har god lengde og gir ordet sammenheng.' });
  } else {
    if (ordliste.length < 15) {
      tips.push({ type: 'tips', tekst: 'Svaret er kort. Prøv to–tre setninger: poenget, et eksempel og en avslutning.' });
    } else if (deler.length >= 2) {
      bra.push({ type: 'bra', tekst: `Du bygger opp svaret over ${deler.length} setninger. Det gjør det lett å følge.` });
    }
  }
  const langSetning = deler.find((s) => tilOrd(s).length > 30);
  if (langSetning) {
    tips.push({ type: 'tips', tekst: 'En av setningene er veldig lang. Del den opp, så blir den lettere å følge.' });
  }

  // 7. Stor forbokstav og tegn til slutt.
  if (renTekst.length > 0 && !/^[A-ZÆØÅÉ0-9«"]/.test(renTekst)) {
    tips.push({ type: 'tips', tekst: 'Begynn med stor forbokstav.' });
  }
  if (renTekst.length > 0 && !/[.!?»"]$/.test(renTekst)) {
    tips.push({ type: 'tips', tekst: 'Avslutt med punktum, utropstegn eller spørsmålstegn.' });
  }

  const viktigeTips = tips.slice(0, 4);
  let nivaa: Tilbakemelding['nivaa'];
  let overskrift: string;
  if (!brukteOrdet) {
    nivaa = 'provIgjen';
    overskrift = 'Nesten! Få med dagens ord';
  } else if (viktigeTips.length <= 1) {
    nivaa = 'sterkt';
    overskrift = 'Sterkt formulert';
  } else {
    nivaa = 'godt';
    overskrift = 'Godt på vei';
  }

  return { brukteOrdet, nivaa, overskrift, punkter: [...bra, ...viktigeTips] };
}
