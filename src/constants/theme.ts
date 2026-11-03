/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

/**
 * «Midnatt»: nesten svart med et snev av marineblå.
 * Én farge i ulike nyanser, for et rent og minimalistisk uttrykk.
 * Appen er alltid mørk, så lys og mørk modus bruker de samme fargene.
 */
const Palett = {
  /** Nesten svart bakgrunn bak alt */
  background: '#0A0C10',
  /** Kort: en nyanse lysere enn bakgrunnen */
  backgroundElement: '#12151B',
  backgroundSelected: '#1C2230',
  /** Tynn kant rundt kort */
  border: 'rgba(220, 227, 240, 0.08)',
  text: '#EEF1F7',
  textSecondary: '#9DA5B4',
  textMuted: '#626A7A',
  /** Hovedaksent: lys blågrå */
  accent: '#DCE3F0',
  /** Fremgang og streaks: samme blågrå familie, litt mørkere */
  accentWarm: '#B8C3D8',
  /** Øving: samme blågrå familie, enda litt mørkere */
  accentCalm: '#97A4BE',
  /** Tekst oppå aksentfarger */
  onAccent: '#0A0C10',
} as const;

export const Colors = {
  light: Palett,
  dark: Palett,
} as const;

/**
 * Gradienter skrevet som CSS. Brukes via `gradient()` i `@/components/gradient`.
 * Alle holder seg i samme marineblå nyanse.
 */
export const Gradients = {
  /** Svak blå glød øverst på skjermen som toner ut i mørket */
  skjerm:
    'radial-gradient(120% 60% at 20% 0%, rgba(52, 64, 90, 0.45) 0%, rgba(52, 64, 90, 0) 70%)',
  /** Hovedkort */
  helt: 'linear-gradient(135deg, #1C2230 0%, #34405A 100%)',
  /** Rolig kort for øving */
  rolig: 'linear-gradient(135deg, #151A24 0%, #283247 100%)',
  /** Kort for fremgang */
  varm: 'linear-gradient(135deg, #181D29 0%, #2E3950 100%)',
} as const;

export const Radius = {
  small: 12,
  medium: 20,
  large: 28,
  pill: 999,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
