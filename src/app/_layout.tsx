import '../../global.css';

import { useEffect } from 'react';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '@/providers/app-providers';
import { brandColors } from '@/theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const RootLayoutNav = () => {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: {
            backgroundColor: brandColors.white,
          },
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(private)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
};

export default function RootLayout() {
  return (
    <AppProviders>
      <RootLayoutNav />
    </AppProviders>
  );
}
