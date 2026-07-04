import { Stack } from 'expo-router';

import { brandColors } from '@/theme/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 320,
        contentStyle: {
          backgroundColor: brandColors.white,
        },
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}
