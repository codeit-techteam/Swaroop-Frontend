import type { Order } from '@/types/order';
import type { WorkflowStepId } from '@/types/purchaseOrder';
import type {
  TrackingOrderStatus,
  TrackingOrderStatusBadgeConfig,
  TrackingStepId,
  TrackingTimelineItem,
  TrackingTimelineState,
} from '@/types/tracking';
import { brandColors } from '@/theme/colors';

/** When enabled, auto-advances the live tracking timeline every 5 seconds. */
export const TRACKING_DEMO_MODE = __DEV__;

export const TRACKING_DEMO_INTERVAL_MS = 5000;

export const TRACKING_STEP_SEQUENCE: TrackingStepId[] = [
  'order_submitted',
  'payment_verified',
  'procurement_approved',
  'purchase_order_generated',
  'dispatch_scheduled',
  'vehicle_allocated',
  'shipment_picked_up',
  'in_transit',
  'reached_destination_hub',
  'out_for_delivery',
  'delivered',
];

export const TRACKING_DEMO_SEQUENCE: TrackingStepId[] = [
  'dispatch_scheduled',
  'vehicle_allocated',
  'shipment_picked_up',
  'in_transit',
  'reached_destination_hub',
  'out_for_delivery',
  'delivered',
];

export const TRACKING_COPY = {
  liveTrackingHeading: 'LIVE TRACKING STATUS',
  orderInformationHeading: 'ORDER INFORMATION',
  blindMarketplaceMessage:
    'PetroTrade manages procurement, transportation and delivery while maintaining supplier confidentiality.',
  downloadToastMessage: 'PDF download will be available after backend integration.',
  documentToastTitle: 'Document Unavailable',
  supportToastMessage: 'Support request will be available after backend integration.',
  trackHistoryToastMessage: 'Track history will be available after backend integration.',
} as const;

const TRACKING_STEP_TITLES: Record<TrackingStepId, string> = {
  order_submitted: 'Order Submitted',
  payment_verified: 'Payment Verified',
  procurement_approved: 'Procurement Approved',
  purchase_order_generated: 'Purchase Order Generated',
  dispatch_scheduled: 'Dispatch Scheduled',
  vehicle_allocated: 'Vehicle Allocated',
  shipment_picked_up: 'Shipment Picked Up',
  in_transit: 'In Transit',
  reached_destination_hub: 'Reached Destination Hub',
  out_for_delivery: 'Out For Delivery',
  delivered: 'Delivered',
};

const WORKFLOW_TO_TRACKING_STEP: Partial<Record<WorkflowStepId, TrackingStepId>> = {
  payment_verified: 'payment_verified',
  procurement_approved: 'procurement_approved',
  purchase_order_generated: 'purchase_order_generated',
  dispatch_planning: 'dispatch_scheduled',
  vehicle_allocation: 'vehicle_allocated',
  driver_assigned: 'vehicle_allocated',
  shipment_ready: 'shipment_picked_up',
  shipment_started: 'in_transit',
  delivered: 'delivered',
};

const TRACKING_TO_DISPATCH_STATUS: Partial<
  Record<TrackingStepId, NonNullable<Order['dispatchStatus']>>
> = {
  dispatch_scheduled: 'planning',
  vehicle_allocated: 'vehicle_allocation',
  shipment_picked_up: 'shipment_ready',
  in_transit: 'shipment_started',
  reached_destination_hub: 'shipment_started',
  out_for_delivery: 'shipment_started',
  delivered: 'delivered',
};

const TRACKING_TO_WORKFLOW_STEP: Partial<Record<TrackingStepId, WorkflowStepId>> = {
  payment_verified: 'payment_verified',
  procurement_approved: 'procurement_approved',
  purchase_order_generated: 'purchase_order_generated',
  dispatch_scheduled: 'dispatch_planning',
  vehicle_allocated: 'vehicle_allocation',
  shipment_picked_up: 'shipment_ready',
  in_transit: 'shipment_started',
  reached_destination_hub: 'shipment_started',
  out_for_delivery: 'shipment_started',
  delivered: 'delivered',
};

const STEP_DAY_OFFSETS: Record<TrackingStepId, number> = {
  order_submitted: 0,
  payment_verified: 0,
  procurement_approved: 0,
  purchase_order_generated: 1,
  dispatch_scheduled: 3,
  vehicle_allocated: 4,
  shipment_picked_up: 5,
  in_transit: 6,
  reached_destination_hub: 7,
  out_for_delivery: 8,
  delivered: 9,
};

export const formatTrackingOrderNumber = (orderId: string): string => {
  const suffix = orderId.replace(/^PT-ORD-/, '');
  return `ORD-2026-${suffix}`;
};

