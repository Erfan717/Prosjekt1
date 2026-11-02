import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { scenarioer } from '@/data/scenarioer';

export default function OvSkjerm() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.innhold}>
          <ThemedText type="subtitle">Øv på å snakke</ThemedText>
          <ThemedText themeColor="textSecondary">
            Velg en situasjon. Snart kan du svare muntlig og få tilbakemelding på ordvalg og
            struktur.
          </ThemedText>

          {scenarioer.map((scenario) => (
            <ThemedView key={scenario.id} type="backgroundElement" style={styles.kort}>
              <ThemedText type="smallBold">{scenario.tittel}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {scenario.beskrivelse}
              </ThemedText>
              <ThemedText>{scenario.oppgave}</ThemedText>
            </ThemedView>
          ))}
        </ScrollView>
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
  },
  innhold: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  kort: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
});
