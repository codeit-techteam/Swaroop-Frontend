import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';

import {
  downloadOrderInvoice,
  downloadOrderSummary,
  raiseSupportTicket,
} from '@/api/order-tracking';
import type { TrackingMenuAction } from '@/components/tracking';
import { isCreditPaymentFlow } from '@/constants/creditWorkflow';
import { getRouteAfterCreditDelivery } from '@/constants/paymentNavigation';
import { inferOrderStatus } from '@/constants/orderWorkflow';
import { TRACKING_COPY, TRACKING_DEMO_MODE } from '@/constants/trackingTimeline';
import { ROUTES } from '@/navigation/routes';
import { fetchCustomerOrderById, fetchCustomerOrderTimeline } from '@/services/orders';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  selectOrders,
  useOrderStore,
} from '@/store/order-store';
import type { Order } from '@/types/order';
import type { TrackingOrderStatus, TrackingTimelineItem } from '@/types/tracking';

type TimelineEvent = {
  at: string;
  type: string;
  label: string;
};

type UseOrderTrackingResult = {
  order: Order | null;
  timelineItems: TrackingTimelineItem[];
  trackingStatus: TrackingOrderStatus;
  canCancelOrder: boolean;
  isDemoMode: boolean;
  timelineLoading: boolean;
  timelineError: string | null;
  showCreditDeliveryContinue: boolean;
  moreMenuRef: React.RefObject<BottomSheetModal | null>;
  handleBack: () => void;
  handleNotifications: () => void;
  handleOpenMoreMenu: () => void;
  handleMoreMenuAction: (action: TrackingMenuAction) => void;
  handleDownloadSummary: () => void;
  handleContinueToCreditInvoice: () => void;
};

const formatEventStamp = (iso: string): { date: string; time: string } => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return { date: '—', time: '' };
  }
  return {
    date: date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  };
};

const deriveStatusFromEvents = (events: TimelineEvent[]): TrackingOrderStatus => {
  const types = events.map((event) => event.type.toUpperCase());
  if (types.some((type) => type.includes('DELIVER'))) return 'delivered';
  if (types.some((type) => type.includes('OUT_FOR_DELIVERY'))) return 'out_for_delivery';
  if (types.some((type) => type.includes('SHIPMENT') || type.includes('DISPATCH') || type.includes('TRANSIT'))) {
    return 'transit';
  }
  if (types.some((type) => type.includes('DISPATCH') || type.includes('VEHICLE'))) {
    return 'dispatched';
  }
  return 'preparing';
};

const mapEventsToTimelineItems = (events: TimelineEvent[]): TrackingTimelineItem[] => {
  if (!events.length) return [];

  const sorted = [...events].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );

  return sorted.map((event, index) => {
    const { date, time } = formatEventStamp(event.at);
    const isLast = index === sorted.length - 1;
    return {
      id: `${event.type}-${index}` as TrackingTimelineItem['id'],
      title: event.label || event.type.replaceAll('_', ' '),
      date,
      time,
      statusLabel: isLast ? 'Current' : 'Completed',
      status: isLast ? 'current' : 'completed',
    };
  });
};

