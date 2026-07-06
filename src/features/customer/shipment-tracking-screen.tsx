import { memo, useCallback, useEffect, useMemo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrderProgressTimeline } from '@/components/orders';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Typography } from '@/components/ui';
import {
  buildWorkflowTimelineSteps,
} from '@/constants/purchaseOrderTimeline';
import {
  deriveOrderDisplayStatus,
  formatOrderNumber,
  getOrderProgressColor,
  getOrderProgressLabel,
} from '@/constants/orderStatus';
import { BackArrowIcon, TruckIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  selectOrders,
  useOrderStore,
} from '@/store/order-store';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type TrackingFieldProps = {
  label: string;
  value: string;
};

const TrackingField = memo(function TrackingField({ label, value }: TrackingFieldProps) {
  return (
    <View className="flex-1 rounded-xl border border-brand-border bg-brand-white px-md py-md">
      <Typography variant="fieldLabel" className="text-[10px] tracking-[0.8px] text-brand-muted">
        {label}
      </Typography>
      <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
        {value}
      </Typography>
    </View>
  );
});

export const CustomerShipmentTrackingScreen = memo(function CustomerShipmentTrackingScreen() {
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

  const displayStatus = order ? deriveOrderDisplayStatus(order) : 'processing';
  const progressColor = order ? getOrderProgressColor(order) : brandColors.primary;
  const progressLabel = order ? getOrderProgressLabel(order) : '';
  const timelineSteps = useMemo(
    () => buildWorkflowTimelineSteps(order?.workflowTimeline ?? null),
    [order?.workflowTimeline],
  );

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
            Shipment Tracking
          </Typography>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: insets.bottom + 24,
        }}
      >
        {order ? (
          <>
            <View className="flex-row items-center justify-between">
              <Typography variant="headingLeft" className="text-[20px] text-brand-heading">
                {formatOrderNumber(order.id)}
              </Typography>
              <OrderStatusBadge status={displayStatus} className="rounded-full" />
            </View>

            <Typography variant="subheadingLeft" className="mt-sm text-[14px] text-brand-body">
              {order.productName} • {order.quantityMt} MT
            </Typography>

            <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
              <View className="flex-row items-center gap-sm">
                <TruckIcon size={iconSizes.md} color={brandColors.primary} />
                <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
                  {progressLabel}
                </Typography>
              </View>

              <OrderProgressTimeline
                order={order}
                progressColor={progressColor}
                className="mt-lg"
              />
            </View>

            <View className="mt-lg flex-row gap-md">
              <TrackingField label="VEHICLE" value="MH-12-AB-4521" />
              <TrackingField label="DRIVER" value="Verified PetroTrade Partner" />
            </View>

            <View className="mt-md flex-row gap-md">
              <TrackingField label="ETA" value={order.eta ?? order.transitWindow ?? '—'} />
              <TrackingField label="DESTINATION" value={order.destination} />
            </View>

            <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
              <Typography
                variant="fieldLabel"
                className="mb-md text-[10px] tracking-[0.8px] text-brand-muted"
              >
                DELIVERY TIMELINE
              </Typography>
              {timelineSteps
                .filter((step) =>
                  [
                    'dispatch_planning',
                    'vehicle_allocation',
                    'driver_assigned',
                    'shipment_ready',
                    'shipment_started',
                    'delivered',
                  ].includes(step.id),
                )
                .map((step) => (
                  <View key={step.id} className="mb-md flex-row items-start gap-md">
                    <View
                      className="mt-1 h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          step.status === 'completed' || step.status === 'current'
                            ? brandColors.primary
                            : brandColors.border,
                      }}
                    />
                    <View className="flex-1">
                      <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                        {step.title}
                      </Typography>
                      {step.subtitle ? (
                        <Typography
                          variant="subheadingLeft"
                          className="mt-xs text-[12px] text-brand-body"
                        >
                          {step.subtitle}
                        </Typography>
                      ) : null}
                    </View>
                  </View>
                ))}
            </View>
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
