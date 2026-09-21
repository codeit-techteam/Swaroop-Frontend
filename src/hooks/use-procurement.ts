import { useCallback, useEffect, useMemo, useRef } from 'react';

import { type Href, useRouter } from 'expo-router';

import {
  getRouteAfterProcurementComplete,
  requiresAdvancePaymentVerified,
} from '@/constants/paymentNavigation';
import {
  ORDER_PROGRESS_STEP_IDS,
  PROCUREMENT_DEMO_MODE,
  PROCUREMENT_SCREEN_COPY,
  PROCUREMENT_STATUS_BADGE_LABELS,
} from '@/constants/procurementSteps';
import { inferOrderStatus } from '@/constants/orderWorkflow';
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
  order: Order | null,
): OrderProgressStep[] => {
  const isCompleted = procurement?.status === 'completed';
  const isDeferredFlow = order ? !requiresAdvancePaymentVerified(order) : false;
  const paymentTime = procurement?.timeline.paymentVerifiedAt ?? order?.paymentVerifiedAt;
  const forwardedTime = procurement?.timeline.orderForwardedAt;

  const firstStep: OrderProgressStep = isDeferredFlow
    ? {
        id: ORDER_PROGRESS_STEP_IDS.PAYMENT_VERIFIED,
        title: 'Order Submitted',
        subtitle: order?.createdAt
          ? `Submitted at ${formatDateTime(order.createdAt, 'hh:mm A')}`
          : undefined,
        status: 'completed',
      }
    : {
        id: ORDER_PROGRESS_STEP_IDS.PAYMENT_VERIFIED,
        title: 'Payment Verified',
        subtitle: paymentTime ? `Verified at ${formatDateTime(paymentTime, 'hh:mm A')}` : undefined,
        status: 'completed',
      };

  return [
    firstStep,
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
  const startSupplierMatching = useOrderStore((state) => state.startSupplierMatching);
  const scheduleLoading = useOrderStore((state) => state.scheduleLoading);
  const updateProcurement = useOrderStore((state) => state.updateProcurement);

  useEffect(() => {
    if (!isOrderHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isOrderHydrated]);

  useEffect(() => {
    if (!order || order.procurement) {
      return;
    }

    if (requiresAdvancePaymentVerified(order)) {
      if (order.verificationStatus !== 'verified') {
        return;
      }
      startProcurement(order.paymentVerifiedAt ?? new Date().toISOString());
      return;
    }

    startProcurement(new Date().toISOString());
  }, [order, startProcurement]);

  const procurement = order?.procurement ?? null;
  const isComplete = procurement?.status === 'completed';

  const navigateAfterProcurement = useCallback(() => {
    if (hasNavigatedRef.current || !order) {
      return;
    }

    hasNavigatedRef.current = true;

    if (order.paymentMethodId === 'on_loading' || order.paymentMethodId === 'on_delivery') {
      scheduleLoading();
    }

    router.replace(getRouteAfterProcurementComplete(order));
  }, [order, router, scheduleLoading]);

  const handleProcurementUpdate = useCallback(
    (patch: Partial<ProcurementState>) => {
      updateProcurement(patch);
    },
    [updateProcurement],
  );

  useEffect(() => {
    if (!order?.procurement) {
      return;
    }

    if (
      order.procurement.status === 'matching' &&
      inferOrderStatus(order) === 'PROCUREMENT_STARTED'
    ) {
      startSupplierMatching();
    }
  }, [order, startSupplierMatching]);

  useProcurementSimulation({
    procurement,
    isDemoMode: PROCUREMENT_DEMO_MODE,
    isComplete,
    onUpdate: handleProcurementUpdate,
    onComplete: navigateAfterProcurement,
  });

  const timeline = useMemo(
    () => buildOrderProgressTimeline(procurement, order),
    [order, procurement],
  );

  const statusLabel = procurement
    ? PROCUREMENT_STATUS_BADGE_LABELS[procurement.status]
    : PROCUREMENT_STATUS_BADGE_LABELS.matching;

  const canContinue = PROCUREMENT_DEMO_MODE || isComplete;

  const handleContinueTracking = useCallback(() => {
    if (!canContinue) {
      return;
    }

    navigateAfterProcurement();
  }, [canContinue, navigateAfterProcurement]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(ROUTES.CUSTOMER.HOME as Href);
  }, [router]);

  const handleNotifications = useCallback(() => {
    router.push(ROUTES.CUSTOMER.NOTIFICATIONS as Href);
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
