import { Stack } from 'expo-router';

import { brandColors } from '@/theme/colors';

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
      <Stack.Screen name="splash" options={{ animation: 'fade' }} />
      <Stack.Screen name="intro-one" />
      <Stack.Screen name="intro-two" />
    </Stack>
  );
}
