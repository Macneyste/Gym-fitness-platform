import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts as useInter } from '@expo-google-fonts/inter';
import { SpaceGrotesk_500Medium, SpaceGrotesk_700Bold, useFonts as useSpaceGrotesk } from '@expo-google-fonts/space-grotesk';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { I18nProvider } from '@/i18n';
import { configureNotifications } from '@/lib/reminders';
import { StoreProvider, useStore } from '@/store';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);
SystemUI.setBackgroundColorAsync(colors.bg).catch(() => undefined);

function Navigator() {
  const { state } = useStore();
  const [spaceReady, spaceError] = useSpaceGrotesk({ SpaceGrotesk_500Medium, SpaceGrotesk_700Bold });
  const [interReady, interError] = useInter({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold });
  // A font that fails to load must never block the app: fall back to system fonts.
  const fontsSettled = (spaceReady || !!spaceError) && (interReady || !!interError);

  // Safety net: never sit on the splash/blank screen for more than a few seconds.
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), 4000);
    return () => clearTimeout(id);
  }, []);

  const ready = state.hydrated && (fontsSettled || timedOut);

  useEffect(() => {
    if (spaceError || interError) console.warn('[xoog] Font loading failed, using system fonts', spaceError ?? interError);
  }, [spaceError, interError]);

  useEffect(() => {
    configureNotifications();
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen name="live/[id]" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom', gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <StoreProvider>
          <StatusBar style="light" />
          <Navigator />
        </StoreProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
