import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brikke, Kort, Skjerm, Topptekst } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { dagensOrd } from '@/data/ord';
import { scenarioer } from '@/data/scenarioer';

// Hvert scenario får sin egen rolige aksentfarge, i rekkefølge.
const aksenter = [Colors.dark.accent, Colors.dark.accentCalm, Colors.dark.accentWarm];

export default function OvSkjerm() {
  const [dato, setDato] = useState(() => new Date());

  // Oppdater datoen når appen kommer tilbake i forgrunnen, så kortet viser samme ord som øvelsen.
  useEffect(() => {
    const abonnement = AppState.addEventListener('change', (status) => {
      if (status === 'active') setDato(new Date());
    });
    return () => abonnement.remove();
  }, []);

  const ord = dagensOrd(dato);

  return (
    <Skjerm>
      <Topptekst
        etikett="Øv"
        tittel="Finn stemmen din"
        tekst="Bruk dagens ord i en setning eller i en situasjon, og få tilbakemelding på formuleringen."
      />

      <Pressable
        onPress={() => router.push('/ovelse')}
        accessibilityRole="button"
        accessibilityLabel={`Skriv en setning med ${ord.ord}`}
        style={({ pressed }) => pressed && styles.trykket}>
        <Kort gradientCss={Gradients.helt}>
          <ThemedText type="eyebrow" style={styles.lysEtikett}>
            Rask øvelse · 1 min
          </ThemedText>
          <ThemedText type="subtitle">Skriv en setning med «{ord.ord}»</ThemedText>
          <ThemedText type="small" style={styles.lysTekst}>
            {ord.betydning}
          </ThemedText>
          <ThemedText type="smallBold" style={styles.start}>
            Start →
          </ThemedText>
        </Kort>
      </Pressable>

      <ThemedText type="eyebrow" themeColor="textMuted" style={styles.seksjon}>
        Situasjoner
      </ThemedText>

      {scenarioer.map((scenario, i) => {
        const farge = aksenter[i % aksenter.length];
        return (
          <Pressable
            key={scenario.id}
            onPress={() => router.push({ pathname: '/ovelse', params: { scenario: scenario.id } })}
            accessibilityRole="button"
            accessibilityLabel={`Øv på ${scenario.tittel}`}
            style={({ pressed }) => pressed && styles.trykket}>
            <Kort>
              <View style={styles.hode}>
                <View style={[styles.prikk, { backgroundColor: farge }]} />
                <ThemedText type="subtitle" style={styles.tittel}>
                  {scenario.tittel}
                </ThemedText>
                <Brikke>Skriv</Brikke>
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {scenario.beskrivelse}
              </ThemedText>
              <View style={[styles.oppgave, { borderLeftColor: farge }]}>
                <ThemedText>{scenario.oppgave}</ThemedText>
              </View>
            </Kort>
          </Pressable>
        );
      })}

      <Kort gradientCss={Gradients.rolig}>
        <ThemedText type="eyebrow" themeColor="accentCalm">
          Dagens tips
        </ThemedText>
        <ThemedText style={styles.tips}>
          Ta en pause før du svarer. Et rolig «hmm, godt spørsmål» gir deg tid og virker trygt.
        </ThemedText>
      </Kort>
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  trykket: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  lysEtikett: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  lysTekst: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  start: {
    marginTop: Spacing.one,
    color: Colors.dark.text,
  },
  seksjon: {
    marginTop: Spacing.two,
  },
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
