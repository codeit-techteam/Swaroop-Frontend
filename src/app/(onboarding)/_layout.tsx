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
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name="screen-one" />
      <Stack.Screen name="screen-two" />
    </Stack>
  );
}
