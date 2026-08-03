import { memo, useMemo } from 'react';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckCircleIcon } from '@/icons';
import { Typography } from '@/components';
import { brandColors } from '@/theme/colors';
import { SellerHeader } from '@/seller/components/SellerHeader';
import { InvoiceCard } from '@/seller/modules/dispatch/components';
import { useDispatchStore } from '@/seller/modules/dispatch/store/dispatchStore';
import { ROUTES } from '@/navigation/routes';

export const InvoiceGeneratedScreen = memo(function InvoiceGeneratedScreen() {
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
      <SellerHeader title="Invoice Generated" showBack onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 132 }}
      >
        <View className="items-center rounded-[28px] border border-brand-border bg-brand-white px-lg py-2xl">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-success-light">
            <CheckCircleIcon size={42} color={brandColors.success} />
          </View>
          <Typography variant="headingLeft" className="mt-lg text-center text-[26px]">
            Invoice Generated Successfully
          </Typography>
          <Typography variant="subheadingLeft" className="mt-sm text-center text-brand-body">
            The commercial invoice is ready and synchronized with the dispatch workflow.
          </Typography>
        </View>

        <View className="mt-lg">
          <InvoiceCard order={order} />
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="gap-sm">
          <Pressable
            onPress={() =>
              Toast.show({
                type: 'success',
                text1: 'Download prepared',
                text2: `${order.invoiceNumber ?? 'Invoice'} PDF is ready.`,
              })
            }
            className="rounded-2xl border border-brand-border bg-brand-white px-lg py-md"
          >
            <Typography variant="button" className="text-center text-brand-heading">
              Download PDF
            </Typography>
          </Pressable>
          <Pressable
            onPress={() =>
              router.replace({
                pathname: ROUTES.SELLER.DISPATCH_MANAGEMENT,
                params: { orderId: order.id },
              } as unknown as Href)
            }
            className="rounded-2xl bg-brand-navy px-lg py-md"
          >
            <Typography variant="button" className="text-center text-brand-white">
              Continue
            </Typography>
          </Pressable>
        </View>
      </View>
    </View>
  );
});
