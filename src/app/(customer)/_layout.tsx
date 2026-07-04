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
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="product-details"
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack>

  );
}
