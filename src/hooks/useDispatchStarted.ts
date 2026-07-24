import { useCallback, useEffect, useMemo, useRef } from 'react';

import { type Href, useRouter } from 'expo-router';

import {
  buildDispatchTimelineSteps,
  isDispatchStarted,
} from '@/constants/dispatchStarted';
import { inferOrderStatus } from '@/constants/orderWorkflow';
import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';
import type { Order } from '@/types/order';

type UseDispatchStartedResult = {
  order: Order | null;
  timelineSteps: ReturnType<typeof buildDispatchTimelineSteps>;
  handleBack: () => void;
  handleNotifications: () => void;
  handleTrackShipment: () => void;
  handleGoToOrders: () => void;
};

export const useDispatchStarted = (): UseDispatchStartedResult => {
  const router = useRouter();
  const hasAppliedStateRef = useRef(false);

  const order = useOrderStore(selectCurrentOrder);
  const isOrderHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const startDispatch = useOrderStore((state) => state.startDispatch);

  useEffect(() => {
    if (!isOrderHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isOrderHydrated]);

  useEffect(() => {
    if (!order || hasAppliedStateRef.current) {
      return;
    }

    const status = inferOrderStatus(order);
    if (isDispatchStarted(order) || status === 'DISPATCH_STARTED' || status === 'IN_TRANSIT') {
      hasAppliedStateRef.current = true;
      return;
    }

    hasAppliedStateRef.current = true;
    startDispatch();
  }, [order, startDispatch]);

  const timelineSteps = useMemo(
    () => (order ? buildDispatchTimelineSteps(order) : []),
    [order],
  );

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

  const handleTrackShipment = useCallback(() => {
    router.push(ROUTES.CUSTOMER.SHIPMENT_TRACKING as Href);
  }, [router]);

  const handleGoToOrders = useCallback(() => {
    router.replace(ROUTES.CUSTOMER.ORDERS as Href);
  }, [router]);

  return {
    order,
    timelineSteps,
    handleBack,
    handleNotifications,
    handleTrackShipment,
    handleGoToOrders,
  };
};
