import { memo, useMemo } from 'react';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DispatchTruckIllustration } from '@/icons';
import { Typography } from '@/components';
import { SellerHeader } from '@/seller/components/SellerHeader';
import { useDispatchStore } from '@/seller/modules/dispatch/store/dispatchStore';
import { ROUTES } from '@/navigation/routes';

export const DispatchReadyScreen = memo(function DispatchReadyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const orders = useDispatchStore((state) => state.dispatchOrders);
  const markDispatched = useDispatchStore((state) => state.markDispatched);
  const order = useMemo(() => orders.find((item) => item.id === orderId) ?? null, [orderId, orders]);

  if (!order) {
    return null;
  }

  return (
    <View className="flex-1 bg-brand-background">
      <SellerHeader title="Dispatch Ready" showBack onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 132 }}
      >
        <View className="items-center rounded-[28px] border border-brand-border bg-brand-white px-lg py-2xl">
          <DispatchTruckIllustration width={168} height={124} />
          <Typography variant="headingLeft" className="mt-lg text-center text-[26px]">
            Shipment Ready For Dispatch
          </Typography>
        </View>

        <View className="mt-lg rounded-[22px] border border-brand-border bg-brand-white p-md">
          <View className="gap-md">
            {[
              `Vehicle Assigned: ${order.vehicleNumber ?? 'Pending'}`,
              `Invoice Generated: ${order.invoiceNumber ?? 'Pending'}`,
              `Loading Completed: ${order.loadingCompletedAt ? 'Done' : 'Pending'}`,
              `Quality Approved: ${order.qualityApproved ? 'Yes' : 'Pending'}`,
              `Dispatch Time: ${order.dispatchReadyAt ? 'Ready now' : 'Pending'}`,
            ].map((item) => (
              <Typography key={item} variant="roleTitle">
                {item}
              </Typography>
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Pressable
          onPress={() => {
            markDispatched(order.id);
            router.replace({
              pathname: ROUTES.SELLER.DISPATCH_SUCCESS,
              params: { orderId: order.id },
            } as unknown as Href);
          }}
          className="rounded-2xl bg-brand-navy px-lg py-md"
        >
          <Typography variant="button" className="text-center text-brand-white">
            Start Dispatch
          </Typography>
        </Pressable>
      </View>
    </View>
  );
});
