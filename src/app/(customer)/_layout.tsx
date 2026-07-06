import { Stack } from 'expo-router';

import { brandColors } from '@/theme/colors';

export default function CustomerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
        contentStyle: {
          backgroundColor: brandColors.white,
        },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="product/[id]" />
      <Stack.Screen name="cart/index" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="payment/index" />
      <Stack.Screen name="payment/compare" />
      <Stack.Screen name="payment/upload-proof" />
      <Stack.Screen name="payment/verification-initiated" />
      <Stack.Screen name="order-confirmation/index" />
    </Stack>
  );
}
