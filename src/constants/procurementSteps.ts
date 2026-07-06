import type {
  EngineCheck,
  EngineCheckId,
  OrderProgressStepId,
  ProcurementState,
} from '@/types/procurement';

/** When true, simulates procurement engine checks and progress automatically. */
export const PROCUREMENT_DEMO_MODE = __DEV__;

export const PROCUREMENT_DEMO_STEP_DELAY_MS = 2500;

export const PROCUREMENT_DEMO_CHECKING_DELAY_MS = 1800;

export const PROCUREMENT_DEMO_PROGRESS_MILESTONES = [10, 25, 42, 61, 80, 100] as const;

export const PROCUREMENT_STATUS_BADGE_LABELS: Record<ProcurementState['status'], string> = {
  pending: 'Preparing Procurement',
  matching: 'Matching Verified Suppliers',
  checking: 'Running Engine Checks',
  completed: 'Procurement Complete',
};

export const ORDER_PROGRESS_STEP_IDS = {
  PAYMENT_VERIFIED: 'payment_verified',
  ORDER_FORWARDED: 'order_forwarded',
  SUPPLIER_MATCHING: 'supplier_matching',
  INVENTORY_ALLOCATION: 'inventory_allocation',
  PURCHASE_ORDER_GENERATION: 'purchase_order_generation',
} as const satisfies Record<string, OrderProgressStepId>;

export const ENGINE_CHECK_IDS = {
  LIVE_INVENTORY: 'live_inventory',
  MARKET_PRICE: 'market_price',
  DELIVERY_ROUTE: 'delivery_route',
  STOCK_AVAILABILITY: 'stock_availability',
  DISPATCH_CAPACITY: 'dispatch_capacity',
} as const satisfies Record<string, EngineCheckId>;

export const ENGINE_CHECK_LABELS: Record<EngineCheckId, string> = {
  [ENGINE_CHECK_IDS.LIVE_INVENTORY]: 'Checking Live Inventory',
  [ENGINE_CHECK_IDS.MARKET_PRICE]: 'Checking Market Price',
  [ENGINE_CHECK_IDS.DELIVERY_ROUTE]: 'Checking Delivery Route',
  [ENGINE_CHECK_IDS.STOCK_AVAILABILITY]: 'Checking Stock Availability',
  [ENGINE_CHECK_IDS.DISPATCH_CAPACITY]: 'Checking Dispatch Capacity',
};

export const PROCUREMENT_SCREEN_COPY = {
  headerTitle: 'Procurement Status',
  heroTitle: 'Finding Best Supply Source',
  heroSubtitle: 'Our procurement engine is matching your order with verified suppliers.',
  progressHeading: 'Order Progress',
  engineChecksHeading: 'Engine Checks',
  blindMarketplaceTitle: 'Seller identity remains confidential.',
  blindMarketplaceMessage:
    'PetroTrade manages all procurement on your behalf to ensure neutral market pricing, verified inventory allocation and secure enterprise transactions.',
  continueTracking: 'Continue Tracking',
  supplierMatchingInProgress: 'In Progress...',
  inventoryAllocationPending: 'Scheduled after supplier matching',
  purchaseOrderPending: 'Scheduled after inventory allocation',
  estimatedTimePrefix: 'Estimated Time:',
  defaultEstimatedTime: '15 Minutes',
} as const;

const ENGINE_CHECK_SEQUENCE: EngineCheckId[] = [
  ENGINE_CHECK_IDS.LIVE_INVENTORY,
  ENGINE_CHECK_IDS.MARKET_PRICE,
  ENGINE_CHECK_IDS.DELIVERY_ROUTE,
  ENGINE_CHECK_IDS.STOCK_AVAILABILITY,
  ENGINE_CHECK_IDS.DISPATCH_CAPACITY,
];

export const createInitialEngineChecks = (): EngineCheck[] =>
  ENGINE_CHECK_SEQUENCE.map((id) => ({
    id,
    label: ENGINE_CHECK_LABELS[id],
    status: 'pending',
  }));

export const createInitialProcurementState = (paymentVerifiedAt: string): ProcurementState => {
  const orderForwardedAt = new Date(
    new Date(paymentVerifiedAt).getTime() + 3 * 60 * 1000,
  ).toISOString();

  return {
    status: 'matching',
    progress: PROCUREMENT_DEMO_PROGRESS_MILESTONES[0],
    estimatedTime: PROCUREMENT_SCREEN_COPY.defaultEstimatedTime,
    currentStep: ORDER_PROGRESS_STEP_IDS.SUPPLIER_MATCHING,
    engineChecks: createInitialEngineChecks(),
    timeline: {
      paymentVerifiedAt,
      orderForwardedAt,
    },
    updatedAt: new Date().toISOString(),
  };
};

export const getEstimatedTimeForProgress = (progress: number): string => {
  if (progress >= 100) {
    return 'Complete';
  }

  if (progress >= 80) {
    return '2 Minutes';
  }

  if (progress >= 61) {
    return '5 Minutes';
  }

  if (progress >= 42) {
    return '8 Minutes';
  }

  if (progress >= 25) {
    return '12 Minutes';
  }

  return PROCUREMENT_SCREEN_COPY.defaultEstimatedTime;
};
