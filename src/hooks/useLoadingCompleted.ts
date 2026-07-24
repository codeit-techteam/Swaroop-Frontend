import { useCallback, useEffect, useMemo, useRef } from 'react';

import { type Href, useRouter } from 'expo-router';

import {
  buildLoadingVerificationTimeline,
} from '@/constants/loadingWorkflow';
import { getRouteAfterLoadingCompleted } from '@/constants/paymentNavigation';
import { inferOrderStatus } from '@/constants/orderWorkflow';
import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';

type UseLoadingCompletedResult = {
  order: ReturnType<typeof selectCurrentOrder>;
  timelineSteps: ReturnType<typeof buildLoadingVerificationTimeline>;
  handleContinue: () => void;
  handleBack: () => void;
};

export const useLoadingCompleted = (): UseLoadingCompletedResult => {
  const router = useRouter();
  const hasSyncedRef = useRef(false);
  const order = useOrderStore(selectCurrentOrder);
  const isHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const completeLoading = useOrderStore((state) => state.completeLoading);
  const startDispatch = useOrderStore((state) => state.startDispatch);

  useEffect(() => {
    if (!isHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isHydrated]);

  useEffect(() => {
    if (!order || hasSyncedRef.current) {
      return;
    }

    const status = inferOrderStatus(order);
    if (status === 'LOADING_COMPLETED') {
      hasSyncedRef.current = true;
      return;
    }

    hasSyncedRef.current = true;
    completeLoading();
  }, [completeLoading, order]);

  const timelineSteps = useMemo(
    () => (order ? buildLoadingVerificationTimeline(order) : []),
    [order],
  );

  const handleContinue = useCallback(() => {
    if (!order) {
      router.replace(ROUTES.CUSTOMER.ORDERS as Href);
      return;
    }

    if (order.paymentMethodId === 'on_delivery') {
      startDispatch();
      router.replace(ROUTES.CUSTOMER.DISPATCH_STARTED as Href);
      return;
    }

    router.replace(getRouteAfterLoadingCompleted(order));
  }, [order, router, startDispatch]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.ORDERS as Href);
  }, [router]);

  return {
    order,
    timelineSteps,
    handleContinue,
    handleBack,
  };
};
