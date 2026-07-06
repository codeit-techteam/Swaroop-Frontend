import { useCallback, useEffect, useMemo, useRef } from 'react';

import { Alert } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import {
  ORDER_CONFIRMATION_COPY,
  ORDER_CONFIRMATION_DEMO_MODE,
  PRICE_LOCK_DURATION_SECONDS,
  VALIDATION_STEP_IDS,
  VALIDATION_STEP_SEQUENCE,
  buildValidationTimelineSteps,
  createInitialValidationTimeline,
  getRandomDemoStepDelay,
} from '@/constants/orderTimeline';
import { useCountdown } from '@/hooks/useCountdown';
import { ROUTES } from '@/navigation/routes';
import { selectCheckoutAddress, useCheckoutStore } from '@/store/checkout-store';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';
import type { Order } from '@/types/order';
import type { ValidationStepId } from '@/types/orderConfirmation';

type UseOrderConfirmationResult = {
  order: Order | null;
  destination: string;
  timelineSteps: ReturnType<typeof buildValidationTimelineSteps>;
  countdown: ReturnType<typeof useCountdown>;
  isDemoMode: boolean;
  isComplete: boolean;
  handleTrackStatus: () => void;
  handleContactSupport: () => void;
  handleBack: () => void;
  handleNotifications: () => void;
};

const getNextValidationStep = (currentStep: ValidationStepId): ValidationStepId | null => {
  const currentIndex = VALIDATION_STEP_SEQUENCE.indexOf(currentStep);
  if (currentIndex < 0 || currentIndex >= VALIDATION_STEP_SEQUENCE.length - 1) {
    return null;
  }

  return VALIDATION_STEP_SEQUENCE[currentIndex + 1] ?? null;
};

const isValidationComplete = (timeline: Order['validationTimeline']): boolean => {
  if (!timeline) {
    return false;
  }

  return timeline.completedSteps.includes(VALIDATION_STEP_IDS.PURCHASE_ORDER_GENERATION);
};

let activeSimulationOrderId: string | null = null;

