import { memo, useCallback, useMemo, useState } from 'react';

import { Modal, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui';
import { TAB_BAR_HEIGHT } from '@/constants/dashboard';
import {
  getScreenRouteForOrder,
  getStatusSequenceForOrder,
  inferOrderStatus,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_PROGRESS,
  ORDER_STATUS_SEQUENCE,
} from '@/constants/orderWorkflow';
import { formatOrderNumber } from '@/constants/orderStatus';
import { formatPaymentCurrency } from '@/constants/payment';
import { ArrowRightIcon, BackArrowIcon, CheckCircleIcon, LightningIcon } from '@/icons';
import { selectCurrentOrder, useOrderStore } from '@/store/order-store';
import type { Order } from '@/types/order';
import type { OrderStatus } from '@/types/orderStatus';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

/** Screens where the simulator is useful. Hidden everywhere else (profile, home, market, etc.). */
const ORDER_FLOW_SEGMENTS = new Set([
  'orders',
  'order-detail',
  'order-submitted',
  'order-awaiting-confirmation',
  'order-confirmation',
  'procurement',
  'loading-scheduled',
  'loading-completed',
  'payment',
  'payment-reminder',
  'payment-success',
  'credit-approval',
  'credit-invoice-delivery',
  'credit-countdown',
  'credit-payment-reminder',
  'credit',
  'credit-restored',
  'dispatch-planning',
  'dispatch-started',
  'delivery-completed',
  'shipment-tracking',
  'purchase-order-generated',
]);

const isOrderFlowRoute = (segments: readonly string[]): boolean =>
  segments.some((segment) => ORDER_FLOW_SEGMENTS.has(segment));

/** Dev-only floating control to manually advance order status for frontend testing. */
export const OrderSimulator = memo(function OrderSimulator() {
  const [visible, setVisible] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const currentOrder = useOrderStore(selectCurrentOrder);
  const orders = useOrderStore((state) => state.orders);
  const setOrderStatus = useOrderStore((state) => state.setOrderStatus);
  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);

  const showOnThisScreen = isOrderFlowRoute(segments);
  const isOnTabs = segments.includes('(tabs)');
  const fabBottom = isOnTabs
    ? TAB_BAR_HEIGHT + Math.max(insets.bottom, 8) + 12
    : Math.max(insets.bottom, 16) + 12;

  const currentStatus = currentOrder ? inferOrderStatus(currentOrder) : null;
  const statusSequence = currentOrder
    ? getStatusSequenceForOrder(currentOrder)
    : ORDER_STATUS_SEQUENCE;
  const currentIndex = currentStatus ? statusSequence.indexOf(currentStatus) : -1;
  const previousStatus = currentIndex > 0 ? (statusSequence[currentIndex - 1] ?? null) : null;
  const nextStatus =
    currentIndex >= 0 && currentIndex < statusSequence.length - 1
      ? (statusSequence[currentIndex + 1] ?? null)
      : null;
  const progress = currentStatus ? (ORDER_STATUS_PROGRESS[currentStatus] ?? 0) : 0;

  const close = useCallback(() => setVisible(false), []);

  const handleSelectStatus = useCallback(
    (status: OrderStatus) => {
      if (!currentOrder) {
        return;
      }
      setOrderStatus(status);
    },
    [currentOrder, setOrderStatus],
  );

  const handleOpenMatchingScreen = useCallback(() => {
    const latest = useOrderStore.getState().currentOrder;
    if (!latest) {
      return;
    }
    setVisible(false);
    router.push(getScreenRouteForOrder(latest));
  }, [router]);

  const handleSelectOrder = useCallback(
    (order: Order) => {
      setCurrentOrder(order);
    },
    [setCurrentOrder],
  );

  const selectableOrders = useMemo(
    () => orders.filter((order) => order.shipmentStatus !== 'cancelled'),
    [orders],
  );

  if (!__DEV__ || !showOnThisScreen) {
    return null;
  }

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Open order simulator"
        className="absolute right-4 z-50 h-12 w-12 items-center justify-center rounded-full"
        style={({ pressed }) => ({
          bottom: fabBottom,
          backgroundColor: brandColors.heading,
          elevation: 8,
          opacity: pressed ? 0.85 : 1,
          shadowColor: brandColors.navy,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.28,
          shadowRadius: 8,
        })}
      >
        <LightningIcon size={iconSizes.md} color={brandColors.white} />
        {currentOrder ? (
          <View
            className="absolute rounded-full border-2"
            style={{
              top: 3,
              right: 3,
              width: 8,
              height: 8,
              backgroundColor: brandColors.success,
              borderColor: brandColors.heading,
            }}
          />
        ) : null}
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={close}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(16, 52, 96, 0.45)' }}>
          <Pressable className="flex-1" onPress={close} accessibilityLabel="Dismiss simulator" />

          <View
            className="overflow-hidden rounded-t-2xl bg-brand-white"
            style={{
              maxHeight: windowHeight * 0.88,
              paddingBottom: Math.max(insets.bottom, 16),
            }}
          >
            <View className="items-center pt-sm">
              <View className="h-1 w-10 rounded-full bg-brand-indicator" />
            </View>

            <View className="flex-row items-start justify-between px-lg pt-lg">
              <View className="flex-1 pr-md">
                <View className="flex-row items-center">
                  <Typography variant="headingLeft" className="text-[18px] text-brand-heading">
                    Order Simulator
                  </Typography>
                  <View className="ml-sm rounded-full bg-brand-primary-light px-sm py-xs">
                    <Typography variant="badge" className="text-[9px] tracking-[0.8px] text-brand-primary">
                      DEV
                    </Typography>
                  </View>
                </View>
                <Typography variant="subheadingLeft" className="mt-xs text-[13px] text-brand-muted">
                  Jump an order through its lifecycle to preview screens.
                </Typography>
              </View>
              <Pressable
                onPress={close}
                accessibilityRole="button"
                accessibilityLabel="Close order simulator"
                className="h-8 w-8 items-center justify-center rounded-full bg-brand-surface"
              >
                <Typography variant="roleTitle" className="text-[16px] text-brand-muted">
                  ×
                </Typography>
              </Pressable>
            </View>

            {currentOrder && currentStatus ? (
              <View className="mx-lg mt-lg rounded-xl bg-brand-primary-tint px-md py-md">
                <View className="flex-row items-center justify-between">
                  <Typography variant="fieldLabel" className="text-[10px] text-brand-primary">
                    {formatOrderNumber(currentOrder.id)}
                  </Typography>
                  <Typography variant="fieldLabel" className="text-[10px] text-brand-primary">
                    {progress}%
                  </Typography>
                </View>
                <Typography variant="roleTitle" className="mt-xs text-[15px] text-brand-heading">
                  {ORDER_STATUS_LABELS[currentStatus]}
                </Typography>
                <Typography variant="caption" className="mt-xs text-left text-[11px] tracking-[0.4px] text-brand-muted">
                  {currentOrder.productName} · {formatPaymentCurrency(currentOrder.amount)}
                </Typography>
                <View className="mt-md h-1.5 overflow-hidden rounded-full bg-brand-white">
                  <View
                    className="h-full rounded-full bg-brand-primary"
                    style={{ width: `${progress}%` }}
                  />
                </View>
              </View>
            ) : (
              <View className="mx-lg mt-lg rounded-xl border border-dashed border-brand-border bg-brand-surface px-md py-md">
                <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                  No active order
                </Typography>
                <Typography variant="subheadingLeft" className="mt-xs text-[13px] text-brand-muted">
                  {selectableOrders.length > 0
                    ? 'Pick an existing order below, or place a new one from checkout.'
                    : 'Place an order from checkout to simulate the lifecycle.'}
                </Typography>
              </View>
            )}

            {currentOrder ? (
              <View className="mt-lg flex-row gap-sm px-lg">
                <Pressable
                  disabled={!previousStatus}
                  onPress={() => previousStatus && handleSelectStatus(previousStatus)}
                  accessibilityRole="button"
                  accessibilityLabel="Go to previous status"
                  className="flex-1 flex-row items-center justify-center rounded-xl border border-brand-border py-md"
                  style={{ opacity: previousStatus ? 1 : 0.4 }}
                >
                  <BackArrowIcon size={iconSizes.md} color={brandColors.heading} />
                  <Typography variant="roleTitle" className="ml-xs text-[13px] text-brand-heading">
                    Previous
                  </Typography>
                </Pressable>
                <Pressable
                  disabled={!nextStatus}
                  onPress={() => nextStatus && handleSelectStatus(nextStatus)}
                  accessibilityRole="button"
                  accessibilityLabel="Advance to next status"
                  className="flex-1 flex-row items-center justify-center rounded-xl py-md"
                  style={{
                    backgroundColor: nextStatus ? brandColors.heading : brandColors.disabled,
                    opacity: nextStatus ? 1 : 0.6,
                  }}
                >
                  <Typography variant="roleTitle" className="mr-xs text-[13px] text-brand-white">
                    Next step
                  </Typography>
                  <ArrowRightIcon size={iconSizes.sm} color={brandColors.white} />
                </Pressable>
              </View>
            ) : null}

            <ScrollView
              className="mt-lg"
              style={{ maxHeight: windowHeight * 0.38 }}
              contentContainerClassName="px-lg pb-md"
              showsVerticalScrollIndicator={false}
            >
              {!currentOrder && selectableOrders.length > 0
                ? selectableOrders.map((order) => (
                    <Pressable
                      key={order.id}
                      onPress={() => handleSelectOrder(order)}
                      accessibilityRole="button"
                      accessibilityLabel={`Simulate ${formatOrderNumber(order.id)}`}
                      className="mb-sm rounded-xl border border-brand-border bg-brand-white px-md py-md"
                    >
                      <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                        {formatOrderNumber(order.id)}
                      </Typography>
                      <Typography variant="subheadingLeft" className="mt-xs text-[12px] text-brand-muted">
                        {order.productName} · {ORDER_STATUS_LABELS[inferOrderStatus(order)]}
                      </Typography>
                    </Pressable>
                  ))
                : statusSequence.map((status, index) => {
                    const isCurrent = status === currentStatus;
                    const isPast = currentIndex >= 0 && index < currentIndex;
                    const isDisabled = !currentOrder;
                    const isLast = index === statusSequence.length - 1;

                    return (
                      <Pressable
                        key={status}
                        disabled={isDisabled}
                        onPress={() => handleSelectStatus(status)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isCurrent, disabled: isDisabled }}
                        className="flex-row"
                        style={{ opacity: isDisabled ? 0.45 : 1 }}
                      >
                        <View className="mr-md w-5 items-center">
                          <View
                            className="h-5 w-5 items-center justify-center rounded-full"
                            style={{
                              backgroundColor: isCurrent ? brandColors.primary : brandColors.white,
                              borderWidth: isCurrent || isPast ? 0 : 1.5,
                              borderColor: brandColors.border,
                            }}
                          >
                            {isPast ? (
                              <CheckCircleIcon size={iconSizes.md} color={brandColors.success} />
                            ) : isCurrent ? (
                              <View className="h-2 w-2 rounded-full bg-brand-white" />
                            ) : null}
                          </View>
                          {isLast ? null : (
                            <View
                              className="w-0.5 flex-1"
                              style={{
                                backgroundColor: isPast ? brandColors.success : brandColors.border,
                                minHeight: 22,
                              }}
                            />
                          )}
                        </View>

                        <View
                          className="mb-sm flex-1 flex-row items-center justify-between rounded-xl border px-md py-md"
                          style={{
                            borderColor: isCurrent ? brandColors.primary : brandColors.border,
                            backgroundColor: isCurrent ? brandColors.primaryTint : brandColors.white,
                          }}
                        >
                          <Typography
                            variant="roleTitle"
                            className="text-[14px]"
                            style={{ color: isCurrent ? brandColors.primary : brandColors.heading }}
                          >
                            {ORDER_STATUS_LABELS[status]}
                          </Typography>
                          {isCurrent ? (
                            <View className="rounded-full bg-brand-primary-light px-sm py-xs">
                              <Typography variant="fieldLabel" className="text-[10px] text-brand-primary">
                                Current
                              </Typography>
                            </View>
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
            </ScrollView>

            {currentOrder ? (
              <Pressable
                onPress={handleOpenMatchingScreen}
                accessibilityRole="button"
                accessibilityLabel="Open matching order screen"
                className="mx-lg mt-sm items-center rounded-xl py-md"
                style={{ backgroundColor: brandColors.primary }}
              >
                <Typography variant="button" className="text-[14px]">
                  View matching screen
                </Typography>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
});
