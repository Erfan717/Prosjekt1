import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { gradient } from '@/components/gradient';
import { ThemedText } from '@/components/themed-text';
import {
  BottomTabInset,
  Colors,
  Gradients,
  MaxContentWidth,
  Radius,
  Spacing,
} from '@/constants/theme';

const farger = Colors.dark;

/** Felles ramme for alle skjermer: mørk bakgrunn med myk glød øverst. */
export function Skjerm({ children }: { children: ReactNode }) {
  return (
    <View style={styles.skjerm}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, gradient(Gradients.skjerm)]} />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.innhold}
          showsVerticalScrollIndicator={false}
          indicatorStyle="white">
          {children}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/** Overskrift øverst på en skjerm, med liten etikett over. */
export function Topptekst({ etikett, tittel, tekst }: { etikett: string; tittel: string; tekst?: string }) {
  return (
    <View style={styles.topptekst}>
      <ThemedText type="eyebrow" themeColor="accent">
        {etikett}
      </ThemedText>
      <ThemedText type="title">{tittel}</ThemedText>
      {tekst ? <ThemedText themeColor="textSecondary">{tekst}</ThemedText> : null}
    </View>
  );
}

type KortProps = {
  children: ReactNode;
  /** CSS-gradient for et fremhevet kort. Uten den blir kortet et diskret «glass»-kort. */
  gradientCss?: string;
  style?: StyleProp<ViewStyle>;
};

/** Avrundet kort. Glass-stil som standard, eller med gradient. */
export function Kort({ children, gradientCss, style }: KortProps) {
  return (
    <View style={[styles.kort, gradientCss ? [styles.kortGradient, gradient(gradientCss)] : null, style]}>
      {children}
    </View>
  );
}

/** Liten avrundet «pille», f.eks. for synonymer eller ordklasse. */
export function Brikke({ children, farge = farger.textSecondary }: { children: ReactNode; farge?: string }) {
  return (
    <View style={styles.brikke}>
      <ThemedText type="small" style={{ color: farge }}>
        {children}
      </ThemedText>
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
  innhold: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: Spacing.three,
  },
  topptekst: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  kort: {
    padding: Spacing.four,
    borderRadius: Radius.large,
    backgroundColor: farger.backgroundElement,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: farger.border,
    gap: Spacing.two,
  },
  kortGradient: {
    backgroundColor: farger.background,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    overflow: 'hidden',
  },
  brikke: {
    paddingVertical: Spacing.one + 2,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: farger.border,
  },
});
