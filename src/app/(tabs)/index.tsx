import { useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { LartOrdKnapp } from '@/components/lart-ord-knapp';
import { Brikke, Kort, Skjerm } from '@/components/ui';
import { Colors, Gradients, Spacing } from '@/constants/theme';
import { dagensOrd, temaNavn } from '@/data/ord';
import { useBruker } from '@/hooks/bruker';

const datoFormat = new Intl.DateTimeFormat('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });

export default function DagensOrdSkjerm() {
  const { bruker } = useBruker();
  const [dato, setDato] = useState(() => new Date());

  // Oppdater datoen når appen kommer tilbake i forgrunnen, så et nytt døgn gir nytt ord.
  useEffect(() => {
    const abonnement = AppState.addEventListener('change', (status) => {
      if (status === 'active') setDato(new Date());
    });
    return () => abonnement.remove();
  }, []);

  const { ord, eksempel, tema, tips } = dagensOrd(dato, bruker?.maal);

  return (
    <Skjerm>
      <ThemedText type="eyebrow" themeColor="textMuted">
        {datoFormat.format(dato)}
      </ThemedText>

      <Kort gradientCss={Gradients.helt} style={styles.helt}>
        <ThemedText type="eyebrow" style={styles.lysEtikett}>
          Dagens ord
        </ThemedText>
        <ThemedText type="display">{ord.ord}</ThemedText>
        <View style={styles.rad}>
          <Brikke farge={Colors.dark.text}>{ord.ordklasse}</Brikke>
          {tema ? <Brikke farge={Colors.dark.text}>Valgt for deg: {temaNavn[tema]}</Brikke> : null}
        </View>
        <ThemedText style={styles.heltTekst}>{ord.betydning}</ThemedText>
      </Kort>

      <Kort>
        <ThemedText type="eyebrow" themeColor="accent">
          Eksempel
        </ThemedText>
        <ThemedText type="subtitle" style={styles.sitat}>
          «{eksempel}»
        </ThemedText>
      </Kort>

      {tips ? (
        <Kort>
          <ThemedText type="eyebrow" themeColor="accent">
            Tips for deg
          </ThemedText>
          <ThemedText themeColor="textSecondary">{tips}</ThemedText>
        </Kort>
      ) : null}

      <Kort>
        <ThemedText type="eyebrow" themeColor="accentCalm">
          Synonymer
        </ThemedText>
        <View style={styles.rad}>
          {ord.synonymer.map((s) => (
            <Brikke key={s} farge={Colors.dark.text}>
              {s}
            </Brikke>
          ))}
        </View>
      </Kort>

      <Kort>
        <ThemedText type="eyebrow" themeColor="accentWarm">
          Bruk det i stedet for
        </ThemedText>
        <View style={styles.rad}>
          {ord.erstatter.map((o) => (
            <Brikke key={o} farge={Colors.dark.textMuted}>
              <ThemedText type="small" themeColor="textMuted" style={styles.overstreket}>
                {o}
              </ThemedText>
            </Brikke>
          ))}
        </View>
      </Kort>

      <LartOrdKnapp ord={ord.ord} />
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  helt: {
    paddingVertical: Spacing.five,
    gap: Spacing.three,
  },
  lysEtikett: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  heltTekst: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 17,
    lineHeight: 26,
  },
  rad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  sitat: {
    fontStyle: 'italic',
    fontWeight: 400,
    lineHeight: 30,
  },
  overstreket: {
    textDecorationLine: 'line-through',
  },
});
