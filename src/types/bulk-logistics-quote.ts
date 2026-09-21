export type BulkLogisticsQuoteStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'QUOTED'
  | 'CLOSED'
  | 'CANCELLED';

export type BulkLogisticsQuoteRequest = {
  id: string;
  requestNumber: string;
  status: BulkLogisticsQuoteStatus;
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  materialName: string;
  quantityMt: string;
  pickupLocation: string;
  deliveryLocation: string;
  preferredDate: string | null;
  message: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateBulkLogisticsQuoteInput = {
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  materialName: string;
  quantityMt: number;
  pickupLocation: string;
  deliveryLocation: string;
  preferredDate?: string;
  message?: string;
};
