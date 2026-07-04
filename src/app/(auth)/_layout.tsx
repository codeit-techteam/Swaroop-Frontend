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
          backgroundColor: brandColors.background,
        },
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="role-selection" />
      <Stack.Screen name="customer-login" />
      <Stack.Screen name="customer-register" />
      <Stack.Screen name="otp-verification" />
      <Stack.Screen name="business-information" />
      <Stack.Screen name="kyc-documents" />
      <Stack.Screen name="review-submission" />
      <Stack.Screen name="application-submitted" />
    </Stack>
  );
}
