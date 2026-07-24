/** Canonical order lifecycle statuses — single source of truth for all screens. */
export type OrderStatus =
  | 'ORDER_CREATED'
  | 'PROCUREMENT_STARTED'
  | 'SUPPLIER_MATCHING'
  | 'LOADING_SCHEDULED'
  | 'LOADING_COMPLETED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_VERIFIED'
  | 'DISPATCH_STARTED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

export type OrderTimelineStepStatus = 'completed' | 'current' | 'pending';

export type OrderTimelineStep = {
  id: OrderStatus;
  title: string;
  status: OrderTimelineStepStatus;
};
