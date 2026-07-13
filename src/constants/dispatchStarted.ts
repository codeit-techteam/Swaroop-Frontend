import type { Order } from '@/types/order';
import type { DispatchTrackingStepId, DispatchTrackingTimelineItem } from '@/types/tracking';
import { WORKFLOW_STEP_IDS } from '@/constants/purchaseOrderTimeline';
import type { WorkflowStepId } from '@/types/purchaseOrder';

export const DISPATCH_STARTED_PROGRESS = 20;

export const DISPATCH_TRACKING_STEP_SEQUENCE: DispatchTrackingStepId[] = [
  'order_submitted',
  'procurement',
  'loading_scheduled',
  'loading_completed',
  'payment_verified',
  'dispatch_started',
  'in_transit',
  'delivered',
];

export const DISPATCH_TIMELINE_STEP_SEQUENCE: DispatchTrackingStepId[] = [
  'order_submitted',
  'procurement',
  'loading_scheduled',
  'loading_completed',
  'payment_verified',
  'dispatch_started',
  'in_transit',
  'delivered',
];

const DISPATCH_TRACKING_STEP_TITLES: Record<DispatchTrackingStepId, string> = {
  order_submitted: 'Order Submitted',
  procurement: 'Procurement Completed',
  loading_scheduled: 'Loading Scheduled',
  loading_completed: 'Loading Completed',
  payment_verified: 'Payment Verified',
  dispatch_started: 'Dispatch Started',
  in_transit: 'In Transit',
  delivered: 'Delivered',
};

export const DISPATCH_STARTED_COPY = {
  headerTitle: 'Dispatch Started',
  successTitle: 'Shipment Dispatched Successfully',
  successSubtitle:
    'Your payment has been verified.\nThe shipment has now left the warehouse and is on its way.',
  inTransitBadge: 'IN TRANSIT',
  liveStatusHeading: 'LIVE STATUS',
  currentStatus: 'Truck Left Warehouse',
  dispatchTimeLabel: 'Dispatch Time',
  estimatedDeliveryLabel: 'Estimated Delivery',
  estimatedDelivery: '3–5 Business Days',
  currentProgressLabel: 'Current Progress',
  shipmentDetailsHeading: 'SHIPMENT DETAILS',
  securityHeading: 'SECURITY',
  timelineHeading: 'Order Lifecycle',
  orderSummaryHeading: 'ORDER SUMMARY',
  trackShipment: 'Track Shipment',
  goToOrders: 'Go To Orders',
  paymentMethod: 'On Loading Payment',
  paymentStatus: 'Verified',
  transportPartner: 'Verified Logistics Partner',
  securityItems: [
    'Verified Dispatch',
    'GPS Tracking Enabled',
    'Digital Seal Verified',
    'Insurance Active',
    'Escrow Protected',
  ] as const,
} as const;

export const DEFAULT_SHIPMENT_DETAILS = {
  vehicleNumber: 'MH-04-AB-2291',
  driverName: 'Rajesh Kumar',
  driverContactMasked: '+91 ******8421',
  currentLocation: 'Near Mumbai Warehouse',
  transportPartner: 'Verified Logistics Partner',
} as const;

export const formatDispatchTime = (isoDate?: string): string => {
  const date = isoDate ? new Date(isoDate) : new Date();
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const time = date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return isToday ? `Today ${time}` : `${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ${time}`;
};

export const createInitialDispatchTrackingTimeline = (): {
  currentStep: DispatchTrackingStepId;
  completedSteps: DispatchTrackingStepId[];
} => ({
  currentStep: 'dispatch_started',
  completedSteps: ['order_submitted', 'procurement', 'loading_scheduled', 'loading_completed', 'payment_verified'],
});

export const isDeferredLoadingPaymentFlow = (order: Order): boolean =>
  order.paymentMethodId === 'on_loading' || order.paymentMethodId === 'on_delivery';

export const shouldUseDispatchTrackingTimeline = (order: Order): boolean =>
  Boolean(
    order.trackingAvailable ||
      order.dispatchTrackingTimeline ||
      (isDeferredLoadingPaymentFlow(order) &&
        (order.loadingStatus === 'scheduled' ||
          order.loadingStatus === 'completed' ||
          order.procurementCompleted)),
  );

