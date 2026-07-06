import { memo, useCallback } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrderDetailsCard } from '@/components/order';
import { PrimaryButton, Typography } from '@/components/ui';
import { formatPaymentCurrency } from '@/constants/payment';
import { BackArrowIcon, CheckCircleIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { selectCurrentOrder, useOrderStore } from '@/store/order-store';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

export const CustomerPurchaseOrderGeneratedScreen = memo(
  function CustomerPurchaseOrderGeneratedScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const order = useOrderStore(selectCurrentOrder);

    const handleBackHome = useCallback(() => {
      router.replace(ROUTES.CUSTOMER.HOME as Href);
    }, [router]);

    const handleBack = useCallback(() => {
      if (router.canGoBack()) {
        router.back();
        return;
      }

      handleBackHome();
    }, [handleBackHome, router]);

    return (
      <View className="flex-1 bg-brand-background">
        <View
          className="border-b border-brand-border bg-brand-white px-lg"
          style={{ paddingTop: insets.top }}
        >
          <View className="h-14 flex-row items-center">
            <Pressable
              onPress={handleBack}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              className="h-10 w-10 items-center justify-center"
            >
              <BackArrowIcon color={brandColors.heading} />
            </Pressable>
            <Typography variant="roleTitle" className="ml-sm text-[17px] text-brand-heading">
              Purchase Order Generated
            </Typography>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <View className="items-center rounded-2xl border border-brand-border bg-brand-white px-lg py-xl">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-success-light">
              <CheckCircleIcon size={iconSizes.xl} color={brandColors.success} />
            </View>
            <Typography
              variant="headingLeft"
              className="mt-md text-center text-[22px] text-brand-heading"
            >
              Purchase Order Generated
            </Typography>
            <Typography
              variant="subheadingLeft"
              className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
            >
              PetroTrade has confirmed your order and generated a digitally signed purchase order.
            </Typography>
          </View>

          {order ? (
            <>
              <OrderDetailsCard
                order={order}
                destination={order.destination}
                className="mt-lg"
              />
              <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white px-lg py-lg">
                <Typography
                  variant="fieldLabel"
                  className="text-[10px] tracking-[0.8px] text-brand-muted"
                >
                  CONFIRMED PAYABLE
                </Typography>
                <Typography variant="headingLeft" className="mt-xs text-[24px] text-brand-primary">
                  {formatPaymentCurrency(order.amount)}
                </Typography>
              </View>
            </>
          ) : null}
        </ScrollView>

        <View
          className="border-t border-brand-border bg-brand-white px-lg pt-md"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <PrimaryButton label="Back to Home" onPress={handleBackHome} />
        </View>
      </View>
    );
  },
);
