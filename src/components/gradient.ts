import { Platform, type ViewStyle } from 'react-native';

/**
 * Gjør en CSS-gradient om til en stil som virker både på mobil og web.
 * React Native (ny arkitektur) støtter `experimental_backgroundImage`,
 * mens nettleseren bruker vanlig CSS `backgroundImage`.
 */
export function gradient(css: string): ViewStyle {
  if (Platform.OS === 'web') {
    return { backgroundImage: css } as ViewStyle;
  }
  return { experimental_backgroundImage: css };
}