export const useOrderTracking = (): UseOrderTrackingResult => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const moreMenuRef = useRef<BottomSheetModal>(null);

  const orders = useOrderStore(selectOrders);
  const currentOrder = useOrderStore(selectCurrentOrder);
  const isHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const setSelectedOrderId = useOrderStore((state) => state.setSelectedOrderId);
  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);

  const [remoteOrder, setRemoteOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isHydrated]);

  useEffect(() => {
    if (orderId) {
      setSelectedOrderId(orderId);
    }
  }, [orderId, setSelectedOrderId]);

  const localOrder = useMemo(() => {
    if (orderId) {
      return orders.find((item) => item.id === orderId) ?? null;
    }
    return currentOrder;
  }, [currentOrder, orderId, orders]);

  const order = remoteOrder ?? localOrder;

  useEffect(() => {
    const id = orderId || localOrder?.id;
    if (!id) {
      setEvents([]);
      setTimelineError(null);
      return;
    }

    let cancelled = false;
    setTimelineLoading(true);
    setTimelineError(null);

    void (async () => {
      try {
        const [detail, timeline] = await Promise.all([
          fetchCustomerOrderById(id),
          fetchCustomerOrderTimeline(id),
        ]);
        if (cancelled) return;
        if (detail) {
          setRemoteOrder(detail);
          setCurrentOrder(detail);
        }
        setEvents(timeline?.events ?? []);
      } catch (cause) {
        if (cancelled) return;
        setEvents([]);
        setTimelineError(
          cause instanceof Error ? cause.message : 'Unable to load order timeline',
        );
      } finally {
        if (!cancelled) setTimelineLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [localOrder?.id, orderId, setCurrentOrder]);

  const timelineItems = useMemo(() => mapEventsToTimelineItems(events), [events]);

  const trackingStatus = useMemo(() => {
    if (events.length > 0) {
      return deriveStatusFromEvents(events);
    }
    if (!order) return 'preparing';
    const status = inferOrderStatus(order);
    if (status === 'DELIVERED' || status === 'DELIVERY_COMPLETED') return 'delivered';
    if (status === 'OUT_FOR_DELIVERY') return 'out_for_delivery';
    if (status === 'IN_TRANSIT' || status === 'DISPATCH_STARTED') return 'transit';
    return 'preparing';
  }, [events, order]);

  const canCancelOrder = Boolean(
    order &&
      (!order.dispatchStatus ||
        order.dispatchStatus === 'planning' ||
        order.dispatchStatus === 'vehicle_allocation'),
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.ORDERS as Href);
  }, [router]);

  const handleNotifications = useCallback(() => {
    router.push(ROUTES.CUSTOMER.NOTIFICATIONS as Href);
  }, [router]);

  const handleOpenMoreMenu = useCallback(() => {
    moreMenuRef.current?.present();
  }, []);

  const handleDownloadSummary = useCallback(async () => {
    if (!order) return;
    try {
      const result = await downloadOrderSummary(order.id);
      if (!result.available) {
        Toast.show({
          type: 'info',
          text1: TRACKING_COPY.documentToastTitle,
          text2: result.message ?? TRACKING_COPY.downloadToastMessage,
        });
        return;
      }
      Toast.show({
        type: 'success',
        text1: 'Download started',
        text2: 'Opening authorized document…',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: TRACKING_COPY.documentToastTitle,
        text2: TRACKING_COPY.downloadToastMessage,
      });
    }
  }, [order]);

  const showCreditDeliveryContinue = Boolean(
    order &&
      isCreditPaymentFlow(order) &&
      inferOrderStatus(order) === 'DELIVERED' &&
      order.paymentStatus !== 'verified',
  );

  const handleContinueToCreditInvoice = useCallback(() => {
    if (!order) return;
    setCurrentOrder(order);
    router.push(getRouteAfterCreditDelivery());
  }, [order, router, setCurrentOrder]);

  const handleMoreMenuAction = useCallback(
    async (action: TrackingMenuAction) => {
      moreMenuRef.current?.dismiss();
      if (!order) return;

      switch (action) {
        case 'track_history':
          Toast.show({
            type: 'info',
            text1: 'Order timeline',
            text2:
              events.length > 0
                ? `${events.length} confirmed events from PetroTrade.`
                : 'No confirmed tracking events yet.',
          });
          break;
        case 'raise_support':
          await raiseSupportTicket(order.id);
          router.push(ROUTES.CUSTOMER.SUPPORT_RAISE as Href);
          break;
        case 'contact_support':
          router.push(ROUTES.CUSTOMER.SUPPORT as Href);
          break;
        case 'download_invoice': {
          const result = await downloadOrderInvoice(order.id);
          Toast.show({
            type: result.available ? 'success' : 'info',
            text1: result.available ? 'Download started' : TRACKING_COPY.documentToastTitle,
            text2: result.available
              ? 'Opening authorized invoice…'
              : (result.message ?? TRACKING_COPY.downloadToastMessage),
          });
          break;
        }
        case 'cancel_order':
          if (canCancelOrder) {
            Toast.show({
              type: 'info',
              text1: 'Cancel order',
              text2: 'Contact support to request cancellation for this order.',
            });
          }
          break;
        default:
          break;
      }
    },
    [canCancelOrder, events.length, order, router],
  );

  return {
    order,
    timelineItems,
    trackingStatus,
    canCancelOrder,
    isDemoMode: TRACKING_DEMO_MODE,
    timelineLoading,
    timelineError,
    showCreditDeliveryContinue,
    moreMenuRef,
    handleBack,
    handleNotifications,
    handleOpenMoreMenu,
    handleMoreMenuAction,
    handleDownloadSummary,
    handleContinueToCreditInvoice,
  };
};
