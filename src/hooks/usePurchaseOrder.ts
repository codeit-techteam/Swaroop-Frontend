import { useCallback, useEffect, useMemo, useRef } from 'react';

import { type Href, useRouter } from 'expo-router';

import {
  PURCHASE_ORDER_DEMO_MODE,
  WORKFLOW_DEMO_SEQUENCE,
  buildWorkflowTimelineSteps,
  createPurchaseOrderPatch,
  getRandomPurchaseOrderDemoDelay,
  isWorkflowDemoComplete,
  mapWorkflowStepToDispatchStatus,
} from '@/constants/purchaseOrderTimeline';
import { createDispatchStartedPatch, isDispatchStarted } from '@/constants/dispatchStarted';
import { ROUTES } from '@/navigation/routes';
import { selectCheckoutAddress, useCheckoutStore } from '@/store/checkout-store';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';
import type { Order } from '@/types/order';
import type { WorkflowStepId } from '@/types/purchaseOrder';

type UsePurchaseOrderResult = {
  order: Order | null;
  destination: string;
  poNumber: string | null;
  timelineSteps: ReturnType<typeof buildWorkflowTimelineSteps>;
  isDemoMode: boolean;
  handleTrackShipment: () => void;
  handleGoToOrders: () => void;
  handleBack: () => void;
  handleNotifications: () => void;
};

const getNextDemoStep = (currentStep: WorkflowStepId): WorkflowStepId | null => {
  const currentIndex = WORKFLOW_DEMO_SEQUENCE.indexOf(currentStep);
  if (currentIndex < 0 || currentIndex >= WORKFLOW_DEMO_SEQUENCE.length - 1) {
    return null;
  }

  return WORKFLOW_DEMO_SEQUENCE[currentIndex + 1] ?? null;
};

let activePurchaseOrderSimulationId: string | null = null;

export const usePurchaseOrder = (): UsePurchaseOrderResult => {
  const router = useRouter();
  const hasInitializedRef = useRef(false);
  const hasNavigatedRef = useRef(false);

  const order = useOrderStore(selectCurrentOrder);
  const isOrderHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const updateOrder = useOrderStore((state) => state.updateOrder);
  const checkoutAddress = useCheckoutStore(selectCheckoutAddress);

  useEffect(() => {
    if (!isOrderHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isOrderHydrated]);

  useEffect(() => {
    if (!order || hasInitializedRef.current) {
      return;
    }

    if (order.orderStatus === 'purchase_order_generated' && order.poGenerated) {
      hasInitializedRef.current = true;
      return;
    }

    hasInitializedRef.current = true;
    updateOrder(createPurchaseOrderPatch(order));
  }, [order, updateOrder]);

  const navigateToDispatchStarted = useCallback(() => {
    if (hasNavigatedRef.current) {
      return;
    }

    const currentOrder = useOrderStore.getState().currentOrder;
    if (currentOrder && !isDispatchStarted(currentOrder)) {
      updateOrder(createDispatchStartedPatch(currentOrder));
    }

    hasNavigatedRef.current = true;
    router.replace(ROUTES.CUSTOMER.DISPATCH_STARTED as Href);
  }, [router, updateOrder]);

  const advanceWorkflowStep = useCallback(() => {
    const currentOrder = useOrderStore.getState().currentOrder;
    if (!currentOrder?.workflowTimeline) {
      return;
    }

    const { currentStep, completedSteps } = currentOrder.workflowTimeline;
    const nextCompletedSteps = completedSteps.includes(currentStep)
      ? completedSteps
      : [...completedSteps, currentStep];
    const nextStep = getNextDemoStep(currentStep);

    if (!nextStep) {
      updateOrder({
        workflowTimeline: {
          currentStep,
          completedSteps: nextCompletedSteps,
        },
        dispatchStatus: mapWorkflowStepToDispatchStatus(currentStep),
      });
      navigateToDispatchStarted();
      return;
    }

    updateOrder({
      workflowTimeline: {
        currentStep: nextStep,
        completedSteps: nextCompletedSteps,
      },
      dispatchStatus: mapWorkflowStepToDispatchStatus(nextStep),
    });
  }, [navigateToDispatchStarted, updateOrder]);

  useEffect(() => {
    if (
      !PURCHASE_ORDER_DEMO_MODE ||
      !order?.workflowTimeline ||
      !order.poGenerated ||
      isWorkflowDemoComplete(order.workflowTimeline) ||
      activePurchaseOrderSimulationId === order.id
    ) {
      return;
    }

    activePurchaseOrderSimulationId = order.id;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const scheduleNextStep = (): void => {
      const latestOrder = useOrderStore.getState().currentOrder;
      if (!latestOrder?.workflowTimeline || isWorkflowDemoComplete(latestOrder.workflowTimeline)) {
        activePurchaseOrderSimulationId = null;
        navigateToDispatchStarted();
        return;
      }

      const delay = getRandomPurchaseOrderDemoDelay();
      timers.push(
        setTimeout(() => {
          advanceWorkflowStep();

          const updatedOrder = useOrderStore.getState().currentOrder;
          if (!updatedOrder?.workflowTimeline) {
            activePurchaseOrderSimulationId = null;
            return;
          }

          if (isWorkflowDemoComplete(updatedOrder.workflowTimeline)) {
            activePurchaseOrderSimulationId = null;
            navigateToDispatchStarted();
            return;
          }

          scheduleNextStep();
        }, delay),
      );
    };

    scheduleNextStep();

    return () => {
      timers.forEach(clearTimeout);
      if (activePurchaseOrderSimulationId === order.id) {
        activePurchaseOrderSimulationId = null;
      }
    };
  }, [
    advanceWorkflowStep,
    navigateToDispatchStarted,
    order?.id,
    order?.poGenerated,
    order?.workflowTimeline,
  ]);

  const destination =
    order?.destination || `${checkoutAddress.line2}, ${checkoutAddress.state}`;

  const timelineSteps = useMemo(
    () => buildWorkflowTimelineSteps(order?.workflowTimeline ?? null),
    [order?.workflowTimeline],
  );

  const handleTrackShipment = useCallback(() => {
    router.push(ROUTES.CUSTOMER.SHIPMENT_TRACKING as Href);
  }, [router]);

  const handleGoToOrders = useCallback(() => {
    router.replace(ROUTES.CUSTOMER.ORDERS as Href);
  }, [router]);

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
    destination,
    poNumber: order?.poNumber ?? null,
    timelineSteps,
    isDemoMode: PURCHASE_ORDER_DEMO_MODE,
    handleTrackShipment,
    handleGoToOrders,
    handleBack,
    handleNotifications,
  };
};
