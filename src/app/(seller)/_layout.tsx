import { Stack } from 'expo-router';

import { brandColors } from '@/theme/colors';

export default function SellerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 180,
        contentStyle: {
          backgroundColor: brandColors.background,
        },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="company" />
      <Stack.Screen name="verification" />
      <Stack.Screen name="review" />
      <Stack.Screen name="verification-submitted" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="add-product" />
      <Stack.Screen name="product-published" />
      <Stack.Screen name="inventory" />
      <Stack.Screen name="inventory-history" />
      <Stack.Screen name="inventory-success" />
      <Stack.Screen name="products" />
      <Stack.Screen name="product-detail" />
      <Stack.Screen name="edit-product" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="order-eligibility" />
      <Stack.Screen name="order-accepted" />
      <Stack.Screen name="order-rejected" />
      <Stack.Screen name="customers" />
      <Stack.Screen name="settlements" />
      <Stack.Screen name="settlement-details" />
      <Stack.Screen name="settlement-released" />
      <Stack.Screen name="settlement-history" />
      <Stack.Screen name="settlement-documents" />
      <Stack.Screen name="payments" />
      <Stack.Screen name="warehouse" />
      <Stack.Screen name="dispatch" />
      <Stack.Screen name="dispatch-detail" />
      <Stack.Screen name="dispatch-management" />
      <Stack.Screen name="assign-vehicle" />
      <Stack.Screen name="invoice-generated" />
      <Stack.Screen name="dispatch-ready" />
      <Stack.Screen name="dispatch-success" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="support" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="profile-edit" />
      <Stack.Screen name="profile-company" />
      <Stack.Screen name="profile-address" />
      <Stack.Screen name="profile-gst" />
      <Stack.Screen name="profile-bank" />
      <Stack.Screen name="profile-kyc" />
      <Stack.Screen name="profile-trade-licenses" />
      <Stack.Screen name="profile-documents" />
      <Stack.Screen name="profile-security" />
      <Stack.Screen name="shipments" />
      <Stack.Screen name="shipment-details" />
      <Stack.Screen name="offers" />
      <Stack.Screen name="create-offer" />
      <Stack.Screen name="edit-offer" />
      <Stack.Screen name="offer-preview" />
      <Stack.Screen name="offer-review-status" />
      <Stack.Screen name="offer-details" />
      <Stack.Screen name="offer-approved" />
      <Stack.Screen name="offer-paused" />
      <Stack.Screen name="offer-expired" />
      <Stack.Screen name="purchase-requests" />
      <Stack.Screen name="purchase-request-detail" />
      <Stack.Screen name="price-revisions" />
      <Stack.Screen name="vehicle-slots" />
      <Stack.Screen name="procurement-workbench" />
      <Stack.Screen name="import-trading/index" />
      <Stack.Screen name="import-trading/mine" />
      <Stack.Screen name="import-trading/form" />
      <Stack.Screen name="import-trading/listing" />
      <Stack.Screen name="import-trading/market" />
      <Stack.Screen name="import-trading/market-listing" />
      <Stack.Screen name="import-trading/negotiations" />
      <Stack.Screen name="import-trading/negotiation" />
      <Stack.Screen name="import-trading/deals" />
      <Stack.Screen name="import-trading/deal" />
      <Stack.Screen name="search" />
      <Stack.Screen name="raise-ticket" />
    </Stack>
  );
}
