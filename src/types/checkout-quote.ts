export type PlatformPaymentOptionCode =
  | 'ADVANCE'
  | 'ON_LOADING'
  | 'ON_DELIVERY'
  | 'CREDIT'
  | 'CREDIT_15'
  | 'CREDIT_30';

export type CheckoutQuote = {
  quoteId: string;
  productId: string;
  offerId: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  baseAmount: string;
  discountAmount: string;
  freightAmount: string;
  taxAmount: string;
  taxRate: string;
  platformFee: string;
  insuranceAmount: string;
  insuranceIncluded: boolean;
  totalAmount: string;
  currency: string;
  paymentOption: PlatformPaymentOptionCode;
  paymentLabel: string;
  expiresAt: string;
  pricingVersion: string;
  matchStrategy: string;
  moq: string | null;
  quantityAvailable: string;
  quantityIncrement: string;
  leadTime: string | null;
  product: { id: string; code: string; name: string; packaging: string | null };
  grade: { id: string; code: string; name: string; displayName: string } | null;
  shippingAddressId: string | null;
  billingAddressId: string | null;
};

export type CheckoutAddress = {
  id: string;
  type: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  landmark: string | null;
  isDefault: boolean;
};

export type CheckoutPaymentOption = {
  paymentOption: PlatformPaymentOptionCode;
  title: string;
  description: string;
  benefitLabel?: string;
  eligible: boolean;
  discountBps: number;
};

export type PlacePurchaseRequestResult = {
  id: string;
  referenceNumber: string;
  status: string;
  paymentMethod: string | null;
  targetPrice: string | number | null;
  currency: string;
  responseDeadline: string | null;
  remainingSeconds: number | null;
  commercial?: {
    totalAmount?: string;
    quantity?: string;
    unit?: string;
    paymentOption?: string;
  } | null;
  items?: Array<{
    quantity?: string | number;
    unit?: string;
    product?: { name?: string } | null;
    grade?: { displayName?: string; name?: string; code?: string } | null;
  }>;
};
