export type DispatchStage =
  | 'ready_to_dispatch'
  | 'invoice_generated'
  | 'vehicle_assigned'
  | 'loading'
  | 'dispatch_ready'
  | 'dispatched'
  | 'in_transit'
  | 'delivered'
  | 'delayed';

export type DispatchStageFilter = 'All' | 'Ready' | 'Loading' | 'Dispatched' | 'Delivered';

export type DispatchVehicleStatus = 'assigned' | 'assigning' | 'not_assigned';

export type DispatchPaymentStatus = 'verified' | 'pending';

export type DispatchChecklistState = 'done' | 'pending' | 'required';

export type DispatchDocumentState = 'ready' | 'pending';

export type DispatchDocumentType =
  | 'invoice'
  | 'quality_certificate'
  | 'loading_slip'
  | 'eway_bill'
  | 'dispatch_note';

export type DispatchChecklistKey =
  | 'payment_verified'
  | 'invoice_generated'
  | 'eway_bill_ready'
  | 'vehicle_assigned'
  | 'loading_completed'
  | 'quality_check'
  | 'dispatch_approved';

export type DispatchSummary = {
  readyToDispatch: number;
  inTransit: number;
  delivered: number;
  delayed: number;
};

export type DispatchOrder = {
  id: string;
  /** Blind buyer label only — never company legal name. */
  buyerLabel: string;
  material: string;
  quantityMt: number;
  eta: string;
  orderDateTime: string;
  amount: number;
  gstAmount: number;
  destination: string;
  loadingPoint: string;
  vehicleNumber: string | null;
  vehicleType: string | null;
  driverName: string | null;
  driverPhone: string | null;
  driverId: string | null;
  vehicleId: string | null;
  vehicleCapacity: string | null;
  paymentStatus: DispatchPaymentStatus;
  vehicleStatus: DispatchVehicleStatus;
  stage: DispatchStage;
  progress: number;
  invoiceNumber: string | null;
  invoiceGeneratedAt: string | null;
  loadingCompletedAt: string | null;
  dispatchReadyAt: string | null;
  dispatchStartedAt: string | null;
  deliveredAt: string | null;
  qualityApproved: boolean;
  eWayBillReady: boolean;
  dispatchApproved: boolean;
  loadingProofAvailable: boolean;
  delayed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DispatchDocument = {
  id: string;
  orderId: string;
  type: DispatchDocumentType;
  name: string;
  size: string;
  uploadedAt: string;
  status: DispatchDocumentState;
};

export type DispatchChecklistItem = {
  key: DispatchChecklistKey;
  label: string;
  state: DispatchChecklistState;
};

export type DispatchHistoryEntry = {
  id: string;
  orderId: string;
  title: string;
  subtitle: string;
  timestamp: string;
};

export type DispatchVehicle = {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  capacity: string;
  currentStatus: 'Available' | 'Loading' | 'In Transit';
  driverIds: string[];
};

export type DispatchDriver = {
  id: string;
  name: string;
  phone: string;
};

export type DispatchSnapshot = {
  dispatchOrders: DispatchOrder[];
  selectedDispatchId: string | null;
  summary: DispatchSummary;
  assignedVehicle: Record<string, DispatchVehicle | null>;
  documents: Record<string, DispatchDocument[]>;
  dispatchChecklist: Record<string, DispatchChecklistItem[]>;
  dispatchHistory: Record<string, DispatchHistoryEntry[]>;
  vehicles: DispatchVehicle[];
  drivers: DispatchDriver[];
};

export type DispatchStoreState = DispatchSnapshot & {
  isHydrated: boolean;
};

export type DispatchStoreActions = {
  hydrateDispatchState: () => void;
  refreshDispatchState: () => void;
  /** Prefer API hydrate; falls back to local mock/persisted snapshot. */
  hydrateFromApi: () => Promise<void>;
  refreshFromApi: () => Promise<void>;
  selectDispatch: (orderId: string | null) => void;
  assignVehicle: (orderId: string, vehicleId: string, driverId: string) => DispatchOrder | null;
  generateInvoice: (orderId: string) => DispatchOrder | null;
  completeLoading: (orderId: string) => DispatchOrder | null;
  markDispatched: (orderId: string) => DispatchOrder | null;
  markDelivered: (orderId: string) => DispatchOrder | null;
  getDocuments: (orderId: string) => DispatchDocument[];
  downloadDocument: (orderId: string, documentId: string) => DispatchDocument | null;
};

export type DispatchStore = DispatchStoreState & DispatchStoreActions;
