import { memo, useCallback, useEffect, useMemo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BlindMarketplaceNotice,
  OrderDocumentsCard,
  PurchaseOrderInfoCard,
  TransactionScopeCard,
  WorkflowVerificationTimeline,
} from '@/components/order';
import { DeliveryTimelineCard } from '@/components/delivery';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Typography } from '@/components/ui';
import {
  buildCreditOrderDetailTimeline,
  isCreditPaymentFlow,
} from '@/constants/creditWorkflow';
import { buildWorkflowTimelineSteps } from '@/constants/purchaseOrderTimeline';
import { deriveOrderDisplayStatus, formatOrderNumber } from '@/constants/orderStatus';
import { BackArrowIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  selectOrders,
  useOrderStore,
} from '@/store/order-store';
import { brandColors } from '@/theme/colors';

export const CustomerOrderDetailScreen = memo(function CustomerOrderDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const orders = useOrderStore(selectOrders);
  const currentOrder = useOrderStore(selectCurrentOrder);
  const isHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);

  useEffect(() => {
    if (!isHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isHydrated]);

  const order = useMemo(() => {
    if (orderId) {
      return orders.find((item) => item.id === orderId) ?? null;
    }
    return currentOrder;
  }, [currentOrder, orderId, orders]);

  const timelineSteps = useMemo(
    () => buildWorkflowTimelineSteps(order?.workflowTimeline ?? null),
    [order?.workflowTimeline],
  );

  const creditTimelineSteps = useMemo(
    () => (order && isCreditPaymentFlow(order) ? buildCreditOrderDetailTimeline(order) : []),
    [order],
  );

  const displayStatus = order ? deriveOrderDisplayStatus(order) : 'processing';

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.ORDERS as Href);
  }, [router]);

  return (
    <View className="flex-1 bg-brand-background">
      <View
        className="border-b border-brand-border bg-brand-white px-lg"
        style={{ paddingTop: insets.top }}
      >
        <View className="h-14 flex-row items-center justify-between">
          <View className="flex-row items-center">
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
              Order Details
            </Typography>
          </View>
          {order ? (
            <OrderStatusBadge status={displayStatus} className="rounded-full" />
          ) : null}
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
        {order ? (
          <>
            <Typography variant="headingLeft" className="text-[20px] text-brand-heading">
              {formatOrderNumber(order.id)}
            </Typography>
            <Typography variant="subheadingLeft" className="mt-xs text-[14px] text-brand-body">
              {order.productName} • {order.quantityMt} MT • {order.destination}
            </Typography>
            <Typography variant="fieldLabel" className="mt-xs text-[11px] text-brand-muted">
              Payment: {order.paymentMethod}
            </Typography>

            {order.poNumber ? (
              <PurchaseOrderInfoCard
                poNumber={order.poNumber}
                orderNumber={order.id}
                className="mt-lg"
              />
            ) : null}

            <TransactionScopeCard
              material={order.productName}
              netWeight={`${order.quantityMt} MT`}
              originHub={order.warehouse}
              dispatchReadiness={order.dispatchReadiness ?? '—'}
              transitWindow={order.transitWindow ?? '—'}
              className="mt-lg"
            />

            {isCreditPaymentFlow(order) && creditTimelineSteps.length > 0 ? (
              <DeliveryTimelineCard
                steps={creditTimelineSteps.map((step) => ({
                  ...step,
                  id: step.id as 'order_submitted',
                }))}
                className="mt-lg"
              />
            ) : (
              <WorkflowVerificationTimeline steps={timelineSteps} className="mt-lg" />
            )}

            <OrderDocumentsCard className="mt-lg" />

            <BlindMarketplaceNotice className="mt-lg" />
          </>
        ) : (
          <Typography variant="subheadingLeft" className="text-center text-brand-body">
            Order not found.
          </Typography>
        )}
      </ScrollView>
    </View>
  );
});
