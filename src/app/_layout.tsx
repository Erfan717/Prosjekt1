import { DarkTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import { BrukerProvider, useBruker } from '@/hooks/bruker';

// Appen er alltid mørk. Vi bygger på React Navigation sitt mørke tema med våre farger.
const morktTema: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.accent,
    background: Colors.dark.background,
    card: Colors.dark.background,
    text: Colors.dark.text,
    border: Colors.dark.border,
  },
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider value={morktTema}>
      <BrukerProvider>
        <AnimatedSplashOverlay />
        <Navigasjon />
      </BrukerProvider>
    </ThemeProvider>
  );
}

/**
 * Viser registreringen til man har en bruker, og selve appen (fanene) etterpå.
 * `Stack.Protected` sender deg automatisk til riktig side når `guard` endrer seg.
 */
function Navigasjon() {
  const { bruker } = useBruker();
  const innlogget = bruker !== null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.dark.background } }}>
      <Stack.Protected guard={innlogget}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!innlogget}>
        <Stack.Screen name="registrer" />
      </Stack.Protected>
    </Stack>
  );
}
