import type { Href } from 'expo-router';

import {
  createDispatchStartedPatch,
  createInTransitWithoutPaymentPatch,
  DEFAULT_SHIPMENT_DETAILS,
  formatDispatchTime,
} from '@/constants/dispatchStarted';
import {
  createLoadingCompletedPatch,
  createLoadingScheduledPatch,
} from '@/constants/loadingWorkflow';
import {
  createDeliveryCompletedPatch,
  isOnDeliveryPaymentFlow,
  ON_DELIVERY_PAYMENT_SEQUENCE,
} from '@/constants/deliveryCompleted';
import {
  CREDIT_STATUS_SEQUENCE,
  getCreditScreenRoute,
  isCreditPaymentFlow,
} from '@/constants/creditWorkflow';
import { createInitialProcurementState } from '@/constants/procurementSteps';
import { ROUTES } from '@/navigation/routes';
import type { Order } from '@/types/order';
import type { OrderStatus, OrderTimelineStep } from '@/types/orderStatus';
import type { PaymentMethodId } from '@/types/payment';
import type { TrackingTimelineItem } from '@/types/tracking';

/** Full lifecycle sequence used for track-order timeline and progress. */
export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  'ORDER_CREATED',
  'PROCUREMENT_STARTED',
  'SUPPLIER_MATCHING',
  'LOADING_SCHEDULED',
  'LOADING_COMPLETED',
  'PAYMENT_PENDING',
  'PAYMENT_VERIFIED',
  'DISPATCH_STARTED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERY_COMPLETED',
  'DELIVERED',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  ORDER_CREATED: 'Order Created',
  PROCUREMENT_STARTED: 'Procurement Started',
  SUPPLIER_MATCHING: 'Supplier Matching',
  LOADING_SCHEDULED: 'Loading Scheduled',
  LOADING_COMPLETED: 'Loading Completed',
  PAYMENT_PENDING: 'Payment Pending',
  PAYMENT_VERIFIED: 'Payment Verified',
  DISPATCH_STARTED: 'Dispatch Started',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out For Delivery',
  DELIVERY_COMPLETED: 'Delivery Completed',
  DELIVERED: 'Delivered',
};

/** Badge labels shown on the Orders screen. */
export const ORDER_STATUS_BADGE_LABELS: Record<OrderStatus, string> = {
  ORDER_CREATED: 'Order Created',
  PROCUREMENT_STARTED: 'Processing',
  SUPPLIER_MATCHING: 'Supplier Matching',
  LOADING_SCHEDULED: 'Loading',
  LOADING_COMPLETED: 'Loading',
  PAYMENT_PENDING: 'Payment Pending',
  PAYMENT_VERIFIED: 'Payment Verified',
  DISPATCH_STARTED: 'Dispatch',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'In Transit',
  DELIVERY_COMPLETED: 'Delivered',
  DELIVERED: 'Delivered',
};

export const ORDER_STATUS_PROGRESS: Record<OrderStatus, number> = {
  ORDER_CREATED: 9,
  PROCUREMENT_STARTED: 18,
  SUPPLIER_MATCHING: 27,
  LOADING_SCHEDULED: 36,
  LOADING_COMPLETED: 45,
  PAYMENT_PENDING: 54,
  PAYMENT_VERIFIED: 63,
  DISPATCH_STARTED: 72,
  IN_TRANSIT: 81,
  OUT_FOR_DELIVERY: 90,
  DELIVERY_COMPLETED: 95,
  DELIVERED: 100,
};

const isDeferredPayment = (methodId: PaymentMethodId): boolean =>
  methodId === 'on_loading' || methodId === 'on_delivery';

const isCreditPayment = (methodId: PaymentMethodId): boolean =>
  methodId === 'credit_15' || methodId === 'credit_30';

