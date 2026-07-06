import { memo, useCallback, useEffect } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BlindMarketplaceInfoCard, OrderProgressTimeline } from '@/components/procurement';
import { PrimaryButton, Typography } from '@/components/ui';
import { formatPaymentCurrency } from '@/constants/payment';
import { ORDER_PROGRESS_STEP_IDS, PROCUREMENT_SCREEN_COPY } from '@/constants/procurementSteps';
import { BackArrowIcon, HourglassIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  selectPaymentProof,
  useOrderStore,
} from '@/store/order-store';
import { selectPaymentCalculation, usePaymentStore } from '@/store/payment-store';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { OrderProgressStep } from '@/types/procurement';
import { formatDateTime } from '@/utils/date';

const buildAwaitingTimeline = (
  procurement: NonNullable<ReturnType<typeof selectCurrentOrder>>['procurement'],
  paymentVerifiedAt: string | null,
): OrderProgressStep[] => {
  const paymentTime = procurement?.timeline.paymentVerifiedAt ?? paymentVerifiedAt;
  const forwardedTime = procurement?.timeline.orderForwardedAt;

  return [
    {
      id: ORDER_PROGRESS_STEP_IDS.PAYMENT_VERIFIED,
      title: 'Payment Verified',
      subtitle: paymentTime ? `Verified at ${formatDateTime(paymentTime, 'hh:mm A')}` : undefined,
      status: 'completed',
    },
    {
      id: ORDER_PROGRESS_STEP_IDS.ORDER_FORWARDED,
      title: 'Order Forwarded',
      subtitle: forwardedTime
        ? `Sent to Exchange at ${formatDateTime(forwardedTime, 'hh:mm A')}`
        : undefined,
      status: 'completed',
    },
    {
      id: ORDER_PROGRESS_STEP_IDS.SUPPLIER_MATCHING,
      title: 'Supplier Matching',
      subtitle: 'Matched with verified supplier',
      status: 'completed',
    },
    {
      id: ORDER_PROGRESS_STEP_IDS.INVENTORY_ALLOCATION,
      title: 'Inventory Allocation',
      subtitle: 'Inventory reserved successfully',
      status: 'completed',
    },
    {
      id: ORDER_PROGRESS_STEP_IDS.PURCHASE_ORDER_GENERATION,
      title: 'Purchase Order Generation',
      subtitle: 'Awaiting final confirmation',
      status: 'current',
    },
  ];
};

export const CustomerOrderAwaitingConfirmationScreen = memo(
  function CustomerOrderAwaitingConfirmationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const order = useOrderStore(selectCurrentOrder);
    const paymentProof = useOrderStore(selectPaymentProof);
    const payment = usePaymentStore(selectPaymentCalculation);
    const isOrderHydrated = useOrderStore(selectOrderHydrated);
    const hydrateOrder = useOrderStore((state) => state.hydrateOrder);

    useEffect(() => {
      if (!isOrderHydrated) {
        hydrateOrder();
      }
    }, [hydrateOrder, isOrderHydrated]);

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

    const timeline = buildAwaitingTimeline(
      order?.procurement ?? null,
      order?.paymentVerifiedAt ?? null,
    );

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
              Order Awaiting Confirmation
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
          <View className="items-center rounded-2xl border border-brand-border bg-brand-white px-md py-lg">
            <HourglassIcon size={iconSizes.xl} color={brandColors.primary} />
            <Typography
              variant="headingLeft"
              className="mt-md text-center text-[22px] text-brand-heading"
            >
              Awaiting Order Confirmation
            </Typography>
            <Typography
              variant="subheadingLeft"
              className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
            >
              PetroTrade is finalizing your purchase order. You will be notified once confirmation
              is complete.
            </Typography>
          </View>

          {order ? (
            <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white px-lg py-lg">
              <Typography
                variant="fieldLabel"
                className="text-[10px] tracking-[0.6px] text-brand-muted"
              >
                ORDER REFERENCE
              </Typography>
              <Typography variant="roleTitle" className="mt-xs text-[16px] text-brand-heading">
                {order.id}
              </Typography>
              <Typography variant="roleDescription" className="mt-sm text-brand-body">
                {order.productName} · {order.quantityMt} MT
              </Typography>
              <Typography variant="roleTitle" className="mt-md text-[18px] text-brand-primary">
                Payable: {formatPaymentCurrency(order.amount ?? payment.payableAmount)}
              </Typography>
              {paymentProof ? (
                <Typography variant="roleDescription" className="mt-sm text-brand-body">
                  UTR: {paymentProof.utr} · {paymentProof.paymentMode}
                </Typography>
              ) : null}
            </View>
          ) : null}

          <OrderProgressTimeline
            steps={timeline}
            heading={PROCUREMENT_SCREEN_COPY.progressHeading}
            className="mt-lg"
          />

          <BlindMarketplaceInfoCard className="mt-lg" />
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
