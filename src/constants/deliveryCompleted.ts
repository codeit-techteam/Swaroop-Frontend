import type { Order } from '@/types/order';
import type {
  DeliveryDetails,
  DeliveryProofState,
  DeliveryReceiverDetails,
  DeliverySummary,
  DeliveryTimelineStep,
  DigitalPodState,
} from '@/types/delivery';
import type { OrderStatus } from '@/types/orderStatus';
import type { TrackingTimelineItem } from '@/types/tracking';

export const DELIVERY_COMPLETED_COPY = {
  headerTitle: 'Delivery Completed',
  successTitle: 'Shipment Delivered Successfully',
  successSubtitle:
    'Your shipment has been successfully delivered and received.\nThank you for choosing PetroTrade.',
  deliveredBadge: 'DELIVERED',
  deliveryInfoHeading: 'DELIVERY INFORMATION',
  receiverHeading: 'RECEIVER DETAILS',
  podHeading: 'Proof Of Delivery',
  podIdLabel: 'Digital POD ID',
  otpVerifiedLabel: 'Delivery OTP Verified',
  timestampLabel: 'Delivery Timestamp',
  verificationLabel: 'Verification Status',
  viewPodLabel: 'View POD',
  podModalTitle: 'Proof of Delivery',
  podModalPlaceholder: 'Digital POD document will be available after backend integration.',
  proofGalleryHeading: 'Delivery Proof Gallery',
  summaryHeading: 'DELIVERY SUMMARY',
  nextStepTitle: 'Payment Pending',
  nextStepDescription:
    'Your order has been successfully delivered.\nPlease complete the payment to close this order.',
  timelineHeading: 'Order Timeline',
  continueLabel: 'Continue To Payment',
  viewDetailsLabel: 'View Order Details',
  signedLabel: 'Signed',
  verifiedLabel: 'Verified',
  goodConditionLabel: 'Good',
  noDamageLabel: 'No Damage Reported',
} as const;

const DEFAULT_RECEIVER_NAME = 'Amit Sharma';
const DEFAULT_RECEIVER_MOBILE_MASKED = '+91 ******7294';
const DEFAULT_COMPANY_SUFFIX = 'Industries Pvt. Ltd.';

export const isOnDeliveryPaymentFlow = (order: Order): boolean =>
  order.paymentMethodId === 'on_delivery';

export const isPostDeliveryPaymentPending = (order: Order): boolean =>
  isOnDeliveryPaymentFlow(order) &&
  (order.status === 'DELIVERY_COMPLETED' ||
    (order.deliveryStatus === 'delivered' && order.paymentStatus === 'pending'));

export const formatDeliveryDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const formatDeliveryTime = (isoDate: string): string =>
  new Date(isoDate).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

const deriveCompanyName = (order: Order): string => {
  const destination = order.destination.trim();
  if (!destination) {
    return `PetroTrade Buyer ${DEFAULT_COMPANY_SUFFIX}`;
  }

  const cityPart = destination.split(',')[0]?.trim() ?? destination;
  return `${cityPart} ${DEFAULT_COMPANY_SUFFIX}`;
};

export const createDeliveryProofState = (): DeliveryProofState => ({
  items: [
    { id: 'delivery_photo', label: 'Delivery Photo' },
    { id: 'truck_arrival', label: 'Truck Arrival' },
    { id: 'receiver_signature', label: 'Receiver Signature' },
    { id: 'unload_confirmation', label: 'Unload Confirmation' },
  ],
});

export const createDeliveryReceiverDetails = (order: Order): DeliveryReceiverDetails => ({
  receiverName: DEFAULT_RECEIVER_NAME,
  receiverMobileMasked: DEFAULT_RECEIVER_MOBILE_MASKED,
  companyName: deriveCompanyName(order),
  deliveryAddress: order.destination,
  signatureStatus: 'signed',
});

export const createDigitalPodState = (order: Order, deliveredAt: string): DigitalPodState => ({
  podId: `PT-POD-${order.id.replace(/^PT-ORD-/, '')}`,
  otpVerified: true,
  deliveryTimestamp: deliveredAt,
  verificationStatus: 'verified',
});

export const createDeliverySummary = (order: Order): DeliverySummary => {
  const netWeightMt = order.loadingProof?.finalWeightMt ?? order.quantityMt * 0.962;

  return {
    product: order.productName,
    quantityMt: order.quantityMt,
    grossWeightMt: order.quantityMt,
    netWeightMt,
    deliveryCondition: DELIVERY_COMPLETED_COPY.goodConditionLabel,
    damageReported: false,
  };
};

export const createDeliveryDetails = (deliveredAt: string): DeliveryDetails => ({
  deliveryDate: formatDeliveryDate(deliveredAt),
  deliveryTime: formatDeliveryTime(deliveredAt),
  deliveryStatus: 'delivered',
});

