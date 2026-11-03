import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { dagensOrd, type Ord } from '@/data/ord';
import { scenarioer, type Scenario } from '@/data/scenarioer';
import { useFremgang } from '@/hooks/fremgang';
import { datoNokkel } from '@/lib/streak';
import { ordPerMinutt, sendOpptak, tempoTekst, type AiTilbakemelding } from '@/utils/muntlig';
import { giTilbakemelding, type Punkt, type Tilbakemelding } from '@/utils/tilbakemelding';

const farger = Colors.dark;

/** Lengste opptak før det stopper av seg selv. */
const MAKS_OPPTAK_MS = 2 * 60 * 1000;

/** Det som vises etter en øvelse, enten tilbakemeldingen kom fra AI eller ble laget i appen. */
type Visning = {
  kilde: 'ai' | 'lokal';
  brukteOrdet: boolean;
  nivaa: Tilbakemelding['nivaa'];
  overskrift: string;
  punkter: Punkt[];
  forslag: { etikett: string; tekst: string };
  /** Det du sa, som tekst. Bare ved muntlig øving. */
  transkripsjon?: string;
  tempo?: string;
};

function fraAi(ai: AiTilbakemelding, transkripsjon: string, tempo?: string): Visning {
  return {
    kilde: 'ai',
    brukteOrdet: ai.brukteOrdet,
    nivaa: ai.nivaa,
    overskrift: ai.overskrift,
    punkter: [
      ...ai.styrker.map((tekst): Punkt => ({ type: 'bra', tekst })),
      ...ai.forbedringer.map((tekst): Punkt => ({ type: 'tips', tekst })),
    ],
    forslag: { etikett: 'Slik kunne du sagt det', tekst: ai.bedreFormulering },
    transkripsjon,
    tempo,
  };
}

function fraLokal(t: Tilbakemelding, eksempel: string, transkripsjon?: string, tempo?: string): Visning {
  return {
    kilde: 'lokal',
    brukteOrdet: t.brukteOrdet,
    nivaa: t.nivaa,
    overskrift: t.overskrift,
    punkter: t.punkter,
    forslag: { etikett: 'Eksempel med ordet', tekst: eksempel },
    transkripsjon,
    tempo,
  };
}

/**
 * Øvingsskjerm. Du sier svaret høyt og får tilbakemelding på det du sa.
 * Uten `scenario` i adressen sier du én setning med dagens ord.
 * Med `scenario` svarer du på oppgaven i scenarioet og prøver å bruke dagens ord der.
 * Vil du heller skrive, kan du bytte til skriving nederst.
 */
