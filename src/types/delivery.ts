export type DeliveryStatus = 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered';

export type DeliveryProofItemId =
  | 'delivery_photo'
  | 'truck_arrival'
  | 'receiver_signature'
  | 'unload_confirmation';

export type DeliveryProofItem = {
  id: DeliveryProofItemId;
  label: string;
};

export type DeliveryProofState = {
  items: DeliveryProofItem[];
};

export type DeliveryReceiverDetails = {
  receiverName: string;
  receiverMobileMasked: string;
  companyName: string;
  deliveryAddress: string;
  signatureStatus: 'signed' | 'pending';
};

export type DigitalPodState = {
  podId: string;
  otpVerified: boolean;
  deliveryTimestamp: string;
  verificationStatus: 'verified' | 'pending';
};

export type DeliverySummary = {
  product: string;
  quantityMt: number;
  grossWeightMt: number;
  netWeightMt: number;
  deliveryCondition: string;
  damageReported: boolean;
};

export type DeliveryDetails = {
  deliveryDate: string;
  deliveryTime: string;
  deliveryStatus: DeliveryStatus;
};

export type DeliveryTimelineStepId =
  | 'order_submitted'
  | 'procurement'
  | 'loading'
  | 'dispatch'
  | 'in_transit'
  | 'delivered'
  | 'payment_pending'
  | 'payment_verified'
  | 'completed';

export type DeliveryTimelineStepStatus = 'completed' | 'current' | 'pending';

export type DeliveryTimelineStep = {
  id: DeliveryTimelineStepId;
  title: string;
  status: DeliveryTimelineStepStatus;
  statusLabel?: string;
};
