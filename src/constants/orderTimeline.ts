import type { Order } from '@/types/order';
import type { ValidationStepId, ValidationTimelineStep } from '@/types/orderConfirmation';
import { formatDateTime } from '@/utils/date';

/** When true, simulates validation timeline progression automatically. */
export const ORDER_CONFIRMATION_DEMO_MODE = __DEV__;

export const PRICE_LOCK_DURATION_SECONDS = 15 * 60;

export const ORDER_CONFIRMATION_DEMO_STEP_MIN_DELAY_MS = 3000;

export const ORDER_CONFIRMATION_DEMO_STEP_MAX_DELAY_MS = 5000;

export const VALIDATION_STEP_IDS = {
  ORDER_RECEIVED: 'order_received',
  PAYMENT_VERIFIED: 'payment_verified',
  PROCUREMENT_MATCHING: 'procurement_matching',
  PRICE_RECONFIRMATION: 'price_reconfirmation',
  INVENTORY_ALLOCATION: 'inventory_allocation',
  SELLER_ACCEPTANCE: 'seller_acceptance',
  PURCHASE_ORDER_GENERATION: 'purchase_order_generation',
} as const satisfies Record<string, ValidationStepId>;

export const VALIDATION_STEP_SEQUENCE: ValidationStepId[] = [
  VALIDATION_STEP_IDS.ORDER_RECEIVED,
  VALIDATION_STEP_IDS.PAYMENT_VERIFIED,
  VALIDATION_STEP_IDS.PROCUREMENT_MATCHING,
  VALIDATION_STEP_IDS.PRICE_RECONFIRMATION,
  VALIDATION_STEP_IDS.INVENTORY_ALLOCATION,
  VALIDATION_STEP_IDS.SELLER_ACCEPTANCE,
  VALIDATION_STEP_IDS.PURCHASE_ORDER_GENERATION,
];

type ValidationStepDefinition = {
  title: string;
  getSubtitle: (order: Order) => string | undefined;
};

export const VALIDATION_STEP_DEFINITIONS: Record<ValidationStepId, ValidationStepDefinition> = {
  [VALIDATION_STEP_IDS.ORDER_RECEIVED]: {
    title: 'Order Received',
    getSubtitle: (order) => {
      const time = formatDateTime(order.createdAt, 'hh:mm A');
      return `Today, ${time}`;
    },
  },
  [VALIDATION_STEP_IDS.PAYMENT_VERIFIED]: {
    title: 'Payment Verified',
    getSubtitle: () => 'Credit facility limit checked',
  },
  [VALIDATION_STEP_IDS.PROCUREMENT_MATCHING]: {
    title: 'Procurement Matching',
    getSubtitle: () => 'Identified optimal sourcing node',
  },
  [VALIDATION_STEP_IDS.PRICE_RECONFIRMATION]: {
    title: 'Price Reconfirmation',
    getSubtitle: () => 'Validating current market index',
  },
  [VALIDATION_STEP_IDS.INVENTORY_ALLOCATION]: {
    title: 'Inventory Allocation',
    getSubtitle: () => 'Final stock blocking at hub',
  },
  [VALIDATION_STEP_IDS.SELLER_ACCEPTANCE]: {
    title: 'Seller Acceptance',
    getSubtitle: () => 'Blind verification complete',
  },
  [VALIDATION_STEP_IDS.PURCHASE_ORDER_GENERATION]: {
    title: 'Purchase Order Generation',
    getSubtitle: () => 'Digitally signed document',
  },
};

export const ORDER_CONFIRMATION_COPY = {
  headerTitle: 'Order Status',
  submittedTitle: 'Order Successfully Submitted',
  submittedChip: 'Pending PetroTrade Confirmation',
  priceLockHeading: 'Market Price Locked',
  priceLockSubtitle: 'Price expires after countdown. Secured inventory hold active.',
  priceLockExpired: 'Expired',
  infoMessage:
    'PetroTrade is securing inventory and validating today\'s market price before confirming your order.',
  orderDetailsHeading: 'Order Details',
  grandTotalLabel: 'Grand Total',
  validationTimelineHeading: 'Validation Timeline',
  statusLabel: 'Status',
  statusMessage: 'Waiting for Verified Supplier Confirmation',
  statusExpected: 'Expected: Within 15 Minutes',
  trackStatus: 'Track Status',
  contactSupport: 'Contact Support',
  supportAlertTitle: 'Contact Support',
  supportAlertMessage:
    'Our enterprise relationship managers are available 24×7. Frontend placeholder only — no call is placed.',
} as const;

export const getRandomDemoStepDelay = (): number => {
  const range =
    ORDER_CONFIRMATION_DEMO_STEP_MAX_DELAY_MS - ORDER_CONFIRMATION_DEMO_STEP_MIN_DELAY_MS;
  return ORDER_CONFIRMATION_DEMO_STEP_MIN_DELAY_MS + Math.floor(Math.random() * range);
};

export const buildValidationTimelineSteps = (
  timeline: Order['validationTimeline'],
  order: Order,
): ValidationTimelineStep[] => {
  const completedSteps = new Set(timeline?.completedSteps ?? []);
  const currentStep = timeline?.currentStep ?? VALIDATION_STEP_IDS.PRICE_RECONFIRMATION;

  return VALIDATION_STEP_SEQUENCE.map((stepId) => {
    const definition = VALIDATION_STEP_DEFINITIONS[stepId];
    let status: ValidationTimelineStep['status'] = 'pending';

    if (completedSteps.has(stepId)) {
      status = 'completed';
    } else if (stepId === currentStep) {
      status = 'current';
    }

    return {
      id: stepId,
      title: definition.title,
      subtitle: definition.getSubtitle(order),
      status,
    };
  });
};

export const createInitialValidationTimeline = (): Order['validationTimeline'] => ({
  currentStep: VALIDATION_STEP_IDS.PRICE_RECONFIRMATION,
  completedSteps: [
    VALIDATION_STEP_IDS.ORDER_RECEIVED,
    VALIDATION_STEP_IDS.PAYMENT_VERIFIED,
    VALIDATION_STEP_IDS.PROCUREMENT_MATCHING,
  ],
});
