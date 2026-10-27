import { Stack } from 'expo-router';

import { brandColors } from '@/theme/colors';

// SDK 58: anchors seed a back destination for deep links / splash `replace`.
export const unstable_settings = {
  anchor: 'intro-one',
};

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 320,
        contentStyle: {
          backgroundColor: brandColors.background,
        },
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="splash" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="intro-one" options={{ gestureEnabled: false }} />
      <Stack.Screen name="intro-two" />
    </Stack>
  );
}