export default function OvelseSkjerm() {
  const { scenario: scenarioId } = useLocalSearchParams<{ scenario?: string }>();
  const scenario = scenarioer.find((s) => s.id === scenarioId);
  const type = scenario ? 'scenario' : 'setning';
  const { bruker } = useBruker();
  // Samme ord som på «Dagens ord», tilpasset brukerens mål.
  const [{ ord, eksempel }] = useState(() => dagensOrd(new Date(), bruker?.maal));

  const [modus, setModus] = useState<'snakk' | 'skriv'>('snakk');
  const [tekst, setTekst] = useState('');
  const [fokus, setFokus] = useState(false);
  const [resultat, setResultat] = useState<Visning | null>(null);

  const { registrerOvelse } = useFremgang();
  // En øvelse teller bare én gang per dag, selv om du prøver flere ganger.
  const taltDag = useRef<string | null>(null);

  function visResultat(visning: Visning) {
    setResultat(visning);
    // Øvelsen er fullført når dagens ord er brukt. Da teller den på fremgangssiden og i streaken.
    const iDag = datoNokkel(new Date());
    if (visning.brukteOrdet && taltDag.current !== iDag) {
      taltDag.current = iDag;
      registrerOvelse();
    }
  }

  const kanSende = tekst.trim().length > 0;

  function sjekkTekst() {
    if (!kanSende) return;
    visResultat(fraLokal(giTilbakemelding(tekst, ord, type), eksempel));
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
              tittel={scenario ? scenario.oppgave : modus === 'snakk' ? 'Si en setning' : 'Skriv en setning'}
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

            {modus === 'snakk' ? (
              <Muntlig
                ord={ord}
                eksempel={eksempel}
                scenario={scenario}
                onStart={() => setResultat(null)}
                onResultat={visResultat}
              />
            ) : (
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
            )}

            {resultat ? <Resultat resultat={resultat} /> : null}

            {modus === 'skriv' ? (
              <Pressable
                onPress={sjekkTekst}
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
            ) : null}

            <Pressable
              onPress={() => {
                setModus((m) => (m === 'snakk' ? 'skriv' : 'snakk'));
                setResultat(null);
              }}
              hitSlop={8}
              accessibilityRole="button"
              style={styles.byttModus}>
              <ThemedText type="smallBold" themeColor="textMuted">
                {modus === 'snakk' ? 'Kan du ikke snakke nå? Skriv i stedet' : '← Tilbake til å snakke'}
              </ThemedText>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

type MuntligProps = {
  ord: Ord;
  eksempel: string;
  scenario?: Scenario;
  onStart: () => void;
  onResultat: (visning: Visning) => void;
};

/** Stor mikrofonknapp: trykk for å snakke, trykk igjen for å stoppe og få tilbakemelding. */
function Muntlig({ ord, eksempel, scenario, onStart, onResultat }: MuntligProps) {
  const opptaker = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const opptak = useAudioRecorderState(opptaker, 250);
  const [status, setStatus] = useState<'klar' | 'tar-opp' | 'analyserer'>('klar');
  const [feil, setFeil] = useState<string | null>(null);
  const varighet = opptak.durationMillis;

  async function start() {
    setFeil(null);
    const tillatelse = await requestRecordingPermissionsAsync();
    if (!tillatelse.granted) {
      setFeil('Appen trenger tilgang til mikrofonen. Slå det på i innstillingene til telefonen.');
      return;
    }
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await opptaker.prepareToRecordAsync();
      opptaker.record();
      onStart();
      setStatus('tar-opp');
    } catch {
      setFeil('Klarte ikke å starte opptaket. Prøv igjen.');
    }
  }

  async function stopp() {
    const lengde = varighet;
    await opptaker.stop();
    await setAudioModeAsync({ allowsRecording: false });
    const uri = opptaker.uri;
    if (!uri) {
      setStatus('klar');
      setFeil('Fant ikke opptaket. Prøv igjen.');
      return;
    }
    setStatus('analyserer');
    try {
      const svar = await sendOpptak(uri, ord, scenario?.oppgave);
      const opm = ordPerMinutt(svar.transkripsjon, lengde);
      const tempo = opm ? `${opm} ord i minuttet. ${tempoTekst(opm)}` : undefined;
      onResultat(
        svar.ai
          ? fraAi(svar.ai, svar.transkripsjon, tempo)
          : fraLokal(
              giTilbakemelding(svar.transkripsjon, ord, scenario ? 'scenario' : 'setning'),
              eksempel,
              svar.transkripsjon,
              tempo,
            ),
      );
    } catch (e) {
      setFeil(e instanceof Error ? e.message : 'Noe gikk galt. Prøv igjen.');
    } finally {
      setStatus('klar');
    }
  }

  // Stopp av seg selv hvis opptaket blir veldig langt.
  const stoppRef = useRef(stopp);
  stoppRef.current = stopp;
  useEffect(() => {
    if (status === 'tar-opp' && varighet >= MAKS_OPPTAK_MS) stoppRef.current();
  }, [status, varighet]);

  const tarOpp = status === 'tar-opp';
  const analyserer = status === 'analyserer';

  return (
    <View style={styles.muntlig}>
      <Pressable
        onPress={tarOpp ? stopp : start}
        disabled={analyserer}
        accessibilityRole="button"
        accessibilityLabel={tarOpp ? 'Stopp opptaket' : 'Start opptak'}
        style={({ pressed }) => [
          styles.mikrofon,
          gradient(Gradients.helt),
          tarOpp && styles.mikrofonAktiv,
          analyserer && styles.knappAv,
          pressed && styles.knappTrykket,
        ]}>
        {analyserer ? (
          <ActivityIndicator color={farger.text} />
        ) : (
          <View style={tarOpp ? styles.stoppIkon : styles.mikIkon}>
            {tarOpp ? null : <View style={styles.mikFot} />}
          </View>
        )}
      </Pressable>

      <ThemedText type="smallBold" themeColor={tarOpp ? 'text' : 'textSecondary'}>
        {analyserer
          ? 'Lytter til det du sa …'
          : tarOpp
            ? `${formaterTid(varighet)} · Trykk for å stoppe`
            : 'Trykk og si svaret ditt høyt'}
      </ThemedText>

      {feil ? (
        <ThemedText type="small" themeColor="accentWarm" style={styles.midtstilt}>
          {feil}
        </ThemedText>
      ) : null}
    </View>
  );
}

function formaterTid(ms: number): string {
  const sek = Math.floor(ms / 1000);
  return `${Math.floor(sek / 60)}:${String(sek % 60).padStart(2, '0')}`;
}

const nivaaFarge: Record<Tilbakemelding['nivaa'], string> = {
  sterkt: farger.accent,
  godt: farger.accentWarm,
  provIgjen: farger.accentCalm,
};

/** Viser tilbakemeldingen: det du sa, overskrift, hva som var bra, tips og et forslag. */
function Resultat({ resultat }: { resultat: Visning }) {
  const farge = nivaaFarge[resultat.nivaa];
  return (
    <>
      {resultat.transkripsjon ? (
        <Kort>
          <ThemedText type="eyebrow" themeColor="textMuted">
            Dette sa du
          </ThemedText>
          <ThemedText style={styles.sitat}>«{resultat.transkripsjon}»</ThemedText>
          {resultat.tempo ? (
            <ThemedText type="small" themeColor="textSecondary">
              {resultat.tempo}
            </ThemedText>
          ) : null}
        </Kort>
      ) : null}

      <Kort>
        <View style={styles.ordRad}>
          <View style={[styles.prikk, { backgroundColor: farge }]} />
          <ThemedText type="subtitle" style={styles.fyll}>
            {resultat.overskrift}
          </ThemedText>
          <Brikke>{resultat.kilde === 'ai' ? 'AI' : 'Enkel'}</Brikke>
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
            {resultat.forslag.etikett}
          </ThemedText>
          <ThemedText style={styles.sitat}>«{resultat.forslag.tekst}»</ThemedText>
        </View>
      </Kort>
    </>
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
  byttModus: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
  },
  muntlig: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  mikrofon: {
    width: 104,
    height: 104,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
  },
  mikrofonAktiv: {
    borderColor: farger.accent,
    borderWidth: 3,
  },
  // En enkel mikrofon tegnet med to former, så vi slipper en ikonpakke.
  mikIkon: {
    width: 22,
    height: 34,
    borderRadius: 11,
    backgroundColor: farger.text,
    alignItems: 'center',
  },
  mikFot: {
    position: 'absolute',
    bottom: -12,
    width: 4,
    height: 10,
    backgroundColor: farger.text,
  },
  stoppIkon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: farger.text,
  },
  midtstilt: {
    textAlign: 'center',
  },
});
