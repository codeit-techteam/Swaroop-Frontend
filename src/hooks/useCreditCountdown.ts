import { useCallback, useEffect, useMemo, useState } from 'react';

import { type Href, useRouter } from 'expo-router';

import {
  buildCreditCountdownTimeline,
  CREDIT_WORKFLOW_COPY,
  formatCreditLimit,
  getCreditCountdownParts,
} from '@/constants/creditWorkflow';
import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';

type UseCreditCountdownResult = {
  order: ReturnType<typeof selectCurrentOrder>;
  countdown: ReturnType<typeof getCreditCountdownParts>;
  timelineSteps: ReturnType<typeof buildCreditCountdownTimeline>;
  handleBack: () => void;
  handlePayNow: () => void;
};

export const useCreditCountdown = (): UseCreditCountdownResult => {
  const router = useRouter();
  const order = useOrderStore(selectCurrentOrder);
  const isHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);

  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isHydrated]);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  const countdown = useMemo(
    () => getCreditCountdownParts(order?.credit?.dueDate ?? null),
    [order?.credit?.dueDate, tick],
  );

  const timelineSteps = useMemo(() => buildCreditCountdownTimeline(), []);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.ORDERS as Href);
  }, [router]);

  const handlePayNow = useCallback(() => {
    router.push(ROUTES.CUSTOMER.CREDIT_PAYMENT_REMINDER as Href);
  }, [router]);

  return {
    order,
    countdown,
    timelineSteps,
    handleBack,
    handlePayNow,
  };
};

export const formatCreditCountdownDisplay = (
  countdown: ReturnType<typeof getCreditCountdownParts>,
): { days: string; hours: string; minutes: string } => ({
  days: String(countdown.days),
  hours: String(countdown.hours).padStart(2, '0'),
  minutes: String(countdown.minutes).padStart(2, '0'),
});

export const getCreditUsedDisplay = (order: NonNullable<ReturnType<typeof selectCurrentOrder>>) =>
  formatCreditLimit(order.credit?.creditUsed ?? order.amount);

export const getRemainingCreditDisplay = (
  order: NonNullable<ReturnType<typeof selectCurrentOrder>>,
) => formatCreditLimit(order.credit?.remainingCredit ?? 0);

export { CREDIT_WORKFLOW_COPY };