export const createDeliveryCompletedPatch = (order: Order, deliveredAt?: string): Partial<Order> => {
  const timestamp = deliveredAt ?? new Date().toISOString();
  const vehicleNumber =
    order.shipmentDetails?.vehicleNumber ??
    order.loadingSchedule?.vehicleNumber ??
    order.loadingProof?.truckNumber ??
    '—';

  return {
    deliveryStatus: 'delivered',
    deliveredAt: timestamp,
    deliveryDetails: createDeliveryDetails(timestamp),
    deliveryProof: order.deliveryProof ?? createDeliveryProofState(),
    deliveryReceiver: order.deliveryReceiver ?? createDeliveryReceiverDetails(order),
    digitalPod: order.digitalPod ?? createDigitalPodState(order, timestamp),
    deliverySummary: order.deliverySummary ?? createDeliverySummary(order),
    shipmentStatus: 'delivered',
    dispatchStatus: 'delivered',
    trackingAvailable: true,
    dispatchProgress: 100,
    progress: 100,
    eta: 'Delivered',
    paymentStatus: 'pending',
    verificationStatus: 'none',
    shipmentDetails: order.shipmentDetails
      ? { ...order.shipmentDetails, vehicleNumber }
      : order.shipmentDetails,
    dispatchTrackingTimeline: {
      currentStep: 'delivered',
      completedSteps: [
        'order_submitted',
        'procurement',
        'loading_scheduled',
        'loading_completed',
        'dispatch_started',
        'in_transit',
        'delivered',
      ],
    },
  };
};

const DELIVERY_SCREEN_TIMELINE_STEPS: Array<{ id: DeliveryTimelineStep['id']; title: string }> = [
  { id: 'order_submitted', title: 'Order Submitted' },
  { id: 'procurement', title: 'Procurement' },
  { id: 'loading', title: 'Loading' },
  { id: 'dispatch', title: 'Dispatch' },
  { id: 'in_transit', title: 'In Transit' },
  { id: 'delivered', title: 'Delivered' },
  { id: 'payment_pending', title: 'Payment Pending' },
];

export const buildDeliveryCompletedTimeline = (): DeliveryTimelineStep[] =>
  DELIVERY_SCREEN_TIMELINE_STEPS.map((step) => ({
    ...step,
    status: step.id === 'payment_pending' ? 'current' : 'completed',
    statusLabel: step.id === 'payment_pending' ? 'CURRENT STEP' : undefined,
  }));

const TRACK_ORDER_POST_DELIVERY_STEPS: Array<{
  id: DeliveryTimelineStep['id'];
  title: string;
}> = [
  { id: 'order_submitted', title: 'Order Submitted' },
  { id: 'procurement', title: 'Procurement' },
  { id: 'loading', title: 'Loading' },
  { id: 'dispatch', title: 'Dispatch' },
  { id: 'in_transit', title: 'In Transit' },
  { id: 'delivered', title: 'Delivered' },
  { id: 'payment_pending', title: 'Payment Pending' },
  { id: 'payment_verified', title: 'Payment Verified' },
  { id: 'completed', title: 'Completed' },
];

export const buildOnDeliveryTrackTimeline = (order: Order): DeliveryTimelineStep[] => {
  const status = order.status ?? 'DELIVERY_COMPLETED';

  let currentStepId: DeliveryTimelineStep['id'] = 'payment_pending';

  if (status === 'PAYMENT_VERIFIED') {
    currentStepId = 'payment_verified';
  } else if (status === 'DELIVERED') {
    currentStepId = 'completed';
  }

  const currentIndex = TRACK_ORDER_POST_DELIVERY_STEPS.findIndex(
    (step) => step.id === currentStepId,
  );

  return TRACK_ORDER_POST_DELIVERY_STEPS.map((step, index) => {
    let statusValue: DeliveryTimelineStep['status'] = 'pending';

    if (index < currentIndex) {
      statusValue = 'completed';
    } else if (index === currentIndex) {
      statusValue = 'current';
    }

    return {
      ...step,
      status: statusValue,
      statusLabel: statusValue === 'current' ? 'IN PROGRESS' : undefined,
    };
  });
};

export const buildOnDeliveryTrackingTimelineItems = (order: Order): TrackingTimelineItem[] => {
  const steps = buildOnDeliveryTrackTimeline(order);

  return steps.map((step) => ({
    id: step.id as unknown as TrackingTimelineItem['id'],
    title: step.title,
    date:
      step.status === 'completed'
        ? 'Completed'
        : step.status === 'current'
          ? 'Today'
          : 'Pending',
    time: '',
    statusLabel:
      step.status === 'completed'
        ? 'Completed'
        : step.status === 'current'
          ? 'In Progress'
          : 'Pending',
    status: step.status,
  }));
};

export const shouldUseOnDeliveryPostDeliveryTimeline = (order: Order): boolean =>
  isOnDeliveryPaymentFlow(order) &&
  (order.status === 'DELIVERY_COMPLETED' ||
    order.status === 'PAYMENT_PENDING' ||
    order.status === 'PAYMENT_VERIFIED' ||
    (order.status === 'DELIVERED' && order.deliveryStatus === 'delivered'));

export const ON_DELIVERY_PAYMENT_SEQUENCE: OrderStatus[] = [
  'ORDER_CREATED',
  'PROCUREMENT_STARTED',
  'SUPPLIER_MATCHING',
  'LOADING_SCHEDULED',
  'LOADING_COMPLETED',
  'DISPATCH_STARTED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERY_COMPLETED',
  'PAYMENT_PENDING',
  'PAYMENT_VERIFIED',
  'DELIVERED',
];
