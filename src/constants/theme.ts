/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

/**
 * Mørk, rolig palett inspirert av «personal growth»-apper som Opal og Soundscape.
 * Appen er alltid mørk, så lys og mørk modus bruker de samme fargene.
 */
const Palett = {
  /** Dyp blekk-lilla bakgrunn bak alt */
  background: '#0B0A14',
  /** Glass-kort: litt lysere enn bakgrunnen */
  backgroundElement: 'rgba(255, 255, 255, 0.05)',
  backgroundSelected: 'rgba(255, 255, 255, 0.12)',
  /** Tynn kant rundt kort */
  border: 'rgba(255, 255, 255, 0.08)',
  text: '#F4F1FA',
  textSecondary: '#A9A4BF',
  textMuted: '#6F6A87',
  /** Hovedaksent: myk lavendel */
  accent: '#B9A6FF',
  /** Varm aksent: fersken, brukes til fremgang og streaks */
  accentWarm: '#FFB38A',
  /** Rolig aksent: mint, brukes til øving */
  accentCalm: '#7FD8C4',
  /** Tekst oppå aksentfarger */
  onAccent: '#14111F',
} as const;

export const Colors = {
  light: Palett,
  dark: Palett,
} as const;

/**
 * Gradienter skrevet som CSS. Brukes via `gradient()` i `@/components/gradient`.
 */
export const Gradients = {
  /** Svak lilla glød øverst på skjermen som toner ut i mørket */
  skjerm:
    'radial-gradient(120% 60% at 20% 0%, rgba(124, 92, 255, 0.35) 0%, rgba(124, 92, 255, 0) 70%), radial-gradient(90% 50% at 100% 15%, rgba(255, 140, 120, 0.16) 0%, rgba(255, 140, 120, 0) 70%)',
  /** Hovedkort med lavendel → rosa → fersken */
  helt: 'linear-gradient(135deg, #3B2A78 0%, #5B3A8C 45%, #8A4F7D 75%, #B8687A 100%)',
  /** Rolig mint-blå for øving */
  rolig: 'linear-gradient(135deg, #12352F 0%, #1C3F4F 100%)',
  /** Varm for fremgang */
  varm: 'linear-gradient(135deg, #4A2A3E 0%, #7A3F3A 60%, #A65A3A 100%)',
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
