import { useCallback, useEffect, useRef } from 'react';

import { type Href, useRouter } from 'expo-router';

import {
  buildLoadingScheduledTimeline,
  createLoadingCompletedPatch,
  createLoadingScheduledPatch,
} from '@/constants/loadingWorkflow';
import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';

type UseLoadingScheduledResult = {
  order: ReturnType<typeof selectCurrentOrder>;
  timelineSteps: ReturnType<typeof buildLoadingScheduledTimeline>;
  handleContinue: () => void;
  handleBack: () => void;
};

export const useLoadingScheduled = (): UseLoadingScheduledResult => {
  const router = useRouter();
  const hasAppliedStateRef = useRef(false);

  const order = useOrderStore(selectCurrentOrder);
  const isHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const updateOrder = useOrderStore((state) => state.updateOrder);

  useEffect(() => {
    if (!isHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isHydrated]);

  useEffect(() => {
    if (!order || hasAppliedStateRef.current || order.loadingStatus === 'scheduled') {
      return;
    }

    if (order.loadingStatus === 'completed') {
      hasAppliedStateRef.current = true;
      return;
    }

    hasAppliedStateRef.current = true;
    updateOrder(createLoadingScheduledPatch(order));
  }, [order, updateOrder]);

  const handleContinue = useCallback(() => {
    if (!order) {
      router.replace(ROUTES.CUSTOMER.ORDERS as Href);
      return;
    }

    updateOrder(createLoadingCompletedPatch(order));
    router.replace(ROUTES.CUSTOMER.LOADING_COMPLETED as Href);
  }, [order, router, updateOrder]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.ORDERS as Href);
  }, [router]);

  return {
    order,
    timelineSteps: buildLoadingScheduledTimeline(),
    handleContinue,
    handleBack,
  };
};
