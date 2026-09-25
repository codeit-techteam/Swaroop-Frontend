import { memo, useEffect, useState } from 'react';

import { ActivityIndicator, ScrollView, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { InfoIcon } from '@/icons';
import {
  CreditAssessmentCard,
  DestinationCard,
  OrderStatusBadge,
  OrderSummaryCard,
  TradeBehaviourCard,
} from '@/seller/modules/seller-orders/components';
import { useSellerOrdersStore } from '@/seller/modules/seller-orders/store/sellerOrdersStore';
import { SellerHeader } from '@/seller/components';
import {
  fetchSellerOrderById,
  fetchSellerOrderTimeline,
  type SellerOrderTimelineEvent,
} from '@/services/seller-orders-api';
import type { SellerOrder } from '@/seller/modules/seller-orders/types/sellerOrders';
import { brandColors } from '@/theme/colors';

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

export const OrderEligibilityScreen = memo(function OrderEligibilityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const getOrder = useSellerOrdersStore((state) => state.getOrder);

  const [order, setOrder] = useState<SellerOrder | undefined>(() =>
    orderId ? getOrder(orderId) : undefined,
  );
  const [timeline, setTimeline] = useState<SellerOrderTimelineEvent[]>([]);
  const [loading, setLoading] = useState(Boolean(orderId));

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void Promise.all([
      fetchSellerOrderById(orderId).catch(() => getOrder(orderId) ?? null),
      fetchSellerOrderTimeline(orderId).catch(() => ({ poNumber: orderId, events: [] })),
    ]).then(([detail, timelineResult]) => {
      if (cancelled) return;
      if (detail) setOrder(detail);
      setTimeline(timelineResult.events ?? []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [getOrder, orderId]);

  if (loading && !order) {
    return (
      <ScreenWrapper className="items-center justify-center bg-brand-background">
        <ActivityIndicator color={brandColors.primary} />
      </ScreenWrapper>
    );
  }

  if (!order) {
    return (
      <ScreenWrapper className="bg-brand-background">
        <Typography variant="roleTitle">Order not found.</Typography>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader title="Order Details" showBack onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <Typography variant="fieldLabel">REFERENCE ID</Typography>
        <Typography variant="headingLeft" className="mt-xs text-[28px]">
          #{order.orderId}
        </Typography>

        <View className="mt-md flex-row items-center gap-md">
          <OrderStatusBadge status={order.orderStatus} />
          <Typography variant="legal" className="text-brand-body">
            Created: {formatDate(order.createdAt)}
          </Typography>
        </View>

        <View className="mt-lg gap-lg">
          <OrderSummaryCard order={order} />
          <DestinationCard order={order} />
          <CreditAssessmentCard order={order} />
          <TradeBehaviourCard behaviour={order.tradeBehaviour} />

          {timeline.length > 0 ? (
            <View className="rounded-[20px] border border-brand-border bg-brand-white p-lg">
              <Typography variant="headingLeft" className="text-[18px]">
                Timeline
              </Typography>
              <View className="mt-md gap-md">
                {timeline.map((event, index) => (
                  <View key={event.id ?? `${event.label}-${index}`}>
                    <Typography variant="roleTitle" className="text-[14px]">
                      {event.label ?? event.eventType ?? 'Update'}
                    </Typography>
                    <Typography variant="legal" className="mt-0.5 text-brand-body">
                      {event.occurredAt || event.at
                        ? formatDate(String(event.occurredAt ?? event.at))
                        : event.status ?? ''}
                    </Typography>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View className="rounded-[20px] bg-[#EEF4FF] p-lg">
            <View className="flex-row items-start gap-sm">
              <InfoIcon size={18} color={brandColors.primaryDark} />
              <Typography variant="roleDescription" className="flex-1 text-left text-brand-body">
                Purchase orders are display-only. Accept or reject buyers from Purchase Requests.
                Buyer identity remains blind ({order.buyerName || 'Anonymous Buyer'}).
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
});
