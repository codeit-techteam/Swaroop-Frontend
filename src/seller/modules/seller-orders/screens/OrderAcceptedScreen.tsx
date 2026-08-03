import { memo, useMemo } from 'react';

import { ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { CheckCircleIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { PAYMENT_METHOD_LABELS } from '@/seller/modules/seller-orders/services/sellerOrdersService';
import { useSellerOrdersStore } from '@/seller/modules/seller-orders/store/sellerOrdersStore';
import { SellerPrimaryButton } from '@/seller/components';
import { brandColors } from '@/theme/colors';

export const OrderAcceptedScreen = memo(function OrderAcceptedScreen() {
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
          <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-success-light">
            <CheckCircleIcon size={36} color={brandColors.success} />
          </View>
          <Typography variant="headingLeft" className="mt-lg text-center text-[28px]">
            Order Accepted Successfully
          </Typography>
          <Typography variant="subheading" className="mt-sm text-center text-brand-body">
            Inventory reserved and dispatch record created.
          </Typography>
        </View>

        <View className="mt-xl rounded-[24px] border border-brand-border bg-brand-white p-lg">
          <View className="flex-row flex-wrap">
            {[
              { label: 'Order ID', value: `#${order.orderId}` },
              { label: 'Material', value: order.material },
              { label: 'Quantity', value: `${order.quantity} MT` },
              { label: 'Destination', value: order.city },
              { label: 'Payment Type', value: PAYMENT_METHOD_LABELS[order.paymentMethod] },
            ].map((item) => (
              <View key={item.label} className="mb-md w-1/2 pr-sm">
                <Typography variant="fieldLabel">{item.label}</Typography>
                <Typography variant="roleTitle" className="mt-xs">
                  {item.value}
                </Typography>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-lg gap-sm">
          <SellerPrimaryButton
            label="Continue To Dispatch"
            onPress={() =>
              router.replace(
                `${ROUTES.SELLER.DISPATCH_MANAGEMENT}?orderId=${order.dispatchLinkId}` as Href,
              )
            }
          />
          <SellerPrimaryButton
            label="Back To Orders"
            onPress={() => router.replace(ROUTES.SELLER.ORDERS as Href)}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
});
