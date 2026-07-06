import type { PaymentMethodId } from '@/types/payment';

export type PaymentMode = 'RTGS' | 'NEFT' | 'IMPS' | 'UPI';

export type OrderPaymentStatus = 'pending' | 'submitted' | 'verified' | 'failed';

export type OrderVerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';

export type PaymentProofStatus = 'submitted';

export type PaymentProofReceipt = {
  name: string;
  uri: string;
  size: number;
  mimeType?: string | null;
};

export type PaymentProof = {
  orderId: string;
  amount: number;
  bank: string;
  paymentMode: PaymentMode;
  transactionDate: string;
  utr: string;
  receipt: PaymentProofReceipt;
  submittedAt: string;
  status: PaymentProofStatus;
};

export type Order = {
  id: string;
  productName: string;
  quantityMt: number;
  warehouse: string;
  amount: number;
  paymentMethod: string;
  paymentMethodId: PaymentMethodId;
  paymentStatus: OrderPaymentStatus;
  verificationStatus: OrderVerificationStatus;
  createdAt: string;
};
