import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Kort, Skjerm, Topptekst } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { useBruker } from '@/hooks/bruker';

// Foreløpig faste tall. Senere henter vi dem fra lagret fremgang.
const dagerPaRad = 0;
const statistikk = [
  { etikett: 'Ord lært', verdi: 0, farge: Colors.dark.accent },
  { etikett: 'Øvelser fullført', verdi: 0, farge: Colors.dark.accentCalm },
];
const ukedager = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];
// Hvilke dager denne uken du har øvd (mandag først).
const ovdDager = [false, false, false, false, false, false, false];

export default function FremgangSkjerm() {
  const { loggUt } = useBruker();

  return (
    <Skjerm>
      <Topptekst
        etikett="Fremgang"
        tittel="Litt hver dag"
        tekst="Her ser du snart hvor mange nye ord du har tatt i bruk."
      />

      <Kort gradientCss={Gradients.varm}>
        <ThemedText type="eyebrow" style={styles.lysEtikett}>
          Dager på rad
        </ThemedText>
        <ThemedText type="stat" style={styles.stortTall}>
          {dagerPaRad}
        </ThemedText>
        <View style={styles.uke}>
          {ukedager.map((dag, i) => (
            <View key={i} style={styles.dag}>
              <View style={[styles.dagPrikk, ovdDager[i] && styles.dagPrikkAktiv]} />
              <ThemedText type="small" style={styles.dagTekst}>
                {dag}
              </ThemedText>
            </View>
          ))}
        </View>
      </Kort>

      <View style={styles.rutenett}>
        {statistikk.map((s) => (
          <Kort key={s.etikett} style={styles.rute}>
            <ThemedText type="stat" style={{ color: s.farge }}>
              {s.verdi}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {s.etikett}
            </ThemedText>
          </Kort>
        ))}
      </View>

      <ThemedText type="small" themeColor="textMuted" style={styles.fotnote}>
        Små steg hver dag blir til store endringer.
      </ThemedText>

      {/* Sletter alt som er lagret på telefonen og sender deg tilbake til registreringen. */}
      <Pressable onPress={loggUt} accessibilityRole="button" style={styles.loggUt}>
        <ThemedText type="small" themeColor="textSecondary">
          Logg ut
        </ThemedText>
      </Pressable>
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  lysEtikett: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  stortTall: {
    fontSize: 64,
    lineHeight: 70,
    color: '#FFFFFF',
  },
  uke: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  dag: {
    alignItems: 'center',
    gap: Spacing.one + 2,
  },
  dagPrikk: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  dagPrikkAktiv: {
    backgroundColor: Colors.dark.accentWarm,
  },
  dagTekst: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  rutenett: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  rute: {
    flex: 1,
    gap: Spacing.one,
  },
  fotnote: {
    textAlign: 'center',
    marginTop: Spacing.three,
  },
  loggUt: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
