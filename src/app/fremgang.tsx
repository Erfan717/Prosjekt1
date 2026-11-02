import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

const statistikk = [
  { etikett: 'Ord lært', verdi: '0' },
  { etikett: 'Dager på rad', verdi: '0' },
  { etikett: 'Øvelser fullført', verdi: '0' },
];

export default function FremgangSkjerm() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">Fremgang</ThemedText>
        <ThemedText themeColor="textSecondary">
          Her ser du snart hvor mange nye ord du har tatt i bruk.
        </ThemedText>

        {statistikk.map((s) => (
          <ThemedView key={s.etikett} type="backgroundElement" style={styles.kort}>
            <ThemedText type="small" themeColor="textSecondary">
              {s.etikett}
            </ThemedText>
            <ThemedText type="subtitle">{s.verdi}</ThemedText>
          </ThemedView>
        ))}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  kort: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
});
