import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBruker } from '@/hooks/bruker';
import { gradient } from '@/components/gradient';
import { ThemedText } from '@/components/themed-text';
import { Brikke, Kort, Topptekst } from '@/components/ui';
import { Colors, Gradients, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { dagensOrd } from '@/data/ord';
import { scenarioer } from '@/data/scenarioer';
import { useFremgang } from '@/hooks/fremgang';
import { giTilbakemelding, type Tilbakemelding } from '@/utils/tilbakemelding';

const farger = Colors.dark;

/**
 * Øvingsskjerm. Uten `scenario` i adressen skriver man én setning med dagens ord.
 * Med `scenario` svarer man på oppgaven i scenarioet og prøver å bruke dagens ord der.
 */
export default function OvelseSkjerm() {
  const { scenario: scenarioId } = useLocalSearchParams<{ scenario?: string }>();
  const scenario = scenarioer.find((s) => s.id === scenarioId);
  const type = scenario ? 'scenario' : 'setning';
  const { bruker } = useBruker();
  // Samme ord som på «Dagens ord», tilpasset brukerens mål.
  const [{ ord, eksempel }] = useState(() => dagensOrd(new Date(), bruker?.maal));

  const [tekst, setTekst] = useState('');
  const [fokus, setFokus] = useState(false);
  const [resultat, setResultat] = useState<Tilbakemelding | null>(null);

  const { registrerOvelse } = useFremgang();
  // En øvelse teller bare én gang, selv om du sjekker flere ganger.
  const talt = useRef(false);

  const kanSende = tekst.trim().length > 0;

  function sjekk() {
    if (!kanSende) return;
    const tilbakemelding = giTilbakemelding(tekst, ord, type);
    setResultat(tilbakemelding);
    // Øvelsen er fullført når dagens ord er brukt. Da teller den på fremgangssiden og i streaken.
    if (tilbakemelding.brukteOrdet && !talt.current) {
      talt.current = true;
      registrerOvelse();
    }
  }

  function tilbake() {
    if (router.canGoBack()) router.back();
    else router.replace('/ov');
  }

  return (
    <View style={styles.skjerm}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, gradient(Gradients.skjerm)]} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.toppRad}>
          <Pressable onPress={tilbake} hitSlop={12} accessibilityRole="button" accessibilityLabel="Tilbake">
            <ThemedText type="smallBold" themeColor="textSecondary">
              ← Tilbake
            </ThemedText>
          </Pressable>
        </View>

        <KeyboardAvoidingView style={styles.fyll} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.innhold}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Topptekst
              etikett={scenario ? scenario.tittel : 'Bruk dagens ord'}
              tittel={scenario ? scenario.oppgave : 'Skriv en setning'}
              tekst={
                scenario
                  ? `Svar med to–tre setninger, og prøv å få med «${ord.ord}».`
                  : `Lag din egen setning der du bruker «${ord.ord}» på en naturlig måte.`
              }
            />

            <Kort gradientCss={Gradients.rolig}>
              <View style={styles.ordRad}>
                <ThemedText type="eyebrow" themeColor="accentCalm">
                  Dagens ord
                </ThemedText>
                <Brikke farge={farger.text}>{ord.ordklasse}</Brikke>
              </View>
              <ThemedText type="subtitle">{ord.ord}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {ord.betydning}
              </ThemedText>
            </Kort>

            <View style={[styles.inputRamme, fokus && styles.inputFokus]}>
              <TextInput
                value={tekst}
                onChangeText={(t) => {
                  setTekst(t);
                  // Skjul gammel tilbakemelding når man endrer teksten, så den ikke blir feil.
                  if (resultat) setResultat(null);
                }}
                onFocus={() => setFokus(true)}
                onBlur={() => setFokus(false)}
                placeholder={scenario ? 'Skriv svaret ditt her …' : `En setning med «${ord.ord}» …`}
                placeholderTextColor={farger.textMuted}
                selectionColor={farger.accent}
                cursorColor={farger.accent}
                accessibilityLabel="Svaret ditt"
                multiline
                textAlignVertical="top"
                autoCapitalize="sentences"
                style={[styles.input, scenario && styles.inputHoy]}
              />
            </View>

            {resultat ? <Resultat resultat={resultat} eksempel={eksempel} /> : null}

            <Pressable
              onPress={sjekk}
              disabled={!kanSende}
              accessibilityRole="button"
              accessibilityState={{ disabled: !kanSende }}
              style={({ pressed }) => [
                styles.knapp,
                gradient(Gradients.helt),
                !kanSende && styles.knappAv,
                pressed && styles.knappTrykket,
              ]}>
              <ThemedText type="subtitle" style={styles.knappTekst}>
                {resultat ? 'Sjekk igjen' : 'Få tilbakemelding'}
              </ThemedText>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const nivaaFarge: Record<Tilbakemelding['nivaa'], string> = {
  sterkt: farger.accent,
  godt: farger.accentWarm,
  provIgjen: farger.accentCalm,
};

/** Viser tilbakemeldingen: overskrift, hva som var bra, tips og et eksempel. */
function Resultat({ resultat, eksempel }: { resultat: Tilbakemelding; eksempel: string }) {
  const farge = nivaaFarge[resultat.nivaa];
  return (
    <Kort>
      <View style={styles.ordRad}>
        <View style={[styles.prikk, { backgroundColor: farge }]} />
        <ThemedText type="subtitle" style={styles.fyll}>
          {resultat.overskrift}
        </ThemedText>
      </View>

      <View style={styles.punkter} accessibilityRole="list">
        {resultat.punkter.map((p) => (
          <View key={p.tekst} style={styles.punkt}>
            <ThemedText type="smallBold" style={{ color: p.type === 'bra' ? farger.accent : farger.textMuted }}>
              {p.type === 'bra' ? '✓' : '→'}
            </ThemedText>
            <ThemedText type="small" themeColor={p.type === 'bra' ? 'text' : 'textSecondary'} style={styles.fyll}>
              {p.tekst}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={[styles.eksempel, { borderLeftColor: farge }]}>
        <ThemedText type="eyebrow" themeColor="textMuted">
          Eksempel med ordet
        </ThemedText>
        <ThemedText style={styles.sitat}>«{eksempel}»</ThemedText>
      </View>
    </Kort>
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
  fyll: {
    flex: 1,
  },
  toppRad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    minHeight: 40,
  },
  innhold: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  ordRad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two + 2,
  },
  inputRamme: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.medium,
    backgroundColor: farger.backgroundElement,
    borderWidth: 1,
    borderColor: farger.border,
  },
  inputFokus: {
    borderColor: farger.accent,
    backgroundColor: farger.backgroundSelected,
  },
  input: {
    minHeight: 96,
    fontSize: 17,
    lineHeight: 25,
    color: farger.text,
    // Fjerner nettleserens egen fokusramme; vi viser fokus på rammen rundt i stedet.
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  inputHoy: {
    minHeight: 160,
  },
  prikk: {
    width: 10,
    height: 10,
    borderRadius: Radius.pill,
  },
  punkter: {
    gap: Spacing.two + 2,
    marginTop: Spacing.one,
  },
  punkt: {
    flexDirection: 'row',
    gap: Spacing.two + 2,
  },
  eksempel: {
    marginTop: Spacing.two,
    paddingLeft: Spacing.three,
    borderLeftWidth: 2,
    gap: Spacing.one,
  },
  sitat: {
    fontStyle: 'italic',
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
