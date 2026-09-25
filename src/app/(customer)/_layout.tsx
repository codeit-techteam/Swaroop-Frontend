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
      <Stack.Screen name="checkout/index" />
      <Stack.Screen name="payment/index" />
      <Stack.Screen name="payment/compare" />
      <Stack.Screen name="payment/upload-proof" />
      <Stack.Screen name="payment/verification-initiated" />
      <Stack.Screen name="order-submitted/index" />
      <Stack.Screen name="credit-approval/index" />
      <Stack.Screen name="credit-invoice-delivery/index" />
      <Stack.Screen name="credit-countdown/index" />
      <Stack.Screen name="credit-payment-reminder/index" />
      <Stack.Screen name="credit/upload-proof" />
      <Stack.Screen name="credit/verification" />
      <Stack.Screen name="credit/facility" />
      <Stack.Screen name="credit/request" />
      <Stack.Screen name="credit/application-status" />
      <Stack.Screen name="credit-restored/index" />
      <Stack.Screen name="loading-scheduled/index" />
      <Stack.Screen name="loading-completed/index" />
      <Stack.Screen name="payment-reminder/index" />
      <Stack.Screen name="payment-success/index" />
      <Stack.Screen name="procurement/confirmation" />
      <Stack.Screen name="order-awaiting-confirmation/index" />
      <Stack.Screen name="purchase-order-generated/index" />
      <Stack.Screen name="dispatch-planning/index" />
      <Stack.Screen name="dispatch-started/index" />
      <Stack.Screen name="delivery-completed/index" />
      <Stack.Screen name="shipment-tracking/index" />
      <Stack.Screen name="order-detail/index" />
      <Stack.Screen name="order-confirmation/index" />
      <Stack.Screen name="purchase-request-success/index" />
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="profile/company-details" />
      <Stack.Screen name="profile/saved-addresses" />
      <Stack.Screen name="profile/address-form" />
      <Stack.Screen name="profile/bank-accounts" />
      <Stack.Screen name="profile/tax-documents" />
      <Stack.Screen name="profile/documents" />
      <Stack.Screen name="profile/document-detail" />
      <Stack.Screen name="profile/bulk-logistics-quote" />
      <Stack.Screen name="notifications/index" />
    </Stack>
  );
}
