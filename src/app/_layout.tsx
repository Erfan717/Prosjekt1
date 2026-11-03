import { DarkTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import { BrukerProvider, useBruker } from '@/hooks/bruker';
import { FremgangProvider } from '@/hooks/fremgang';

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
        <FremgangProvider>
          <AnimatedSplashOverlay />
          <Navigasjon />
        </FremgangProvider>
      </BrukerProvider>
    </ThemeProvider>
  );
}

/**
 * Rekkefølgen er: registrering → målspørsmål → selve appen (fanene).
 * `Stack.Protected` sender deg automatisk til riktig side når `guard` endrer seg.
 */
function Navigasjon() {
  const { bruker, laster } = useBruker();

  // Vent til vi vet om noen er lagret, så registreringen ikke blinker forbi.
  if (laster) return null;

  const innlogget = bruker !== null;
  const harMaal = bruker?.maal !== undefined;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.dark.background } }}>
      <Stack.Protected guard={innlogget && harMaal}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="ovelse" />
      </Stack.Protected>
      <Stack.Protected guard={innlogget && !harMaal}>
        <Stack.Screen name="maal" />
      </Stack.Protected>
      <Stack.Protected guard={!innlogget}>
        <Stack.Screen name="registrer" />
      </Stack.Protected>
    </Stack>
  );
}