export const deriveDispatchTrackingTimelineFromOrder = (
  order: Order,
): {
  currentStep: DispatchTrackingStepId;
  completedSteps: DispatchTrackingStepId[];
} => {
  if (order.dispatchTrackingTimeline) {
    return order.dispatchTrackingTimeline;
  }

  const preLoadingCompleted: DispatchTrackingStepId[] = ['order_submitted', 'procurement'];

  if (order.loadingStatus === 'scheduled') {
    return {
      currentStep: 'loading_scheduled',
      completedSteps: preLoadingCompleted,
    };
  }

  if (order.loadingStatus === 'completed') {
    const throughScheduled: DispatchTrackingStepId[] = [
      ...preLoadingCompleted,
      'loading_scheduled',
    ];

    if (order.paymentStatus !== 'verified') {
      return {
        currentStep: 'loading_completed',
        completedSteps: throughScheduled,
      };
    }

    const throughLoading: DispatchTrackingStepId[] = [...throughScheduled, 'loading_completed'];

    if (order.trackingAvailable || order.dispatchStatus === 'shipment_started') {
      if (order.dispatchStatus === 'delivered' || order.shipmentStatus === 'delivered') {
        return {
          currentStep: 'delivered',
          completedSteps: [
            ...throughLoading,
            'payment_verified',
            'dispatch_started',
            'in_transit',
          ],
        };
      }

      if (order.shipmentStatus === 'in_transit') {
        return {
          currentStep: 'in_transit',
          completedSteps: [...throughLoading, 'payment_verified', 'dispatch_started'],
        };
      }

      return {
        currentStep: 'dispatch_started',
        completedSteps: [...throughLoading, 'payment_verified'],
      };
    }

    return {
      currentStep: 'payment_verified',
      completedSteps: throughLoading,
    };
  }

  if (order.procurementCompleted) {
    return {
      currentStep: 'procurement',
      completedSteps: ['order_submitted'],
    };
  }

  return {
    currentStep: 'order_submitted',
    completedSteps: [],
  };
};

export const isDispatchStarted = (order: Order | null): boolean =>
  Boolean(
    order &&
      (order.orderStatus === 'dispatch_started' ||
        order.dispatchStatus === 'shipment_started' ||
        order.trackingAvailable),
  );

export const createInTransitWithoutPaymentPatch = (order: Order): Partial<Order> => {
  const now = new Date().toISOString();
  const dispatchTime = formatDispatchTime(now);

  return {
    orderStatus: 'dispatch_started',
    shipmentStatus: 'in_transit',
    dispatchStatus: 'shipment_started',
    trackingAvailable: true,
    dispatchProgress: DISPATCH_STARTED_PROGRESS,
    dispatchStartedAt: now,
    eta: '3 Days',
    transitWindow: DISPATCH_STARTED_COPY.estimatedDelivery,
    shipmentDetails: order.shipmentDetails ?? {
      ...DEFAULT_SHIPMENT_DETAILS,
      dispatchTime,
    },
    dispatchTrackingTimeline: {
      currentStep: 'dispatch_started',
      completedSteps: ['order_submitted', 'procurement', 'loading_scheduled', 'loading_completed'],
    },
  };
};

export const createDispatchStartedPatch = (order: Order): Partial<Order> => {
  const now = new Date().toISOString();
  const dispatchTime = formatDispatchTime(now);

  const completedWorkflowSteps: WorkflowStepId[] = order.workflowTimeline
    ? Array.from(
        new Set([
          ...order.workflowTimeline.completedSteps,
          order.workflowTimeline.currentStep,
          WORKFLOW_STEP_IDS.SHIPMENT_READY,
          WORKFLOW_STEP_IDS.SHIPMENT_STARTED,
        ]),
      )
    : [
        WORKFLOW_STEP_IDS.PAYMENT_VERIFIED,
        WORKFLOW_STEP_IDS.PROCUREMENT_APPROVED,
        WORKFLOW_STEP_IDS.PURCHASE_ORDER_GENERATED,
        WORKFLOW_STEP_IDS.DISPATCH_PLANNING,
        WORKFLOW_STEP_IDS.VEHICLE_ALLOCATION,
        WORKFLOW_STEP_IDS.DRIVER_ASSIGNED,
        WORKFLOW_STEP_IDS.SHIPMENT_READY,
      ];

  const dispatchTrackingTimeline = createInitialDispatchTrackingTimeline();

  return {
    orderStatus: 'dispatch_started',
    shipmentStatus: 'in_transit',
    paymentStatus: 'verified',
    verificationStatus: 'verified',
    dispatchStatus: 'shipment_started',
    trackingAvailable: true,
    dispatchProgress: DISPATCH_STARTED_PROGRESS,
    dispatchStartedAt: now,
    paymentVerifiedAt: order.paymentVerifiedAt ?? now,
    eta: '3 Days',
    transitWindow: DISPATCH_STARTED_COPY.estimatedDelivery,
    shipmentDetails: order.shipmentDetails ?? {
      ...DEFAULT_SHIPMENT_DETAILS,
      dispatchTime,
    },
    workflowTimeline: {
      currentStep: WORKFLOW_STEP_IDS.SHIPMENT_STARTED,
      completedSteps: completedWorkflowSteps,
    },
    dispatchTrackingTimeline,
  };
};

export const buildDispatchTimelineSteps = (
  order: Order,
): DispatchTrackingTimelineItem[] => {
  const timeline = deriveDispatchTrackingTimelineFromOrder(order);

  return DISPATCH_TIMELINE_STEP_SEQUENCE.map((stepId) => {
    let status: DispatchTrackingTimelineItem['status'] = 'pending';

    if (timeline.completedSteps.includes(stepId)) {
      status = 'completed';
    } else if (stepId === timeline.currentStep) {
      status = 'current';
    }

    return {
      id: stepId,
      title: DISPATCH_TRACKING_STEP_TITLES[stepId],
      status,
    };
  });
};

export const buildDispatchTrackingTimelineItems = (
  order: Order,
): DispatchTrackingTimelineItem[] => buildDispatchTimelineSteps(order);
