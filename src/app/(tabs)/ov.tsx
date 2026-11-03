import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brikke, Kort, Skjerm, Topptekst } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { scenarioer } from '@/data/scenarioer';

// Hvert scenario får sin egen rolige aksentfarge, i rekkefølge.
const aksenter = [Colors.dark.accent, Colors.dark.accentCalm, Colors.dark.accentWarm];

export default function OvSkjerm() {
  return (
    <Skjerm>
      <Topptekst
        etikett="Øv"
        tittel="Finn stemmen din"
        tekst="Velg en situasjon. Snart kan du svare muntlig og få tilbakemelding på ordvalg og struktur."
      />

      <Kort gradientCss={Gradients.rolig}>
        <ThemedText type="eyebrow" themeColor="accentCalm">
          Dagens tips
        </ThemedText>
        <ThemedText style={styles.tips}>
          Ta en pause før du svarer. Et rolig «hmm, godt spørsmål» gir deg tid og virker trygt.
        </ThemedText>
      </Kort>

      {scenarioer.map((scenario, i) => {
        const farge = aksenter[i % aksenter.length];
        return (
          <Kort key={scenario.id}>
            <View style={styles.hode}>
              <View style={[styles.prikk, { backgroundColor: farge }]} />
              <ThemedText type="subtitle" style={styles.tittel}>
                {scenario.tittel}
              </ThemedText>
              <Brikke>Snart</Brikke>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {scenario.beskrivelse}
            </ThemedText>
            <View style={[styles.oppgave, { borderLeftColor: farge }]}>
              <ThemedText>{scenario.oppgave}</ThemedText>
            </View>
          </Kort>
        );
      })}
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  tips: {
    color: 'rgba(255, 255, 255, 0.88)',
  },
  hode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
  },
  prikk: {
    width: 10,
    height: 10,
    borderRadius: Radius.pill,
  },
  tittel: {
    flex: 1,
  },
  oppgave: {
    marginTop: Spacing.one,
    paddingLeft: Spacing.three,
    borderLeftWidth: 2,
  },
});
