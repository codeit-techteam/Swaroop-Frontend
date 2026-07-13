import type {
  ConfirmationStatus,
  OrderLifecycleStatus,
  PriceLockStatus,
  SupplierConfirmationStatus,
  ValidationTimelineState,
} from '@/types/orderConfirmation';
import type { PaymentMethodId } from '@/types/payment';
import type { ProcurementState } from '@/types/procurement';
import type {
  DispatchStatus,
  OrderDocument,
  WorkflowTimelineState,
} from '@/types/purchaseOrder';
import type {
  LoadingProofState,
  LoadingScheduleDetails,
  LoadingStatus,
} from '@/types/loading';
import type { DispatchTrackingTimelineState, TrackingTimelineState } from '@/types/tracking';

export type ProductCategory = 'PP' | 'PVC' | 'HDPE' | 'LLDPE' | 'PET';

export type OrderDisplayStatus = 'processing' | 'in_transit' | 'delivered' | 'cancelled';

export type OrderShipmentStage = 'placed' | 'dispatched' | 'transit' | 'delivered';

export type OrderTabCategory = 'active' | 'completed' | 'cancelled';

export type DispatchShipmentDetails = {
  vehicleNumber: string;
  driverName: string;
  driverContactMasked: string;
  dispatchTime: string;
  currentLocation: string;
  transportPartner: string;
};

export type PaymentMode = 'RTGS' | 'NEFT' | 'IMPS' | 'UPI';

export type OrderPaymentStatus = 'pending' | 'submitted' | 'verified' | 'failed';

export type OrderVerificationStatus = 'none' | 'pending' | 'verified' | 'rejected' | 'needs_review';

export type PaymentProofStatus = 'submitted';

export type PaymentProofReceipt = {
  name: string;
  uri: string;
  size: number;
  mimeType?: string | null;
};

export type PaymentProof = {
  orderId: string;
  transactionId: string;
  amount: number;
  bank: string;
  paymentMode: PaymentMode;
  transactionDate: string;
  submittedAt: string;
  utr: string;
  receipt: PaymentProofReceipt;
  status: PaymentProofStatus;
};

export type Order = {
  id: string;
  productName: string;
  grade: string;
  productCategory: ProductCategory;
  quantityMt: number;
  warehouse: string;
  destination: string;
  eta: string | null;
  progress: number;
  shipmentStatus: OrderDisplayStatus;
  insuranceCovered: boolean;
  isMasterShipment: boolean;
  documents: OrderDocument[];
  amount: number;
  paymentMethod: string;
  paymentMethodId: PaymentMethodId;
  paymentStatus: OrderPaymentStatus;
  verificationStatus: OrderVerificationStatus;
  procurement: ProcurementState | null;
  paymentVerifiedAt: string | null;
  orderStatus: OrderLifecycleStatus;
  priceLockStatus: PriceLockStatus;
  priceLockStartedAt: string | null;
  priceLockDurationSeconds: number;
  validationTimeline: ValidationTimelineState | null;
  confirmationStatus: ConfirmationStatus;
  supplierConfirmation: SupplierConfirmationStatus;
  inventoryReserved: boolean;
  poNumber: string | null;
  poGenerated: boolean;
  procurementCompleted: boolean;
  dispatchStatus: DispatchStatus | null;
  documentsReady: boolean;
  workflowTimeline: WorkflowTimelineState | null;
  dispatchReadiness: string | null;
  transitWindow: string | null;
  trackingTimeline?: TrackingTimelineState | null;
  dispatchTrackingTimeline?: DispatchTrackingTimelineState | null;
  trackingAvailable?: boolean;
  dispatchProgress?: number;
  dispatchStartedAt?: string | null;
  shipmentDetails?: DispatchShipmentDetails | null;
  loadingStatus?: LoadingStatus;
  loadingSchedule?: LoadingScheduleDetails | null;
  loadingProof?: LoadingProofState | null;
  createdAt: string;
};