export const formatTrackingDate = (
  isoDate: string | null,
): { date: string; time: string } => {
  if (!isoDate) {
    return { date: '—', time: '' };
  }

  const date = new Date(isoDate);

  return {
    date: date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  };
};

export const formatExpectedDeliveryDate = (order: Order): string => {
  if (order.eta && !order.eta.toLowerCase().includes('tomorrow')) {
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

const getStepTimestamp = (order: Order, stepId: TrackingStepId): string => {
  if (stepId === 'order_submitted') {
    return order.createdAt;
  }

  if (stepId === 'payment_verified' && order.paymentVerifiedAt) {
    return order.paymentVerifiedAt;
  }

  const base = new Date(order.createdAt);
  base.setDate(base.getDate() + STEP_DAY_OFFSETS[stepId]);
  base.setHours(10 + (STEP_DAY_OFFSETS[stepId] % 4), 30 + (STEP_DAY_OFFSETS[stepId] * 7) % 30, 0, 0);
  return base.toISOString();
};

const isSameDay = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const getStatusLabel = (
  stepId: TrackingStepId,
  status: TrackingTimelineItem['status'],
  timestamp: string,
): string => {
  if (status === 'pending') {
    if (stepId === 'in_transit') {
      return 'Pending Dispatch';
    }

    if (stepId === 'delivered') {
      return `Expected ${formatTrackingDate(timestamp).date}`;
    }

    return 'Pending';
  }

  if (status === 'current') {
    const stepDate = new Date(timestamp);
    const today = new Date();

    if (isSameDay(stepDate, today)) {
      return 'Estimated Today';
    }

    if (stepId === 'dispatch_scheduled') {
      return 'Estimated Today';
    }

    return 'In Progress';
  }

  return 'Completed';
};

export const deriveTrackingTimelineState = (order: Order): TrackingTimelineState => {
  if (order.trackingTimeline) {
    return order.trackingTimeline;
  }

  const completedSteps: TrackingStepId[] = ['order_submitted'];

  if (order.paymentStatus === 'verified' || order.paymentVerifiedAt) {
    completedSteps.push('payment_verified');
  }

  const workflow = order.workflowTimeline;
  if (workflow) {
    workflow.completedSteps.forEach((stepId) => {
      const trackingStep = WORKFLOW_TO_TRACKING_STEP[stepId];
      if (trackingStep && !completedSteps.includes(trackingStep)) {
        completedSteps.push(trackingStep);
      }
    });
  }

  if (order.poGenerated && !completedSteps.includes('purchase_order_generated')) {
    completedSteps.push('purchase_order_generated');
  }

  if (order.procurementCompleted && !completedSteps.includes('procurement_approved')) {
    completedSteps.push('procurement_approved');
  }

  let currentStep: TrackingStepId = 'order_submitted';

  if (order.dispatchStatus === 'delivered') {
    currentStep = 'delivered';
  } else if (order.dispatchStatus === 'shipment_started') {
    currentStep = 'in_transit';
  } else if (order.dispatchStatus === 'shipment_ready') {
    currentStep = 'shipment_picked_up';
  } else if (
    order.dispatchStatus === 'vehicle_allocation' ||
    order.dispatchStatus === 'driver_assigned'
  ) {
    currentStep = 'vehicle_allocated';
  } else if (order.dispatchStatus === 'planning') {
    currentStep = 'dispatch_scheduled';
  } else if (workflow?.currentStep) {
    const mapped = WORKFLOW_TO_TRACKING_STEP[workflow.currentStep];
    if (mapped) {
      currentStep = mapped;
    }
  } else if (order.paymentStatus === 'verified') {
    currentStep = 'payment_verified';
  }

  const currentIndex = TRACKING_STEP_SEQUENCE.indexOf(currentStep);
  TRACKING_STEP_SEQUENCE.slice(0, currentIndex).forEach((stepId) => {
    if (!completedSteps.includes(stepId)) {
      completedSteps.push(stepId);
    }
  });

  if (order.dispatchStatus === 'delivered' && !completedSteps.includes('delivered')) {
    completedSteps.push('delivered');
  }

  return {
    currentStep,
    completedSteps,
  };
};

export const buildTrackingTimelineItems = (order: Order): TrackingTimelineItem[] => {
  const timeline = deriveTrackingTimelineState(order);

  return TRACKING_STEP_SEQUENCE.map((stepId) => {
    const title = TRACKING_STEP_TITLES[stepId];
    let status: TrackingTimelineItem['status'] = 'pending';

    if (timeline.completedSteps.includes(stepId) && stepId !== timeline.currentStep) {
      status = 'completed';
    } else if (stepId === timeline.currentStep) {
      status = 'current';
    } else if (
      order.dispatchStatus === 'delivered' &&
      stepId === 'delivered'
    ) {
      status = 'completed';
    }

    const timestamp = getStepTimestamp(order, stepId);
    const { date, time } = formatTrackingDate(timestamp);
    const statusLabel = getStatusLabel(stepId, status, timestamp);

    let displayDate = date;
    let displayTime = time;

    if (status === 'current' && statusLabel === 'Estimated Today') {
      displayDate = 'Today';
    }

    if (status === 'pending') {
      displayDate = statusLabel;
      displayTime = '';
    }

    return {
      id: stepId,
      title,
      date: displayDate,
      time: displayTime,
      statusLabel,
      status,
    };
  });
};

export const deriveTrackingOrderStatus = (order: Order): TrackingOrderStatus => {
  const { currentStep } = deriveTrackingTimelineState(order);

  switch (currentStep) {
    case 'delivered':
      return 'delivered';
    case 'out_for_delivery':
      return 'out_for_delivery';
    case 'in_transit':
    case 'reached_destination_hub':
      return 'transit';
    case 'shipment_picked_up':
    case 'vehicle_allocated':
      return 'dispatched';
    case 'dispatch_scheduled':
      return order.dispatchStatus === 'planning' ? 'preparing' : 'dispatched';
    default:
      return 'preparing';
  }
};

export const getTrackingOrderStatusBadgeConfig = (
  status: TrackingOrderStatus,
): TrackingOrderStatusBadgeConfig => {
  switch (status) {
    case 'preparing':
      return {
        label: 'PREPARING',
        backgroundColor: '#FFEDD5',
        textColor: '#C2410C',
      };
    case 'dispatched':
      return {
        label: 'DISPATCHED',
        backgroundColor: '#DBEAFE',
        textColor: '#1D4ED8',
      };
    case 'transit':
      return {
        label: 'TRANSIT',
        backgroundColor: '#DBEAFE',
        textColor: '#1D4ED8',
      };
    case 'out_for_delivery':
      return {
        label: 'OUT FOR DELIVERY',
        backgroundColor: '#E0E7FF',
        textColor: '#4338CA',
      };
    case 'delivered':
      return {
        label: 'DELIVERED',
        backgroundColor: brandColors.successLight,
        textColor: brandColors.success,
      };
    default:
      return {
        label: 'PREPARING',
        backgroundColor: '#FFEDD5',
        textColor: '#C2410C',
      };
  }
};

export const getNextTrackingDemoStep = (
  currentStep: TrackingStepId,
): TrackingStepId | null => {
  const currentIndex = TRACKING_DEMO_SEQUENCE.indexOf(currentStep);
  if (currentIndex < 0 || currentIndex >= TRACKING_DEMO_SEQUENCE.length - 1) {
    return null;
  }

  return TRACKING_DEMO_SEQUENCE[currentIndex + 1] ?? null;
};

export const createTrackingAdvancePatch = (
  order: Order,
  nextStep: TrackingStepId,
): Partial<Order> => {
  const timeline = deriveTrackingTimelineState(order);
  const completedSteps = timeline.completedSteps.includes(timeline.currentStep)
    ? timeline.completedSteps
    : [...timeline.completedSteps, timeline.currentStep];

  const dispatchStatus = TRACKING_TO_DISPATCH_STATUS[nextStep] ?? order.dispatchStatus;
  const workflowStep = TRACKING_TO_WORKFLOW_STEP[nextStep];

  const workflowTimeline = order.workflowTimeline
    ? {
        currentStep: workflowStep ?? order.workflowTimeline.currentStep,
        completedSteps: workflowStep
          ? Array.from(
              new Set([
                ...order.workflowTimeline.completedSteps,
                ...completedSteps
                  .map((step) => TRACKING_TO_WORKFLOW_STEP[step])
                  .filter((step): step is WorkflowStepId => Boolean(step)),
                workflowStep,
              ]),
            )
          : order.workflowTimeline.completedSteps,
      }
    : null;

  return {
    trackingTimeline: {
      currentStep: nextStep,
      completedSteps: Array.from(new Set([...completedSteps, nextStep])),
    },
    dispatchStatus: dispatchStatus ?? order.dispatchStatus,
    workflowTimeline,
    shipmentStatus:
      nextStep === 'delivered'
        ? 'delivered'
        : nextStep === 'in_transit' ||
            nextStep === 'reached_destination_hub' ||
            nextStep === 'out_for_delivery'
          ? 'in_transit'
          : order.shipmentStatus,
    orderStatus: order.orderStatus,
    eta: nextStep === 'delivered' ? 'Delivered' : order.eta,
  };
};

export const isTrackingDemoComplete = (order: Order): boolean =>
  deriveTrackingTimelineState(order).currentStep === 'delivered';
