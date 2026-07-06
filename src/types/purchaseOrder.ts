export type DispatchStatus =
  | 'planning'
  | 'vehicle_allocation'
  | 'driver_assigned'
  | 'shipment_ready'
  | 'shipment_started'
  | 'delivered';

export type WorkflowStepId =
  | 'payment_verified'
  | 'procurement_approved'
  | 'purchase_order_generated'
  | 'dispatch_planning'
  | 'vehicle_allocation'
  | 'driver_assigned'
  | 'shipment_ready'
  | 'shipment_started'
  | 'delivered';

export type WorkflowStepStatus = 'completed' | 'current' | 'pending';

export type WorkflowTimelineState = {
  currentStep: WorkflowStepId;
  completedSteps: WorkflowStepId[];
};

export type WorkflowTimelineStep = {
  id: WorkflowStepId;
  title: string;
  subtitle?: string;
  status: WorkflowStepStatus;
};

export type OrderDocumentId = 'purchase_order_pdf' | 'proforma_invoice' | 'tax_invoice';

export type OrderDocument = {
  id: OrderDocumentId;
  label: string;
};

export type PurchaseOrderState = {
  poNumber: string;
  poGenerated: boolean;
  procurementCompleted: boolean;
  dispatchStatus: DispatchStatus;
  documentsReady: boolean;
  workflowTimeline: WorkflowTimelineState;
  dispatchReadiness: string;
  transitWindow: string;
};
