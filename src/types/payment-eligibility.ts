export type CreditAccessState =
  | 'NOT_APPLIED'
  | 'APPLICATION_DRAFT'
  | 'APPLICATION_PENDING'
  | 'ACTION_REQUIRED'
  | 'APPROVED'
  | 'LIMIT_EXCEEDED'
  | 'SUSPENDED'
  | 'BLOCKED'
  | 'EXPIRED'
  | 'CLOSED'
  | 'REJECTED';

export type CreditCtaType =
  | 'REQUEST_CREDIT'
  | 'CONTINUE_APPLICATION'
  | 'VIEW_APPLICATION'
  | 'UPLOAD_DOCUMENTS'
  | 'CONTACT_SUPPORT';

export type CreditApplicationSummary = {
  id: string;
  applicationNumber: string;
  status: string;
  displayStatus: string;
  submittedAt: string | null;
  decidedAt: string | null;
  customerMessage: string | null;
  nextStep: string;
};

export type CreditAccountSummary = {
  approvedLimit: string;
  availableLimit: string;
  utilizedAmount: string;
  outstandingAmount: string;
  overdueAmount: string;
  currency: string;
  creditTermDays: number | null;
  approvedAt: string | null;
  expiresAt: string | null;
  reviewAt: string | null;
};

export type CreditLoadState = 'idle' | 'loading' | 'ready' | 'error';

export type ProductCreditConfig = {
  supported: boolean;
  tenureDays: number[];
};

export type CreditAccessView = {
  state: CreditAccessState;
  eligible: boolean;
  reason: string | null;
  canApply: boolean;
  title: string;
  message: string;
  cta: { type: CreditCtaType; label: string } | null;
  application: CreditApplicationSummary | null;
  account: CreditAccountSummary | null;
  tenureOptions: {
    paymentOption: string;
    tenureDays: number;
    label: string;
  }[];
  /** Independent of the customer: does this product/offer support credit. */
  productSupported?: boolean;
};

export const DEFAULT_PRODUCT_CREDIT: ProductCreditConfig = {
  supported: true,
  tenureDays: [15, 30],
};

export const GUEST_CREDIT_ACCESS: CreditAccessView = {
  state: 'NOT_APPLIED',
  eligible: false,
  reason: 'CREDIT_NOT_ELIGIBLE',
  canApply: true,
  title: 'Business Credit Available',
  message:
    'This grade supports Credit 15 Days and Credit 30 Days. Request credit to unlock Net terms after PolyStoreX review — you can still see the options before you apply.',
  cta: { type: 'REQUEST_CREDIT', label: 'Request Credit' },
  application: null,
  account: null,
  tenureOptions: [],
  productSupported: true,
};

export const CREDIT_LOAD_ERROR: CreditAccessView = {
  state: 'NOT_APPLIED',
  eligible: false,
  reason: 'CREDIT_STATUS_UNAVAILABLE',
  canApply: false,
  title: 'Unable to load credit options',
  message:
    'We could not verify business credit for this order. Other payment methods remain available. Retry to check credit eligibility.',
  cta: null,
  application: null,
  account: null,
  tenureOptions: [],
  productSupported: true,
};

export function shouldRenderCreditInfo(credit: CreditAccessView | null | undefined): boolean {
  if (!credit) return false;
  if (credit.productSupported === false) return false;
  return Boolean(credit.title?.trim() || credit.message?.trim() || credit.cta);
}

export function guestCreditAccess(productCredit?: ProductCreditConfig | null): CreditAccessView {
  const supported =
    productCredit?.supported !== false &&
    (productCredit?.tenureDays == null || productCredit.tenureDays.length > 0);
  if (!supported) {
    return {
      ...GUEST_CREDIT_ACCESS,
      productSupported: false,
      canApply: false,
      title: '',
      message: '',
      cta: null,
      reason: 'PRODUCT_CREDIT_UNAVAILABLE',
    };
  }
  return { ...GUEST_CREDIT_ACCESS, productSupported: true };
}
