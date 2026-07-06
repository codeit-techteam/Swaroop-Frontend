import type { Order } from '@/types/order';
import type {
  DispatchStatus,
  WorkflowStepId,
  WorkflowTimelineState,
  WorkflowTimelineStep,
} from '@/types/purchaseOrder';
import type { ProcurementState } from '@/types/procurement';

/** When true, simulates workflow timeline progression and auto-navigates to dispatch planning. */
export const PURCHASE_ORDER_DEMO_MODE = __DEV__;

export const PURCHASE_ORDER_DEMO_STEP_MIN_DELAY_MS = 4000;

export const PURCHASE_ORDER_DEMO_STEP_MAX_DELAY_MS = 6000;

export const DEFAULT_DISPATCH_READINESS = 'Within 2 Days';

export const DEFAULT_TRANSIT_WINDOW = '3–5 Days ETA';

export const WORKFLOW_STEP_IDS = {
  PAYMENT_VERIFIED: 'payment_verified',
  PROCUREMENT_APPROVED: 'procurement_approved',
  PURCHASE_ORDER_GENERATED: 'purchase_order_generated',
  DISPATCH_PLANNING: 'dispatch_planning',
  VEHICLE_ALLOCATION: 'vehicle_allocation',
  DRIVER_ASSIGNED: 'driver_assigned',
  SHIPMENT_READY: 'shipment_ready',
  SHIPMENT_STARTED: 'shipment_started',
  DELIVERED: 'delivered',
} as const satisfies Record<string, WorkflowStepId>;

export const WORKFLOW_STEP_SEQUENCE: WorkflowStepId[] = [
  WORKFLOW_STEP_IDS.PAYMENT_VERIFIED,
  WORKFLOW_STEP_IDS.PROCUREMENT_APPROVED,
  WORKFLOW_STEP_IDS.PURCHASE_ORDER_GENERATED,
  WORKFLOW_STEP_IDS.DISPATCH_PLANNING,
  WORKFLOW_STEP_IDS.VEHICLE_ALLOCATION,
  WORKFLOW_STEP_IDS.DRIVER_ASSIGNED,
  WORKFLOW_STEP_IDS.SHIPMENT_READY,
  WORKFLOW_STEP_IDS.SHIPMENT_STARTED,
  WORKFLOW_STEP_IDS.DELIVERED,
];

export const WORKFLOW_DEMO_SEQUENCE: WorkflowStepId[] = [
  WORKFLOW_STEP_IDS.DISPATCH_PLANNING,
  WORKFLOW_STEP_IDS.VEHICLE_ALLOCATION,
  WORKFLOW_STEP_IDS.DRIVER_ASSIGNED,
  WORKFLOW_STEP_IDS.SHIPMENT_READY,
];

type WorkflowStepDefinition = {
  title: string;
  getSubtitle: () => string | undefined;
};

export const WORKFLOW_STEP_DEFINITIONS: Record<WorkflowStepId, WorkflowStepDefinition> = {
  [WORKFLOW_STEP_IDS.PAYMENT_VERIFIED]: {
    title: 'Payment Verified',
    getSubtitle: () => 'Escrow confirmed receipt of funds',
  },
  [WORKFLOW_STEP_IDS.PROCUREMENT_APPROVED]: {
    title: 'Procurement Approved',
    getSubtitle: () => 'Vendor capacity verified digitally',
  },
  [WORKFLOW_STEP_IDS.PURCHASE_ORDER_GENERATED]: {
    title: 'Purchase Order Generated',
    getSubtitle: () => 'Legally binding document issued',
  },
  [WORKFLOW_STEP_IDS.DISPATCH_PLANNING]: {
    title: 'Dispatch Planning',
    getSubtitle: () => 'Coordinating with regional logistics partners',
  },
  [WORKFLOW_STEP_IDS.VEHICLE_ALLOCATION]: {
    title: 'Vehicle Allocation',
    getSubtitle: () => 'Transporter assignment pending',
  },
  [WORKFLOW_STEP_IDS.DRIVER_ASSIGNED]: {
    title: 'Driver Assigned',
    getSubtitle: () => 'Driver credentials verified',
  },
  [WORKFLOW_STEP_IDS.SHIPMENT_READY]: {
    title: 'Shipment Ready',
    getSubtitle: () => 'Goods staged for dispatch',
  },
  [WORKFLOW_STEP_IDS.SHIPMENT_STARTED]: {
    title: 'Shipment Started',
    getSubtitle: () => 'Goods in transit to destination',
  },
  [WORKFLOW_STEP_IDS.DELIVERED]: {
    title: 'Delivered',
    getSubtitle: () => 'Delivery confirmation pending',
  },
};

export const PURCHASE_ORDER_COPY = {
  headerTitle: 'Purchase Order',
  successTitle: 'Purchase Order Generated',
  successSubtitle: 'Your order has been successfully confirmed.',
  confirmedBadge: 'CONFIRMED',
  poIdentificationLabel: 'PO IDENTIFICATION',
  referenceOrderLabel: 'Reference Order',
  statusConfirmed: 'Confirmed',
  transactionScopeHeading: 'Transaction Scope',
  materialLabel: 'MATERIAL SPECIFICATION',
  netWeightLabel: 'NET WEIGHT',
  originFacilityLabel: 'ORIGIN FACILITY',
  dispatchReadinessLabel: 'DISPATCH READINESS',
  transitWindowLabel: 'TRANSIT WINDOW',
  workflowHeading: 'Workflow Verification',
  documentsHeading: 'Regulatory Documentation',
  blindMarketplaceMessage:
    'PetroTrade will now coordinate logistics with the selected verified supplier. Supplier identity remains confidential to maintain market neutrality and secure bilateral trade terms.',
  trackShipment: 'Track Shipment',
  goToOrders: 'Go to Orders',
  documentToastTitle: 'Document Unavailable',
  documentToastMessage: 'Document will be available after backend integration.',
} as const;

