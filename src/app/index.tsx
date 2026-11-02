import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { dagensOrd } from '@/data/ord';

export default function DagensOrdSkjerm() {
  const ord = dagensOrd();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.innhold}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            DAGENS ORD
          </ThemedText>
          <ThemedText type="subtitle">{ord.ord}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {ord.ordklasse}
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.kort}>
            <ThemedText type="smallBold">Betydning</ThemedText>
            <ThemedText>{ord.betydning}</ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.kort}>
            <ThemedText type="smallBold">Eksempel</ThemedText>
            <ThemedText style={styles.kursiv}>«{ord.eksempel}»</ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.kort}>
            <ThemedText type="smallBold">Synonymer</ThemedText>
            <ThemedText>{ord.synonymer.join(', ')}</ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.kort}>
            <ThemedText type="smallBold">Bruk det i stedet for</ThemedText>
            <ThemedText>{ord.erstatter.map((o) => `«${o}»`).join(', ')}</ThemedText>
          </ThemedView>
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
  kursiv: {
    fontStyle: 'italic',
  },
});
