export type ProcurementStatusValue = 'pending' | 'matching' | 'checking' | 'completed';

export type EngineCheckStatus = 'pending' | 'checking' | 'done';

export type EngineCheckId =
  'live_inventory' | 'market_price' | 'delivery_route' | 'stock_availability' | 'dispatch_capacity';

export type EngineCheck = {
  id: EngineCheckId;
  label: string;
  status: EngineCheckStatus;
};

export type OrderProgressStepId =
  | 'payment_verified'
  | 'order_forwarded'
  | 'supplier_matching'
  | 'inventory_allocation'
  | 'purchase_order_generation';

export type OrderProgressStepStatus = 'completed' | 'current' | 'pending';

export type OrderProgressStep = {
  id: OrderProgressStepId;
  title: string;
  subtitle?: string;
  status: OrderProgressStepStatus;
};

export type ProcurementTimelineTimestamps = {
  paymentVerifiedAt: string;
  orderForwardedAt: string;
};

export type ProcurementState = {
  status: ProcurementStatusValue;
  progress: number;
  estimatedTime: string;
  currentStep: OrderProgressStepId;
  engineChecks: EngineCheck[];
  timeline: ProcurementTimelineTimestamps;
  updatedAt: string;
  completedAt?: string;
};
