import { useCallback, useEffect, useRef } from 'react';

import { type Href, useRouter } from 'expo-router';

import { buildLoadingScheduledTimeline } from '@/constants/loadingWorkflow';
import { inferOrderStatus } from '@/constants/orderWorkflow';
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
  const scheduleLoading = useOrderStore((state) => state.scheduleLoading);
  const completeLoading = useOrderStore((state) => state.completeLoading);

  useEffect(() => {
    if (!isHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isHydrated]);

  useEffect(() => {
    if (!order || hasAppliedStateRef.current) {
      return;
    }

    const status = inferOrderStatus(order);
    if (status === 'LOADING_SCHEDULED' || status === 'LOADING_COMPLETED') {
      hasAppliedStateRef.current = true;
      return;
    }

    hasAppliedStateRef.current = true;
    scheduleLoading();
  }, [order, scheduleLoading]);

  const handleContinue = useCallback(() => {
    if (!order) {
      router.replace(ROUTES.CUSTOMER.ORDERS as Href);
      return;
    }

    completeLoading();
    router.replace(ROUTES.CUSTOMER.LOADING_COMPLETED as Href);
  }, [completeLoading, order, router]);

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
