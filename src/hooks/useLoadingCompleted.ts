import { useCallback, useEffect } from 'react';

import { type Href, useRouter } from 'expo-router';

import { createInTransitWithoutPaymentPatch } from '@/constants/dispatchStarted';
import { getRouteAfterLoadingCompleted } from '@/constants/paymentNavigation';
import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';

type UseLoadingCompletedResult = {
  order: ReturnType<typeof selectCurrentOrder>;
  handleContinue: () => void;
  handleBack: () => void;
};

export const useLoadingCompleted = (): UseLoadingCompletedResult => {
  const router = useRouter();
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
    if (!order || order.dispatchStatus === 'shipment_ready') {
      return;
    }

    updateOrder({
      dispatchStatus: 'shipment_ready',
      orderStatus: order.orderStatus === 'order_created' ? 'confirmed' : order.orderStatus,
    });
  }, [order, updateOrder]);

  const handleContinue = useCallback(() => {
    if (!order) {
      router.replace(ROUTES.CUSTOMER.ORDERS as Href);
      return;
    }

    if (order.paymentMethodId === 'on_delivery') {
      updateOrder(createInTransitWithoutPaymentPatch(order));
      router.replace(ROUTES.CUSTOMER.DISPATCH_STARTED as Href);
      return;
    }

    router.replace(getRouteAfterLoadingCompleted(order));
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
    handleContinue,
    handleBack,
  };
};
