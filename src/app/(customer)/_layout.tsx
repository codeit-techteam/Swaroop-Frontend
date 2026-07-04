import { Stack } from 'expo-router';

import { brandColors } from '@/theme/colors';

export default function CustomerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: {
          backgroundColor: brandColors.white,
        },
      }}
    >
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}
