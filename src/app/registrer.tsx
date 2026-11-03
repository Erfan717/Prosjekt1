import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextInputInstance,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { gradient } from '@/components/gradient';
import { ThemedText } from '@/components/themed-text';
import { Topptekst } from '@/components/ui';
import { Colors, Gradients, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useBruker } from '@/hooks/bruker';

const farger = Colors.dark;

type Feil = Partial<Record<'navn' | 'epost' | 'passord', string>>;

/** Sjekker feltene og returnerer en feilmelding per felt som ikke er gyldig. */
function valider(navn: string, epost: string, passord: string): Feil {
  const feil: Feil = {};
  if (navn.trim().length < 2) feil.navn = 'Skriv inn navnet ditt.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost.trim())) feil.epost = 'Skriv inn en gyldig e-postadresse.';
  if (passord.length < 8) feil.passord = 'Passordet må ha minst 8 tegn.';
  return feil;
}

export default function RegistrerSkjerm() {
  const { registrer } = useBruker();

  const [navn, setNavn] = useState('');
  const [epost, setEpost] = useState('');
  const [passord, setPassord] = useState('');
  const [visPassord, setVisPassord] = useState(false);
  // Feilmeldinger vises først etter at man har prøvd å sende inn skjemaet én gang.
  const [harProvd, setHarProvd] = useState(false);

  const epostFelt = useRef<TextInputInstance>(null);
  const passordFelt = useRef<TextInputInstance>(null);

  const feil = harProvd ? valider(navn, epost, passord) : {};

  function sendInn() {
    setHarProvd(true);
    if (Object.keys(valider(navn, epost, passord)).length > 0) return;
    // TODO: Lagre brukeren i en ekte backend (f.eks. Supabase) og vis spørsmålene om mål etterpå.
    registrer({ navn: navn.trim(), epost: epost.trim().toLowerCase() });
  }

  return (
    <View style={styles.skjerm}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, gradient(Gradients.skjerm)]} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.fyll} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.innhold}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Topptekst
              etikett="Velkommen"
              tittel="Begynn reisen mot et rikere språk"
              tekst="Lag en konto, så tilpasser vi øvingen til deg. Det tar under ett minutt."
            />

            <View style={styles.skjema}>
              <Felt
                etikett="Navn"
                feil={feil.navn}
                value={navn}
                onChangeText={setNavn}
                placeholder="Hva skal vi kalle deg?"
                autoComplete="name"
                textContentType="name"
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => epostFelt.current?.focus()}
                submitBehavior="submit"
              />
              <Felt
                ref={epostFelt}
                etikett="E-post"
                feil={feil.epost}
                value={epost}
                onChangeText={setEpost}
                placeholder="navn@eksempel.no"
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passordFelt.current?.focus()}
                submitBehavior="submit"
              />
              <Felt
                ref={passordFelt}
                etikett="Passord"
                feil={feil.passord}
                hjelp="Minst 8 tegn."
                value={passord}
                onChangeText={setPassord}
                placeholder="••••••••"
                autoComplete="new-password"
                textContentType="newPassword"
                secureTextEntry={!visPassord}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={sendInn}
                tillegg={
                  <Pressable
                    onPress={() => setVisPassord((v) => !v)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel={visPassord ? 'Skjul passord' : 'Vis passord'}>
                    <ThemedText type="smallBold" themeColor="accent">
                      {visPassord ? 'Skjul' : 'Vis'}
                    </ThemedText>
                  </Pressable>
                }
              />
            </View>

            <Pressable
              onPress={sendInn}
              accessibilityRole="button"
              style={({ pressed }) => [styles.knapp, gradient(Gradients.helt), pressed && styles.knappTrykket]}>
              <ThemedText type="subtitle" style={styles.knappTekst}>
                Opprett konto
              </ThemedText>
            </Pressable>

            <ThemedText type="small" themeColor="textMuted" style={styles.finskrift}>
              Etterpå stiller vi deg noen korte spørsmål om hva du vil bli bedre på.
            </ThemedText>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

type FeltProps = TextInputProps & {
  ref?: React.Ref<TextInputInstance>;
  etikett: string;
  feil?: string;
  hjelp?: string;
  /** Noe som vises til høyre i feltet, f.eks. «Vis»-knappen for passord. */
  tillegg?: React.ReactNode;
};

/** Tekstfelt i glass-stil med etikett over og feilmelding under. */
function Felt({ ref, etikett, feil, hjelp, tillegg, style, onFocus, onBlur, ...rest }: FeltProps) {
  const [fokus, setFokus] = useState(false);

  return (
    <View style={styles.felt}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {etikett}
      </ThemedText>
      <View style={[styles.inputRamme, fokus && styles.inputFokus, feil ? styles.inputFeil : null]}>
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={farger.textMuted}
          selectionColor={farger.accent}
          cursorColor={farger.accent}
          accessibilityLabel={etikett}
          {...rest}
          onFocus={(e) => {
            setFokus(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFokus(false);
            onBlur?.(e);
          }}
        />
        {tillegg}
      </View>
      {feil ? (
        <ThemedText type="small" themeColor="accentWarm">
          {feil}
        </ThemedText>
      ) : hjelp ? (
        <ThemedText type="small" themeColor="textMuted">
          {hjelp}
        </ThemedText>
      ) : null}
    </View>
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
  innhold: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.four,
  },
  skjema: {
    gap: Spacing.three,
  },
  felt: {
    gap: Spacing.two,
  },
  inputRamme: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
    backgroundColor: farger.backgroundElement,
    borderWidth: 1,
    borderColor: farger.border,
  },
  inputFokus: {
    borderColor: farger.accent,
    backgroundColor: 'rgba(185, 166, 255, 0.08)',
  },
  inputFeil: {
    borderColor: farger.accentWarm,
  },
  input: {
    flex: 1,
    minHeight: 54,
    fontSize: 16,
    color: farger.text,
    // Fjerner nettleserens egen fokusramme; vi viser fokus på rammen rundt i stedet.
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
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
  knappTrykket: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  knappTekst: {
    color: farger.text,
  },
  finskrift: {
    textAlign: 'center',
  },
});
