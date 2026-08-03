import { memo, useMemo } from 'react';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DispatchTruckIllustration } from '@/icons';
import { Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { SellerHeader } from '@/seller/components/SellerHeader';
import { ShipmentCard } from '@/seller/modules/dispatch/components';
import { useDispatchStore } from '@/seller/modules/dispatch/store/dispatchStore';

export const DispatchSuccessScreen = memo(function DispatchSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const orders = useDispatchStore((state) => state.dispatchOrders);
  const order = useMemo(() => orders.find((item) => item.id === orderId) ?? null, [orderId, orders]);

  if (!order) {
    return null;
  }

  return (
    <View className="flex-1 bg-brand-background">
      <SellerHeader title="Dispatch Success" showBack onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 132 }}
      >
        <View className="items-center rounded-[28px] border border-brand-border bg-brand-white px-lg py-2xl">
          <DispatchTruckIllustration width={168} height={124} />
          <Typography variant="headingLeft" className="mt-lg text-center text-[26px]">
            Shipment Successfully Dispatched
          </Typography>
          <Typography variant="subheadingLeft" className="mt-sm text-center text-brand-body">
            The order is now moving through the live shipment stage.
          </Typography>
        </View>

        <View className="mt-lg">
          <ShipmentCard order={order} />
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="gap-sm">
          <Pressable
            onPress={() =>
              router.push({ pathname: ROUTES.CUSTOMER.SHIPMENT_TRACKING, params: { orderId: order.id } } as unknown as Href)
            }
            className="rounded-2xl bg-brand-navy px-lg py-md"
          >
            <Typography variant="button" className="text-center text-brand-white">
              Track Shipment
            </Typography>
          </Pressable>
          <Pressable
            onPress={() => router.replace(ROUTES.SELLER.DISPATCH as Href)}
            className="rounded-2xl border border-brand-border bg-brand-white px-lg py-md"
          >
            <Typography variant="button" className="text-center text-brand-heading">
              Back To Orders
            </Typography>
          </Pressable>
        </View>
      </View>
    </View>
  );
});
