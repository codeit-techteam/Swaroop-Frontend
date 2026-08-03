import { useCallback, useEffect, useMemo } from 'react';

import { type Href, useRouter } from 'expo-router';

import {
  buildCreditRestoredTimeline,
  CREDIT_WORKFLOW_COPY,
  formatCreditLimit,
} from '@/constants/creditWorkflow';
import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';

type UseCreditRestoredResult = {
  order: ReturnType<typeof selectCurrentOrder>;
  previousUsed: string;
  currentAvailable: string;
  timelineSteps: ReturnType<typeof buildCreditRestoredTimeline>;
  handleGoToOrders: () => void;
  handleBack: () => void;
};

export const useCreditRestored = (): UseCreditRestoredResult => {
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
    if (order?.credit && order.credit.workflowPhase === 'payment_verified') {
      updateOrder({
        credit: { ...order.credit, workflowPhase: 'completed' },
      });
    }
  }, [order?.credit?.workflowPhase, order, updateOrder]);

  const timelineSteps = useMemo(() => buildCreditRestoredTimeline(), []);

  const previousUsed = order ? formatCreditLimit(order.amount) : '—';

  const currentAvailable = order
    ? formatCreditLimit(order.credit?.availableLimit ?? order.credit?.creditLimit ?? 0)
    : '—';

  const handleGoToOrders = useCallback(() => {
    router.replace(ROUTES.CUSTOMER.ORDERS as Href);
  }, [router]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.ORDERS as Href);
  }, [router]);

  return {
    order,
    previousUsed,
    currentAvailable,
    timelineSteps,
    handleGoToOrders,
    handleBack,
  };
};

export { CREDIT_WORKFLOW_COPY };