export const useOrderConfirmation = (): UseOrderConfirmationResult => {
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
    if (!order || hasInitializedRef.current || order.orderStatus === 'purchase_order_generated') {
      return;
    }

    if (order.orderStatus === 'awaiting_confirmation' && order.priceLockStartedAt) {
      hasInitializedRef.current = true;
      return;
    }

    hasInitializedRef.current = true;
    updateOrder({
      orderStatus: 'awaiting_confirmation',
      priceLockStatus: 'active',
      priceLockStartedAt: new Date().toISOString(),
      priceLockDurationSeconds: PRICE_LOCK_DURATION_SECONDS,
      validationTimeline: order.validationTimeline ?? createInitialValidationTimeline(),
      confirmationStatus: 'pending_petrotrade',
      supplierConfirmation: 'pending',
      inventoryReserved: false,
      destination: order.destination || `${checkoutAddress.line2}, ${checkoutAddress.state}`,
    });
  }, [checkoutAddress.line2, checkoutAddress.state, order, updateOrder]);

  const handlePriceLockExpire = useCallback(() => {
    if (!order || order.priceLockStatus === 'expired') {
      return;
    }

    updateOrder({ priceLockStatus: 'expired' });
  }, [order, updateOrder]);

  const countdown = useCountdown({
    startedAt: order?.priceLockStartedAt ?? null,
    durationSeconds: order?.priceLockDurationSeconds ?? PRICE_LOCK_DURATION_SECONDS,
    isActive: order?.priceLockStatus === 'active',
    onExpire: handlePriceLockExpire,
  });

  const navigateToPurchaseOrderGenerated = useCallback(() => {
    if (hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    router.replace(ROUTES.CUSTOMER.PURCHASE_ORDER_GENERATED as Href);
  }, [router]);

  const advanceValidationStep = useCallback(() => {
    const currentOrder = useOrderStore.getState().currentOrder;
    if (!currentOrder?.validationTimeline) {
      return;
    }

    const { currentStep, completedSteps } = currentOrder.validationTimeline;
    const nextCompletedSteps = completedSteps.includes(currentStep)
      ? completedSteps
      : [...completedSteps, currentStep];
    const nextStep = getNextValidationStep(currentStep);

    if (!nextStep) {
      updateOrder({
        validationTimeline: {
          currentStep: VALIDATION_STEP_IDS.PURCHASE_ORDER_GENERATION,
          completedSteps: [
            ...nextCompletedSteps,
            VALIDATION_STEP_IDS.PURCHASE_ORDER_GENERATION,
          ],
        },
        inventoryReserved: true,
        supplierConfirmation: 'confirmed',
        confirmationStatus: 'confirmed',
        orderStatus: 'purchase_order_generated',
      });
      navigateToPurchaseOrderGenerated();
      return;
    }

    const patch: Partial<Order> = {
      validationTimeline: {
        currentStep: nextStep,
        completedSteps: nextCompletedSteps,
      },
    };

    if (currentStep === VALIDATION_STEP_IDS.INVENTORY_ALLOCATION) {
      patch.inventoryReserved = true;
    }

    if (currentStep === VALIDATION_STEP_IDS.SELLER_ACCEPTANCE) {
      patch.supplierConfirmation = 'confirmed';
    }

    updateOrder(patch);
  }, [navigateToPurchaseOrderGenerated, updateOrder]);

  useEffect(() => {
    if (
      !ORDER_CONFIRMATION_DEMO_MODE ||
      !order?.validationTimeline ||
      order.orderStatus === 'purchase_order_generated' ||
      isValidationComplete(order.validationTimeline) ||
      activeSimulationOrderId === order.id
    ) {
      return;
    }

    activeSimulationOrderId = order.id;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const scheduleNextStep = (): void => {
      const latestOrder = useOrderStore.getState().currentOrder;
      if (!latestOrder?.validationTimeline || isValidationComplete(latestOrder.validationTimeline)) {
        activeSimulationOrderId = null;
        return;
      }

      const delay = getRandomDemoStepDelay();
      timers.push(
        setTimeout(() => {
          advanceValidationStep();

          const updatedOrder = useOrderStore.getState().currentOrder;
          if (!updatedOrder?.validationTimeline) {
            activeSimulationOrderId = null;
            return;
          }

          if (isValidationComplete(updatedOrder.validationTimeline)) {
            activeSimulationOrderId = null;
            return;
          }

          scheduleNextStep();
        }, delay),
      );
    };

    scheduleNextStep();

    return () => {
      timers.forEach(clearTimeout);
      if (activeSimulationOrderId === order.id) {
        activeSimulationOrderId = null;
      }
    };
  }, [advanceValidationStep, order?.id, order?.orderStatus, order?.validationTimeline]);

  const destination =
    order?.destination || `${checkoutAddress.line2}, ${checkoutAddress.state}`;

  const timelineSteps = useMemo(
    () =>
      order
        ? buildValidationTimelineSteps(order.validationTimeline, order)
        : buildValidationTimelineSteps(createInitialValidationTimeline(), {
            id: '',
            productName: '',
            quantityMt: 0,
            warehouse: '',
            destination: '',
            amount: 0,
            paymentMethod: '',
            paymentMethodId: 'advance',
            paymentStatus: 'pending',
            verificationStatus: 'none',
            procurement: null,
            paymentVerifiedAt: null,
            orderStatus: 'awaiting_confirmation',
            priceLockStatus: 'active',
            priceLockStartedAt: null,
            priceLockDurationSeconds: PRICE_LOCK_DURATION_SECONDS,
            validationTimeline: createInitialValidationTimeline(),
            confirmationStatus: 'pending_petrotrade',
            supplierConfirmation: 'pending',
            inventoryReserved: false,
            poNumber: null,
            poGenerated: false,
            procurementCompleted: false,
            dispatchStatus: null,
            documentsReady: false,
            workflowTimeline: null,
            dispatchReadiness: null,
            transitWindow: null,
            createdAt: new Date().toISOString(),
          }),
    [order],
  );

  const isComplete =
    order?.orderStatus === 'purchase_order_generated' || order?.orderStatus === 'confirmed';

  const handleTrackStatus = useCallback(() => {
    router.replace(ROUTES.CUSTOMER.ORDER_AWAITING_CONFIRMATION as Href);
  }, [router]);

  const handleContactSupport = useCallback(() => {
    Alert.alert(
      ORDER_CONFIRMATION_COPY.supportAlertTitle,
      ORDER_CONFIRMATION_COPY.supportAlertMessage,
      [{ text: 'OK' }],
    );
  }, []);

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
    destination,
    timelineSteps,
    countdown,
    isDemoMode: ORDER_CONFIRMATION_DEMO_MODE,
    isComplete,
    handleTrackStatus,
    handleContactSupport,
    handleBack,
    handleNotifications,
  };
};
