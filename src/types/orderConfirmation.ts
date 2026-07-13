export type OrderLifecycleStatus =
  | 'draft'
  | 'order_created'
  | 'awaiting_confirmation'
  | 'confirmed'
  | 'purchase_order_generated'
  | 'dispatch_started';

export type PriceLockStatus = 'active' | 'expired';

export type ConfirmationStatus = 'pending_petrotrade' | 'confirmed';

export type SupplierConfirmationStatus = 'pending' | 'confirmed';

export type ValidationStepId =
  | 'order_received'
  | 'payment_verified'
  | 'procurement_matching'
  | 'price_reconfirmation'
  | 'inventory_allocation'
  | 'seller_acceptance'
  | 'purchase_order_generation';

export type ValidationStepStatus = 'completed' | 'current' | 'pending';

export type ValidationTimelineState = {
  currentStep: ValidationStepId;
  completedSteps: ValidationStepId[];
};

export type ValidationTimelineStep = {
  id: ValidationStepId;
  title: string;
  subtitle?: string;
  status: ValidationStepStatus;
};

export type OrderConfirmationState = {
  orderStatus: OrderLifecycleStatus;
  priceLockStatus: PriceLockStatus;
  priceLockStartedAt: string | null;
  priceLockDurationSeconds: number;
  validationTimeline: ValidationTimelineState;
  confirmationStatus: ConfirmationStatus;
  supplierConfirmation: SupplierConfirmationStatus;
  inventoryReserved: boolean;
};
