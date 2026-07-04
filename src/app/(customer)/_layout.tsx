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
        name="product/[id]"
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="cart/index"
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="payment/index"
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="payment/compare"
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="order-confirmation/index"
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack>

  );
}
