import { useCallback, useEffect, useMemo, useRef } from 'react';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';

import {
  downloadOrderInvoice,
  downloadOrderSummary,
  raiseSupportTicket,
} from '@/api/order-tracking';
import type { TrackingMenuAction } from '@/components/tracking';
import {
  buildTrackingTimelineItems,
  createTrackingAdvancePatch,
  deriveTrackingOrderStatus,
  deriveTrackingTimelineState,
  getNextTrackingDemoStep,
  isTrackingDemoComplete,
  TRACKING_COPY,
  TRACKING_DEMO_INTERVAL_MS,
  TRACKING_DEMO_MODE,
} from '@/constants/trackingTimeline';
import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  selectOrders,
  useOrderStore,
} from '@/store/order-store';
import type { Order } from '@/types/order';
import type { TrackingOrderStatus, TrackingTimelineItem } from '@/types/tracking';

type UseOrderTrackingResult = {
  order: Order | null;
  timelineItems: TrackingTimelineItem[];
  trackingStatus: TrackingOrderStatus;
  canCancelOrder: boolean;
  isDemoMode: boolean;
  moreMenuRef: React.RefObject<BottomSheetModal | null>;
  handleBack: () => void;
  handleNotifications: () => void;
  handleOpenMoreMenu: () => void;
  handleMoreMenuAction: (action: TrackingMenuAction) => void;
  handleDownloadSummary: () => void;
};

let activeTrackingSimulationId: string | null = null;

export const useOrderTracking = (): UseOrderTrackingResult => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const moreMenuRef = useRef<BottomSheetModal>(null);

  const orders = useOrderStore(selectOrders);
  const currentOrder = useOrderStore(selectCurrentOrder);
  const isHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const updateOrderById = useOrderStore((state) => state.updateOrderById);
  const setSelectedOrderId = useOrderStore((state) => state.setSelectedOrderId);

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

  const order = useMemo(() => {
    if (orderId) {
      return orders.find((item) => item.id === orderId) ?? null;
    }

    return currentOrder;
  }, [currentOrder, orderId, orders]);

  const timelineItems = useMemo(
    () => (order ? buildTrackingTimelineItems(order) : []),
    [order],
  );

  const trackingStatus = order ? deriveTrackingOrderStatus(order) : 'preparing';

  const canCancelOrder = Boolean(
    order &&
      (!order.dispatchStatus ||
        order.dispatchStatus === 'planning' ||
        order.dispatchStatus === 'vehicle_allocation'),
  );

  useEffect(() => {
    if (
      !TRACKING_DEMO_MODE ||
      !order ||
      isTrackingDemoComplete(order) ||
      activeTrackingSimulationId === order.id
    ) {
      return;
    }

    activeTrackingSimulationId = order.id;
    const timer = setInterval(() => {
      const latestOrder =
        useOrderStore.getState().orders.find((item) => item.id === order.id) ?? order;

      if (isTrackingDemoComplete(latestOrder)) {
        activeTrackingSimulationId = null;
        clearInterval(timer);
        return;
      }

      const timeline = deriveTrackingTimelineState(latestOrder);
      const nextStep = getNextTrackingDemoStep(timeline.currentStep);

      if (!nextStep) {
        activeTrackingSimulationId = null;
        clearInterval(timer);
        return;
      }

      updateOrderById(latestOrder.id, createTrackingAdvancePatch(latestOrder, nextStep));
    }, TRACKING_DEMO_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      if (activeTrackingSimulationId === order.id) {
        activeTrackingSimulationId = null;
      }
    };
  }, [order, updateOrderById]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(ROUTES.CUSTOMER.ORDERS as Href);
  }, [router]);

  const handleNotifications = useCallback(() => {
    router.push(ROUTES.CUSTOMER.HOME as Href);
  }, [router]);

  const handleOpenMoreMenu = useCallback(() => {
    moreMenuRef.current?.present();
  }, []);

  const handleDownloadSummary = useCallback(async () => {
    if (!order) {
      return;
    }

    await downloadOrderSummary(order.id);
    Toast.show({
      type: 'info',
      text1: TRACKING_COPY.documentToastTitle,
      text2: TRACKING_COPY.downloadToastMessage,
    });
  }, [order]);

  const handleMoreMenuAction = useCallback(
    async (action: TrackingMenuAction) => {
      moreMenuRef.current?.dismiss();

      if (!order) {
        return;
      }

      switch (action) {
        case 'track_history':
          Toast.show({
            type: 'info',
            text1: TRACKING_COPY.documentToastTitle,
            text2: TRACKING_COPY.trackHistoryToastMessage,
          });
          break;
        case 'raise_support':
          await raiseSupportTicket(order.id);
          Toast.show({
            type: 'info',
            text1: TRACKING_COPY.documentToastTitle,
            text2: TRACKING_COPY.supportToastMessage,
          });
          break;
        case 'contact_support':
          Toast.show({
            type: 'info',
            text1: TRACKING_COPY.documentToastTitle,
            text2: TRACKING_COPY.supportToastMessage,
          });
          break;
        case 'download_invoice':
          await downloadOrderInvoice(order.id);
          Toast.show({
            type: 'info',
            text1: TRACKING_COPY.documentToastTitle,
            text2: TRACKING_COPY.downloadToastMessage,
          });
          break;
        case 'cancel_order':
          if (canCancelOrder) {
            Toast.show({
              type: 'info',
              text1: TRACKING_COPY.documentToastTitle,
              text2: TRACKING_COPY.supportToastMessage,
            });
          }
          break;
        default:
          break;
      }
    },
    [canCancelOrder, order],
  );

  return {
    order,
    timelineItems,
    trackingStatus,
    canCancelOrder,
    isDemoMode: TRACKING_DEMO_MODE,
    moreMenuRef,
    handleBack,
    handleNotifications,
    handleOpenMoreMenu,
    handleMoreMenuAction,
    handleDownloadSummary,
  };
};
