import type { PaymentComparisonRow, PaymentMethod, PaymentMethodId } from '@/types/payment';

export const DEFAULT_PAYMENT_METHOD_ID: PaymentMethodId = 'advance';

export const ADVANCE_PAYMENT_DISCOUNT = 12500;

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'advance',
    title: 'Advance Payment',
    description: 'Pay before dispatch and get preferred pricing.',
    badge: { label: 'RECOMMENDED', variant: 'recommended' },
    discount: ADVANCE_PAYMENT_DISCOUNT,
    interestRate: 0,
    timing: 'Before dispatch',
    bestFor: 'Best pricing & priority allocation',
    hasCredit: false,
  },
  {
    id: 'on_loading',
    title: 'On Loading Payment',
    description: 'Pay after material loading confirmation. Loading status verification required.',
    discount: 0,
    interestRate: 0,
    timing: 'After loading confirmation',
    bestFor: 'Verified loading before payment',
    hasCredit: false,
  },
  {
    id: 'on_delivery',
    title: 'On Delivery Payment',
    description: 'Payment required after delivery confirmation.',
    badge: { label: 'Eligible', variant: 'eligible' },
    discount: 0,
    interestRate: 0,
    timing: 'After delivery confirmation',
    bestFor: 'Pay only when goods arrive',
    hasCredit: false,
  },
  {
    id: 'credit_15',
    title: 'Credit 15 Days',
    description: '',
    badge: { label: 'Credit Available', variant: 'credit' },
    discount: 0,
    interestRate: 1.5,
    creditLimit: 5000000,
    availableCredit: 3750000,
    timing: 'Net 15 days',
    bestFor: 'Short-term working capital',
    hasCredit: true,
  },
  {
    id: 'credit_30',
    title: 'Credit 30 Days',
    description: '',
    badge: { label: 'Premium Credit', variant: 'premium' },
    discount: 0,
    interestRate: 2.5,
    creditLimit: 5000000,
    availableCredit: 3750000,
    timing: 'Net 30 days',
    bestFor: 'Extended payment flexibility',
    hasCredit: true,
  },
];

export const PAYMENT_COMPARISON_ROWS: PaymentComparisonRow[] = PAYMENT_METHODS.map((method) => ({
  id: method.id,
  title: method.title,
  timing: method.timing,
  interest: method.interestRate > 0 ? `${method.interestRate}%` : 'None',
  credit: method.hasCredit
    ? `₹${(method.availableCredit ?? 0).toLocaleString('en-IN')}`
    : 'Not required',
  bestFor: method.bestFor,
}));

export const getPaymentMethodById = (id: PaymentMethodId): PaymentMethod =>
  PAYMENT_METHODS.find((method) => method.id === id) ?? PAYMENT_METHODS[0];

export const calculatePaymentAmounts = (
  baseAmount: number,
  methodId: PaymentMethodId,
): { discount: number; interest: number; interestRate: number; payableAmount: number } => {
  const method = getPaymentMethodById(methodId);
  const discount = method.discount > 0 ? Math.min(method.discount, baseAmount) : 0;
  const interestRate = method.interestRate;
  const interest = interestRate > 0 ? Math.round(baseAmount * (interestRate / 100)) : 0;
  const payableAmount = Math.max(0, baseAmount - discount + interest);

  return { discount, interest, interestRate, payableAmount };
};

export const formatPaymentCurrency = (amount: number): string =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;

export const formatDiscountLabel = (amount: number): string =>
  amount > 0 ? `−${formatPaymentCurrency(amount)}` : formatPaymentCurrency(0);

export const formatSavingsLabel = (amount: number): string =>
  `Save ${formatPaymentCurrency(amount)}`;