export const ORDER_DOCUMENTS = [
  { id: 'purchase_order_pdf' as const, label: 'Purchase Order PDF' },
  { id: 'proforma_invoice' as const, label: 'Proforma Invoice' },
  { id: 'tax_invoice' as const, label: 'Tax Invoice' },
] as const;

export const getRandomPurchaseOrderDemoDelay = (): number => {
  const range =
    PURCHASE_ORDER_DEMO_STEP_MAX_DELAY_MS - PURCHASE_ORDER_DEMO_STEP_MIN_DELAY_MS;
  return PURCHASE_ORDER_DEMO_STEP_MIN_DELAY_MS + Math.floor(Math.random() * range);
};

export const generatePoNumber = (orderId: string): string => {
  const suffix = orderId.replace(/^PT-ORD-/, '');
  return `PT-PO-2026-${suffix}`;
};

export const deriveDispatchReadiness = (procurement: ProcurementState | null): string => {
  if (!procurement) {
    return DEFAULT_DISPATCH_READINESS;
  }

  if (procurement.status === 'completed') {
    return DEFAULT_DISPATCH_READINESS;
  }

  return procurement.estimatedTime
    ? `Within ${procurement.estimatedTime}`
    : DEFAULT_DISPATCH_READINESS;
};

export const deriveTransitWindow = (procurement: ProcurementState | null): string => {
  if (!procurement || procurement.progress < 42) {
    return DEFAULT_TRANSIT_WINDOW;
  }

  if (procurement.progress >= 80) {
    return '2–4 Days ETA';
  }

  return DEFAULT_TRANSIT_WINDOW;
};

export const createInitialWorkflowTimeline = (): WorkflowTimelineState => ({
  currentStep: WORKFLOW_STEP_IDS.DISPATCH_PLANNING,
  completedSteps: [
    WORKFLOW_STEP_IDS.PAYMENT_VERIFIED,
    WORKFLOW_STEP_IDS.PROCUREMENT_APPROVED,
    WORKFLOW_STEP_IDS.PURCHASE_ORDER_GENERATED,
  ],
});

export const mapWorkflowStepToDispatchStatus = (stepId: WorkflowStepId): DispatchStatus => {
  switch (stepId) {
    case WORKFLOW_STEP_IDS.DISPATCH_PLANNING:
      return 'planning';
    case WORKFLOW_STEP_IDS.VEHICLE_ALLOCATION:
      return 'vehicle_allocation';
    case WORKFLOW_STEP_IDS.DRIVER_ASSIGNED:
      return 'driver_assigned';
    case WORKFLOW_STEP_IDS.SHIPMENT_READY:
      return 'shipment_ready';
    case WORKFLOW_STEP_IDS.SHIPMENT_STARTED:
      return 'shipment_started';
    case WORKFLOW_STEP_IDS.DELIVERED:
      return 'delivered';
    default:
      return 'planning';
  }
};

export const buildWorkflowTimelineSteps = (
  timeline: WorkflowTimelineState | null,
): WorkflowTimelineStep[] => {
  const completedSteps = new Set(timeline?.completedSteps ?? []);
  const currentStep = timeline?.currentStep ?? WORKFLOW_STEP_IDS.DISPATCH_PLANNING;

  return WORKFLOW_STEP_SEQUENCE.map((stepId) => {
    const definition = WORKFLOW_STEP_DEFINITIONS[stepId];
    let status: WorkflowTimelineStep['status'] = 'pending';

    if (completedSteps.has(stepId)) {
      status = 'completed';
    } else if (stepId === currentStep) {
      status = 'current';
    }

    return {
      id: stepId,
      title: definition.title,
      subtitle: definition.getSubtitle(),
      status,
    };
  });
};

export const isWorkflowDemoComplete = (timeline: WorkflowTimelineState | null): boolean => {
  if (!timeline) {
    return false;
  }

  return timeline.completedSteps.includes(WORKFLOW_STEP_IDS.SHIPMENT_READY);
};

export const createPurchaseOrderPatch = (order: Order): Partial<Order> => ({
  orderStatus: 'purchase_order_generated',
  poNumber: order.poNumber ?? generatePoNumber(order.id),
  poGenerated: true,
  procurementCompleted: true,
  inventoryReserved: true,
  supplierConfirmation: 'confirmed',
  confirmationStatus: 'confirmed',
  dispatchStatus: order.dispatchStatus ?? 'planning',
  documentsReady: true,
  workflowTimeline: order.workflowTimeline ?? createInitialWorkflowTimeline(),
  dispatchReadiness: order.dispatchReadiness ?? deriveDispatchReadiness(order.procurement),
  transitWindow: order.transitWindow ?? deriveTransitWindow(order.procurement),
});
