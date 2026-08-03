import { memo, useMemo } from 'react';

import { ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { AlertCircleIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { useSellerOrdersStore } from '@/seller/modules/seller-orders/store/sellerOrdersStore';
import { SellerPrimaryButton } from '@/seller/components';
import { brandColors } from '@/theme/colors';

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export const OrderRejectedScreen = memo(function OrderRejectedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const getOrder = useSellerOrdersStore((state) => state.getOrder);

  const order = useMemo(() => (orderId ? getOrder(orderId) : undefined), [getOrder, orderId]);

  if (!order) {
    return (
      <ScreenWrapper className="bg-brand-background">
        <Typography variant="roleTitle">Order not found.</Typography>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <ScrollView
        className="flex-1 px-lg"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center rounded-[28px] bg-brand-white px-lg py-2xl">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-error-light">
            <AlertCircleIcon size={36} color={brandColors.error} />
          </View>
          <Typography variant="headingLeft" className="mt-lg text-center text-[28px]">
            Order Rejected
          </Typography>
          <Typography variant="subheading" className="mt-sm text-center text-brand-body">
            The buyer has been notified with your rejection reason.
          </Typography>
        </View>

        <View className="mt-xl rounded-[24px] border border-brand-border bg-brand-white p-lg">
          <View className="flex-row flex-wrap">
            {[
              { label: 'Order ID', value: `#${order.orderId}` },
              { label: 'Reason', value: order.rejectionReason ?? 'Other' },
              { label: 'Remarks', value: order.rejectionRemarks ?? '—' },
              {
                label: 'Rejected Time',
                value: order.rejectedAt ? formatDateTime(order.rejectedAt) : '—',
              },
            ].map((item) => (
              <View key={item.label} className="mb-md w-full">
                <Typography variant="fieldLabel">{item.label}</Typography>
                <Typography variant="roleTitle" className="mt-xs">
                  {item.value}
                </Typography>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-lg">
          <SellerPrimaryButton
            label="Back To Orders"
            onPress={() => router.replace(ROUTES.SELLER.ORDERS as Href)}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
});
