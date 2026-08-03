import { useCallback, useEffect, useMemo, useRef } from 'react';

import { type Href, useRouter } from 'expo-router';

import {
  buildDeliveryCompletedTimeline,
  isOnDeliveryPaymentFlow,
} from '@/constants/deliveryCompleted';
import { inferOrderStatus } from '@/constants/orderWorkflow';
import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';

type UseDeliveryCompletedResult = {
  order: ReturnType<typeof selectCurrentOrder>;
  timelineSteps: ReturnType<typeof buildDeliveryCompletedTimeline>;
  handleBack: () => void;
  handleNotifications: () => void;
  handleContinueToPayment: () => void;
  handleViewOrderDetails: () => void;
};

export const useDeliveryCompleted = (): UseDeliveryCompletedResult => {
  const router = useRouter();
  const hasSyncedRef = useRef(false);
  const order = useOrderStore(selectCurrentOrder);
  const isHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const completeDelivery = useOrderStore((state) => state.completeDelivery);

  useEffect(() => {
    if (!isHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isHydrated]);

  useEffect(() => {
    if (!order || hasSyncedRef.current) {
      return;
    }

    if (!isOnDeliveryPaymentFlow(order)) {
      hasSyncedRef.current = true;
      return;
    }

    const status = inferOrderStatus(order);
    if (status === 'DELIVERY_COMPLETED') {
      hasSyncedRef.current = true;
      return;
    }

    hasSyncedRef.current = true;
    completeDelivery();
  }, [completeDelivery, order]);

  const timelineSteps = useMemo(() => buildDeliveryCompletedTimeline(), []);

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

  const handleContinueToPayment = useCallback(() => {
    router.push(ROUTES.CUSTOMER.PAYMENT_REMINDER as Href);
  }, [router]);

  const handleViewOrderDetails = useCallback(() => {
    if (!order) {
      router.replace(ROUTES.CUSTOMER.ORDERS as Href);
      return;
    }

    router.push({
      pathname: ROUTES.CUSTOMER.ORDER_DETAIL,
      params: { orderId: order.id },
    } as Href);
  }, [order, router]);

  return {
    order,
    timelineSteps,
    handleBack,
    handleNotifications,
    handleContinueToPayment,
    handleViewOrderDetails,
  };
};
