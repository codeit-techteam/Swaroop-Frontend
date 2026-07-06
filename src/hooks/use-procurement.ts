import { useCallback, useEffect, useMemo, useRef } from 'react';

import { type Href, useRouter } from 'expo-router';

import {
  ORDER_PROGRESS_STEP_IDS,
  PROCUREMENT_DEMO_MODE,
  PROCUREMENT_SCREEN_COPY,
  PROCUREMENT_STATUS_BADGE_LABELS,
} from '@/constants/procurementSteps';
import { useProcurementSimulation } from '@/hooks/useProcurementSimulation';
import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  selectPaymentProof,
  useOrderStore,
} from '@/store/order-store';
import type { Order, PaymentProof } from '@/types/order';
import type { OrderProgressStep, ProcurementState } from '@/types/procurement';
import { formatDateTime } from '@/utils/date';

type UseProcurementResult = {
  order: Order | null;
  paymentProof: PaymentProof | null;
  procurement: ProcurementState | null;
  timeline: OrderProgressStep[];
  statusLabel: string;
  isDemoMode: boolean;
  isComplete: boolean;
  canContinue: boolean;
  handleContinueTracking: () => void;
  handleBack: () => void;
  handleNotifications: () => void;
};

const buildOrderProgressTimeline = (
  procurement: ProcurementState | null,
  paymentVerifiedAt: string | null,
): OrderProgressStep[] => {
  const isCompleted = procurement?.status === 'completed';
  const paymentTime = procurement?.timeline.paymentVerifiedAt ?? paymentVerifiedAt;
  const forwardedTime = procurement?.timeline.orderForwardedAt;

  return [
    {
      id: ORDER_PROGRESS_STEP_IDS.PAYMENT_VERIFIED,
      title: 'Payment Verified',
      subtitle: paymentTime ? `Verified at ${formatDateTime(paymentTime, 'hh:mm A')}` : undefined,
      status: 'completed',
    },
    {
      id: ORDER_PROGRESS_STEP_IDS.ORDER_FORWARDED,
      title: 'Order Forwarded',
      subtitle: forwardedTime
        ? `Sent to Exchange at ${formatDateTime(forwardedTime, 'hh:mm A')}`
        : undefined,
      status: 'completed',
    },
    {
      id: ORDER_PROGRESS_STEP_IDS.SUPPLIER_MATCHING,
      title: 'Supplier Matching',
      subtitle: isCompleted
        ? 'Matched with verified supplier'
        : PROCUREMENT_SCREEN_COPY.supplierMatchingInProgress,
      status: isCompleted ? 'completed' : 'current',
    },
    {
      id: ORDER_PROGRESS_STEP_IDS.INVENTORY_ALLOCATION,
      title: 'Inventory Allocation',
      subtitle: isCompleted
        ? 'Inventory reserved successfully'
        : PROCUREMENT_SCREEN_COPY.inventoryAllocationPending,
      status: isCompleted ? 'completed' : 'pending',
    },
    {
      id: ORDER_PROGRESS_STEP_IDS.PURCHASE_ORDER_GENERATION,
      title: 'Purchase Order Generation',
      subtitle: isCompleted
        ? 'Preparing purchase order'
        : PROCUREMENT_SCREEN_COPY.purchaseOrderPending,
      status: isCompleted ? 'current' : 'pending',
    },
  ];
};

export const useProcurement = (): UseProcurementResult => {
  const router = useRouter();
  const hasNavigatedRef = useRef(false);

  const order = useOrderStore(selectCurrentOrder);
  const paymentProof = useOrderStore(selectPaymentProof);
  const isOrderHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const startProcurement = useOrderStore((state) => state.startProcurement);
  const updateProcurement = useOrderStore((state) => state.updateProcurement);

  useEffect(() => {
    if (!isOrderHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isOrderHydrated]);

  useEffect(() => {
    if (!order || order.verificationStatus !== 'verified' || order.procurement) {
      return;
    }

    const verifiedAt = order.paymentVerifiedAt ?? new Date().toISOString();
    startProcurement(verifiedAt);
  }, [order, startProcurement]);

  const procurement = order?.procurement ?? null;
  const isComplete = procurement?.status === 'completed';

  const navigateToAwaitingConfirmation = useCallback(() => {
    if (hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    router.replace(ROUTES.CUSTOMER.ORDER_AWAITING_CONFIRMATION as Href);
  }, [router]);

  const handleProcurementUpdate = useCallback(
    (patch: Partial<ProcurementState>) => {
      updateProcurement(patch);
    },
    [updateProcurement],
  );

  useProcurementSimulation({
    procurement,
    isDemoMode: PROCUREMENT_DEMO_MODE,
    isComplete,
    onUpdate: handleProcurementUpdate,
    onComplete: navigateToAwaitingConfirmation,
  });

  const timeline = useMemo(
    () => buildOrderProgressTimeline(procurement, order?.paymentVerifiedAt ?? null),
    [order?.paymentVerifiedAt, procurement],
  );

  const statusLabel = procurement
    ? PROCUREMENT_STATUS_BADGE_LABELS[procurement.status]
    : PROCUREMENT_STATUS_BADGE_LABELS.matching;

  const canContinue = PROCUREMENT_DEMO_MODE || isComplete;

  const handleContinueTracking = useCallback(() => {
    if (!canContinue) {
      return;
    }

    navigateToAwaitingConfirmation();
  }, [canContinue, navigateToAwaitingConfirmation]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(ROUTES.CUSTOMER.HOME as Href);
  }, [router]);

  const handleNotifications = useCallback(() => {
    router.push(ROUTES.CUSTOMER.HOME as Href);
  }, [router]);

  return {
    order,
    paymentProof,
    procurement,
    timeline,
    statusLabel,
    isDemoMode: PROCUREMENT_DEMO_MODE,
    isComplete,
    canContinue,
    handleContinueTracking,
    handleBack,
    handleNotifications,
  };
};
