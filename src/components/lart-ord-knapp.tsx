import { Pressable, StyleSheet } from 'react-native';

import { gradient } from '@/components/gradient';
import { ThemedText } from '@/components/themed-text';
import { Colors, Gradients, Radius } from '@/constants/theme';
import { useFremgang } from '@/hooks/fremgang';

const farger = Colors.dark;

/** Knapp under dagens ord: marker ordet som lært, så teller dagen i streaken. */
export function LartOrdKnapp({ ord }: { ord: string }) {
  const { harLaertIDag, registrerOrd, laster } = useFremgang();
  const lart = harLaertIDag();

  return (
    <Pressable
      onPress={() => registrerOrd(ord)}
      disabled={lart || laster}
      accessibilityRole="button"
      accessibilityState={{ disabled: lart || laster }}
      style={({ pressed }) => [
        styles.knapp,
        lart ? styles.knappFerdig : gradient(Gradients.helt),
        pressed && styles.knappTrykket,
      ]}>
      <ThemedText type="subtitle" style={lart ? styles.tekstFerdig : styles.tekst}>
        {lart ? '✓ Lært i dag' : 'Jeg har lært ordet'}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  knapp: {
    minHeight: 58,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
  },
  knappFerdig: {
    backgroundColor: farger.backgroundElement,
    borderColor: farger.border,
  },
  knappTrykket: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  tekst: {
    color: farger.text,
  },
  tekstFerdig: {
    color: farger.textSecondary,
  },
});