/** Advance-payment flow: payment before procurement. */
const ADVANCE_STATUS_SEQUENCE: OrderStatus[] = [
  'ORDER_CREATED',
  'PAYMENT_PENDING',
  'PAYMENT_VERIFIED',
  'PROCUREMENT_STARTED',
  'SUPPLIER_MATCHING',
  'LOADING_SCHEDULED',
  'LOADING_COMPLETED',
  'DISPATCH_STARTED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

/** On-loading / on-delivery flow: procurement and loading before payment. */
const DEFERRED_STATUS_SEQUENCE: OrderStatus[] = [
  'ORDER_CREATED',
  'PROCUREMENT_STARTED',
  'SUPPLIER_MATCHING',
  'LOADING_SCHEDULED',
  'LOADING_COMPLETED',
  'PAYMENT_PENDING',
  'PAYMENT_VERIFIED',
  'DISPATCH_STARTED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export const getStatusSequenceForOrder = (order: Order): OrderStatus[] => {
  if (isOnDeliveryPaymentFlow(order)) {
    return ON_DELIVERY_PAYMENT_SEQUENCE;
  }
  if (isCreditPayment(order.paymentMethodId)) {
    return CREDIT_STATUS_SEQUENCE;
  }
  if (isDeferredPayment(order.paymentMethodId)) {
    return DEFERRED_STATUS_SEQUENCE;
  }
  return ADVANCE_STATUS_SEQUENCE;
};

export const getStatusIndex = (status: OrderStatus): number =>
  ORDER_STATUS_SEQUENCE.indexOf(status);

export const isStatusAtOrAfter = (current: OrderStatus, target: OrderStatus): boolean =>
  getStatusIndex(current) >= getStatusIndex(target);

export const isStatusBefore = (current: OrderStatus, target: OrderStatus): boolean =>
  getStatusIndex(current) < getStatusIndex(target);

/** Infer canonical status from legacy order fields (migration / demo orders). */
export const inferOrderStatus = (order: Order): OrderStatus => {
  if (order.status) {
    return order.status;
  }

  if (order.dispatchStatus === 'delivered' || order.shipmentStatus === 'delivered') {
    if (isOnDeliveryPaymentFlow(order) && order.paymentStatus === 'pending') {
      return 'DELIVERY_COMPLETED';
    }
    return 'DELIVERED';
  }

  if (order.trackingTimeline?.currentStep === 'out_for_delivery') {
    return 'OUT_FOR_DELIVERY';
  }

  if (
    order.dispatchStatus === 'shipment_started' ||
    order.shipmentStatus === 'in_transit' ||
    order.trackingAvailable
  ) {
    if (order.dispatchTrackingTimeline?.currentStep === 'in_transit') {
      return 'IN_TRANSIT';
    }
    if (order.orderStatus === 'dispatch_started' || order.trackingAvailable) {
      return order.dispatchStatus === 'shipment_started' ? 'IN_TRANSIT' : 'DISPATCH_STARTED';
    }
  }

  if (order.paymentStatus === 'verified' || order.verificationStatus === 'verified') {
    if (order.loadingStatus === 'completed' && isDeferredPayment(order.paymentMethodId)) {
      if (order.trackingAvailable || order.dispatchStatus === 'shipment_started') {
        return 'IN_TRANSIT';
      }
      return 'DISPATCH_STARTED';
    }
    if (order.procurementCompleted || order.poGenerated) {
      if (order.loadingStatus === 'completed') {
        return 'LOADING_COMPLETED';
      }
      if (order.loadingStatus === 'scheduled') {
        return 'LOADING_SCHEDULED';
      }
      return 'SUPPLIER_MATCHING';
    }
    return 'PAYMENT_VERIFIED';
  }

  if (order.paymentStatus === 'submitted' || order.verificationStatus === 'pending') {
    return 'PAYMENT_PENDING';
  }

  if (order.loadingStatus === 'completed') {
    return 'LOADING_COMPLETED';
  }

  if (order.loadingStatus === 'scheduled') {
    return 'LOADING_SCHEDULED';
  }

  if (order.procurement?.status === 'matching' || order.procurement?.status === 'checking') {
    return 'SUPPLIER_MATCHING';
  }

  if (order.procurement || order.procurementCompleted) {
    return 'PROCUREMENT_STARTED';
  }

  return 'ORDER_CREATED';
};

export const computeExpectedDelivery = (order: Order): string => {
  if (order.expectedDelivery) {
    return order.expectedDelivery;
  }

  if (order.eta && order.eta !== 'Delivered') {
    return order.eta;
  }

  const base = new Date(order.createdAt);
  base.setDate(base.getDate() + 9);
  return base.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const buildDispatchTrackingForStatus = (
  status: OrderStatus,
): NonNullable<Order['dispatchTrackingTimeline']> => {
  const statusToStep: Partial<
    Record<OrderStatus, NonNullable<Order['dispatchTrackingTimeline']>['currentStep']>
  > = {
    ORDER_CREATED: 'order_submitted',
    PROCUREMENT_STARTED: 'procurement',
    SUPPLIER_MATCHING: 'procurement',
    LOADING_SCHEDULED: 'loading_scheduled',
    LOADING_COMPLETED: 'loading_completed',
    PAYMENT_PENDING: 'loading_completed',
    PAYMENT_VERIFIED: 'payment_verified',
    DISPATCH_STARTED: 'dispatch_started',
    IN_TRANSIT: 'in_transit',
    OUT_FOR_DELIVERY: 'in_transit',
    DELIVERY_COMPLETED: 'delivered',
    DELIVERED: 'delivered',
  };

  const currentStep = statusToStep[status] ?? 'order_submitted';
  const stepOrder = [
    'order_submitted',
    'procurement',
    'loading_scheduled',
    'loading_completed',
    'payment_verified',
    'dispatch_started',
    'in_transit',
    'delivered',
  ] as const;

  const currentIndex = stepOrder.indexOf(currentStep);
  const completedSteps = stepOrder.slice(0, currentIndex);

  return { currentStep, completedSteps: [...completedSteps] };
};

/** Build field patches when transitioning to a new status. */
export const createStatusPatch = (status: OrderStatus, order: Order): Partial<Order> => {
  const now = new Date().toISOString();
  const base: Partial<Order> = {
    status,
    currentStep: status,
    expectedDelivery: computeExpectedDelivery(order),
  };

  switch (status) {
    case 'ORDER_CREATED':
      return {
        ...base,
        orderStatus: 'order_created',
        paymentStatus: 'pending',
        verificationStatus: 'none',
        loadingStatus: 'pending',
        procurement: null,
        procurementCompleted: false,
      };

    case 'PROCUREMENT_STARTED':
      return {
        ...base,
        procurement: order.procurement ?? createInitialProcurementState(now),
        paymentVerifiedAt: order.paymentVerifiedAt ?? now,
      };

    case 'SUPPLIER_MATCHING':
      return {
        ...base,
        procurement: order.procurement
          ? { ...order.procurement, status: 'matching', updatedAt: now }
          : createInitialProcurementState(now),
      };

    case 'LOADING_SCHEDULED':
      return {
        ...base,
        ...createLoadingScheduledPatch(order),
        procurementCompleted: true,
        procurement: order.procurement
          ? { ...order.procurement, status: 'completed', progress: 100, updatedAt: now }
          : order.procurement,
      };

    case 'LOADING_COMPLETED':
      return {
        ...base,
        ...createLoadingCompletedPatch(order),
      };

    case 'PAYMENT_PENDING':
      return {
        ...base,
        paymentStatus: 'submitted',
        verificationStatus: 'pending',
      };

    case 'PAYMENT_VERIFIED': {
      const verifiedAt = order.paymentVerifiedAt ?? now;
      return {
        ...base,
        paymentStatus: 'verified',
        verificationStatus: 'verified',
        paymentVerifiedAt: verifiedAt,
        dispatchTrackingTimeline: buildDispatchTrackingForStatus('PAYMENT_VERIFIED'),
      };
    }

    case 'DISPATCH_STARTED': {
      const dispatchPatch = isDeferredPayment(order.paymentMethodId)
        ? createInTransitWithoutPaymentPatch(order)
        : createDispatchStartedPatch(order);
      return {
        ...base,
        ...dispatchPatch,
        dispatchTrackingTimeline: buildDispatchTrackingForStatus('DISPATCH_STARTED'),
      };
    }

    case 'IN_TRANSIT':
      return {
        ...base,
        orderStatus: 'dispatch_started',
        shipmentStatus: 'in_transit',
        dispatchStatus: 'shipment_started',
        trackingAvailable: true,
        dispatchProgress: 60,
        eta: order.eta ?? '3 Days',
        shipmentDetails: order.shipmentDetails ?? {
          ...DEFAULT_SHIPMENT_DETAILS,
          dispatchTime: formatDispatchTime(now),
        },
        dispatchTrackingTimeline: buildDispatchTrackingForStatus('IN_TRANSIT'),
      };

    case 'OUT_FOR_DELIVERY':
      return {
        ...base,
        shipmentStatus: 'in_transit',
        dispatchStatus: 'shipment_started',
        trackingAvailable: true,
        eta: order.eta ?? 'Today',
        dispatchTrackingTimeline: buildDispatchTrackingForStatus('OUT_FOR_DELIVERY'),
      };

    case 'DELIVERY_COMPLETED':
      return {
        ...base,
        ...createDeliveryCompletedPatch(order),
        dispatchTrackingTimeline: buildDispatchTrackingForStatus('DELIVERY_COMPLETED'),
      };

    case 'DELIVERED':
      return {
        ...base,
        orderStatus: 'dispatch_started',
        shipmentStatus: 'delivered',
        dispatchStatus: 'delivered',
        trackingAvailable: true,
        dispatchProgress: 100,
        progress: 100,
        eta: 'Delivered',
        dispatchTrackingTimeline: buildDispatchTrackingForStatus('DELIVERED'),
      };

    default:
      return base;
  }
};

export const buildOrderTimeline = (order: Order): OrderTimelineStep[] => {
  const currentStatus = inferOrderStatus(order);
  const currentIndex = getStatusIndex(currentStatus);

  return ORDER_STATUS_SEQUENCE.map((stepId) => {
    const stepIndex = getStatusIndex(stepId);
    let stepStatus: OrderTimelineStep['status'] = 'pending';

    if (stepIndex < currentIndex) {
      stepStatus = 'completed';
    } else if (stepIndex === currentIndex) {
      stepStatus =
        currentStatus === 'DELIVERED' || currentStatus === 'DELIVERY_COMPLETED'
          ? 'completed'
          : 'current';
    }

    return {
      id: stepId,
      title: ORDER_STATUS_LABELS[stepId],
      status: stepStatus,
    };
  });
};

/** Maps canonical order status timeline to track-order UI items. */
export const buildCanonicalTrackingTimelineItems = (order: Order): TrackingTimelineItem[] => {
  const steps = buildOrderTimeline(order);

  return steps.map((step) => {
    let statusLabel = 'Pending';
    let displayDate = 'Pending';

    if (step.status === 'completed') {
      statusLabel = 'Completed';
      displayDate = 'Completed';
    } else if (step.status === 'current') {
      statusLabel = 'In Progress';
      displayDate = 'Today';
    }

    return {
      id: step.id as unknown as TrackingTimelineItem['id'],
      title: step.title,
      date: displayDate,
      time: '',
      statusLabel,
      status: step.status,
    };
  });
};

export const getNextStatusInFlow = (order: Order): OrderStatus | null => {
  const sequence = getStatusSequenceForOrder(order);
  const current = inferOrderStatus(order);
  const index = sequence.indexOf(current);

  if (index < 0 || index >= sequence.length - 1) {
    return null;
  }

  return sequence[index + 1] ?? null;
};

export const getScreenRouteForOrder = (order: Order): Href => {
  const creditRoute = getCreditScreenRoute(order);
  if (creditRoute) {
    return creditRoute;
  }

  const status = inferOrderStatus(order);

  switch (status) {
    case 'ORDER_CREATED':
      if (order.paymentMethodId === 'advance') {
        return ROUTES.CUSTOMER.PAYMENT_UPLOAD_PROOF as Href;
      }
      if (isCreditPaymentFlow(order) && order.credit?.workflowPhase === 'approved') {
        return ROUTES.CUSTOMER.CREDIT_APPROVAL as Href;
      }
      return ROUTES.CUSTOMER.ORDER_SUBMITTED as Href;
    case 'PROCUREMENT_STARTED':
    case 'SUPPLIER_MATCHING':
      return ROUTES.CUSTOMER.PROCUREMENT_CONFIRMATION as Href;
    case 'LOADING_SCHEDULED':
      return ROUTES.CUSTOMER.LOADING_SCHEDULED as Href;
    case 'LOADING_COMPLETED':
      return ROUTES.CUSTOMER.LOADING_COMPLETED as Href;
    case 'PAYMENT_PENDING':
      if (isCreditPaymentFlow(order)) {
        return (
          getCreditScreenRoute(order) ?? (ROUTES.CUSTOMER.CREDIT_COUNTDOWN as Href)
        );
      }
      if (isOnDeliveryPaymentFlow(order) && order.deliveryStatus === 'delivered') {
        return ROUTES.CUSTOMER.PAYMENT_REMINDER as Href;
      }
      return ROUTES.CUSTOMER.PAYMENT_UPLOAD_PROOF as Href;
    case 'PAYMENT_VERIFIED':
      return ROUTES.CUSTOMER.PAYMENT_VERIFICATION_INITIATED as Href;
    case 'DISPATCH_STARTED':
      return ROUTES.CUSTOMER.DISPATCH_STARTED as Href;
    case 'DELIVERY_COMPLETED':
      return ROUTES.CUSTOMER.DELIVERY_COMPLETED as Href;
    case 'IN_TRANSIT':
    case 'OUT_FOR_DELIVERY':
      return {
        pathname: ROUTES.CUSTOMER.SHIPMENT_TRACKING,
        params: { orderId: order.id },
      } as unknown as Href;
    case 'DELIVERED':
      if (isCreditPaymentFlow(order) && order.paymentStatus !== 'verified') {
        return ROUTES.CUSTOMER.CREDIT_INVOICE_DELIVERY as Href;
      }
      if (isOnDeliveryPaymentFlow(order) && order.paymentStatus === 'pending') {
        return ROUTES.CUSTOMER.DELIVERY_COMPLETED as Href;
      }
      return {
        pathname: ROUTES.CUSTOMER.SHIPMENT_TRACKING,
        params: { orderId: order.id },
      } as unknown as Href;
    default:
      return {
        pathname: ROUTES.CUSTOMER.ORDER_DETAIL,
        params: { orderId: order.id },
      } as unknown as Href;
  }
};

export const getTrackRouteForOrder = (order: Order): Href =>
  ({
    pathname: ROUTES.CUSTOMER.SHIPMENT_TRACKING,
    params: { orderId: order.id },
  }) as unknown as Href;

export const getActiveOrderFromList = (orders: Order[]): Order | null => {
  const active = orders.filter(
    (order) => inferOrderStatus(order) !== 'DELIVERED' && order.shipmentStatus !== 'cancelled',
  );

  if (active.length === 0) {
    return null;
  }

  return active[0] ?? null;
};

export const createInitialOrderFields = (): Pick<
  Order,
  'status' | 'currentStep' | 'expectedDelivery'
> => {
  const now = new Date();
  const expected = new Date(now);
  expected.setDate(expected.getDate() + 9);

  return {
    status: 'ORDER_CREATED',
    currentStep: 'ORDER_CREATED',
    expectedDelivery: expected.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  };
};
