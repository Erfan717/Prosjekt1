import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { gradient } from '@/components/gradient';
import { ThemedText } from '@/components/themed-text';
import { Topptekst } from '@/components/ui';
import { Colors, Gradients, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { maalSporsmal, type Alternativ, type MaalSvar } from '@/data/maal-sporsmal';
import { useBruker } from '@/hooks/bruker';

const farger = Colors.dark;

const tommeSvar: MaalSvar = { hvorfor: [], situasjoner: [], utfordring: [], tid: [] };

/** Spør om mål og motivasjon, ett spørsmål om gangen, rett etter registrering. */
export default function MaalSkjerm() {
  const { bruker, lagreMaal } = useBruker();
  const [steg, setSteg] = useState(0);
  const [svar, setSvar] = useState<MaalSvar>(tommeSvar);

  const sporsmal = maalSporsmal[steg];
  const valgt = svar[sporsmal.id];
  const sisteSteg = steg === maalSporsmal.length - 1;
  const fornavn = bruker?.navn.split(' ')[0];

  function velg(id: string) {
    setSvar((naa) => {
      const forrige = naa[sporsmal.id];
      let neste: string[];
      if (!sporsmal.flervalg) neste = [id];
      else if (forrige.includes(id)) neste = forrige.filter((x) => x !== id);
      else neste = [...forrige, id];
      return { ...naa, [sporsmal.id]: neste };
    });
  }

  function gaVidere() {
    if (valgt.length === 0) return;
    // TODO: Lagre svarene i backend (f.eks. Supabase) sammen med brukeren.
    if (sisteSteg) lagreMaal(svar);
    else setSteg((s) => s + 1);
  }

  return (
    <View style={styles.skjerm}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, gradient(Gradients.skjerm)]} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.toppRad}>
          {steg > 0 ? (
            <Pressable
              onPress={() => setSteg((s) => s - 1)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Tilbake">
              <ThemedText type="smallBold" themeColor="textSecondary">
                ← Tilbake
              </ThemedText>
            </Pressable>
          ) : (
            <View />
          )}
          <ThemedText type="smallBold" themeColor="textMuted">
            {steg + 1} av {maalSporsmal.length}
          </ThemedText>
        </View>

        <View style={styles.fremdrift} accessibilityRole="progressbar">
          {maalSporsmal.map((s, i) => (
            <View key={s.id} style={[styles.fremdriftDel, i <= steg && styles.fremdriftAktiv]} />
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.innhold} showsVerticalScrollIndicator={false}>
          <Topptekst
            etikett={steg === 0 && fornavn ? `Hei, ${fornavn}` : 'Om deg'}
            tittel={sporsmal.tittel}
            tekst={sporsmal.tekst}
          />

          <View style={styles.alternativer}>
            {sporsmal.alternativer.map((alt) => (
              <Valg
                key={alt.id}
                alternativ={alt}
                valgt={valgt.includes(alt.id)}
                flervalg={sporsmal.flervalg}
                onPress={() => velg(alt.id)}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.bunn}>
          <Pressable
            onPress={gaVidere}
            disabled={valgt.length === 0}
            accessibilityRole="button"
            accessibilityState={{ disabled: valgt.length === 0 }}
            style={({ pressed }) => [
              styles.knapp,
              gradient(Gradients.helt),
              valgt.length === 0 && styles.knappAv,
              pressed && styles.knappTrykket,
            ]}>
            <ThemedText type="subtitle" style={styles.knappTekst}>
              {sisteSteg ? 'Kom i gang' : 'Neste'}
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

type ValgProps = {
  alternativ: Alternativ;
  valgt: boolean;
  flervalg: boolean;
  onPress: () => void;
};

/** Ett svaralternativ som et kort man trykker på. Firkant ved flervalg, rundt ved ett valg. */
function Valg({ alternativ, valgt, flervalg, onPress }: ValgProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={flervalg ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: valgt }}
      style={({ pressed }) => [styles.valg, valgt && styles.valgValgt, pressed && styles.valgTrykket]}>
      <View style={styles.valgTekst}>
        <ThemedText type="smallBold" style={styles.valgTittel}>
          {alternativ.tekst}
        </ThemedText>
        {alternativ.hint ? (
          <ThemedText type="small" themeColor="textMuted">
            {alternativ.hint}
          </ThemedText>
        ) : null}
      </View>
      <View style={[styles.boks, !flervalg && styles.boksRund, valgt && styles.boksValgt]}>
        {valgt ? <ThemedText style={styles.hake}>✓</ThemedText> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  skjerm: {
    flex: 1,
    backgroundColor: farger.background,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  toppRad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    minHeight: 40,
  },
  fremdrift: {
    flexDirection: 'row',
    gap: Spacing.one + 2,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  fremdriftDel: {
    flex: 1,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: farger.backgroundSelected,
  },
  fremdriftAktiv: {
    backgroundColor: farger.accent,
  },
  innhold: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  alternativer: {
    gap: Spacing.two + 2,
  },
  valg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 60,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three + 2,
    borderRadius: Radius.medium,
    backgroundColor: farger.backgroundElement,
    borderWidth: 1,
    borderColor: farger.border,
  },
  valgValgt: {
    borderColor: farger.accent,
    backgroundColor: farger.backgroundSelected,
  },
  valgTrykket: {
    opacity: 0.85,
  },
  valgTekst: {
    flex: 1,
    gap: Spacing.half,
  },
  valgTittel: {
    fontSize: 16,
    lineHeight: 22,
  },
  boks: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: farger.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boksRund: {
    borderRadius: Radius.pill,
  },
  boksValgt: {
    backgroundColor: farger.accent,
    borderColor: farger.accent,
  },
  hake: {
    color: farger.onAccent,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: 700,
  },
  bunn: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  knapp: {
    minHeight: 58,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
  },
  knappAv: {
    opacity: 0.4,
  },
  knappTrykket: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  knappTekst: {
    color: farger.text,
  },
});
