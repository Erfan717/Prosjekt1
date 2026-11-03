import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'display'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'eyebrow'
    | 'subtitle'
    | 'stat'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return <Text style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 600,
  },
  /** Liten etikett i store bokstaver med luft mellom bokstavene */
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 600,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
  },
  /** Stor, elegant serif-tekst – brukes til dagens ord */
  display: {
    fontFamily: Fonts.serif,
    fontSize: 44,
    lineHeight: 52,
    fontWeight: 400,
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: 400,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 600,
  },
  /** Store tall på fremgangssiden */
  stat: {
    fontFamily: Fonts.serif,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: 400,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: Colors.dark.accent,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
