import type { PaymentComparisonOption, PaymentMethodId } from '@/types/payment';

export const PAYMENT_MATRIX_INFO =
  'This comparison helps buyers select the most suitable payment method based on payment timing, discount, interest rate and eligibility.';

export const PAYMENT_COMPARISON_DISCLAIMER =
  'By selecting a payment method, you agree to the PetroTrade Industrial Service Terms and Credit Agreement protocols.';

export const PAYMENT_COMPARISON_OPTIONS: PaymentComparisonOption[] = [
  {
    id: 'advance',
    title: 'Advance Payment',
    subtitle: 'Low Risk',
    discount: '0.5%',
    timeline: 'Before Dispatch',
    interest: '0%',
    eligibility: 'All Users',
    recommended: true,
    description: 'Pay before dispatch and unlock preferred pricing with the lowest financial risk.',
    benefits: [
      'Lowest financial risk',
      'Preferred pricing',
      'Instant order processing',
      'No interest',
    ],
    risk: 'Low Risk',
  },
  {
    id: 'on_loading',
    title: 'On Loading',
    subtitle: 'Low Risk',
    discount: '0%',
    timeline: 'At Loading',
    interest: '0%',
    eligibility: 'Verified',
    recommended: false,
    description: 'Pay after material loading confirmation with verified loading status.',
    benefits: [
      'Low financial risk',
      'Verified loading before payment',
      'No interest charges',
      'Suitable for verified buyers',
    ],
    risk: 'Low Risk',
  },
  {
    id: 'on_delivery',
    title: 'On Delivery',
    subtitle: 'Medium Risk',
    discount: '0%',
    timeline: 'At Delivery',
    interest: '0%',
    eligibility: 'Tier 1',
    recommended: false,
    description: 'Pay only after delivery confirmation for Tier 1 eligible buyers.',
    benefits: [
      'Pay when goods arrive',
      'No interest charges',
      'Medium operational risk',
      'Tier 1 eligibility required',
    ],
    risk: 'Medium Risk',
  },
  {
    id: 'credit_15',
    title: 'Credit 15 Days',
    subtitle: 'Uses Limit',
    discount: '0%',
    timeline: 'Day 15',
    interest: '1.5%',
    eligibility: 'Approved',
    recommended: false,
    description: 'Short-term credit that uses your available limit with modest interest.',
    benefits: [
      'Better short-term cash flow',
      'Uses approved credit limit',
      '1.5% interest applies',
      'Approved buyers only',
    ],
    risk: 'Uses Limit',
  },
  {
    id: 'credit_30',
    title: 'Credit 30 Days',
    subtitle: 'Uses Limit',
    discount: '0%',
    timeline: 'Day 30',
    interest: '2.5%',
    eligibility: 'Premium',
    recommended: false,
    description: 'Extended credit terms for premium customers with higher interest.',
    benefits: [
      'Better cash flow',
      'Higher interest',
      'Premium customers only',
      'Uses available credit limit',
    ],
    risk: 'Uses Limit',
  },
];

export const getPaymentComparisonOptionById = (
  id: PaymentMethodId,
): PaymentComparisonOption =>
  PAYMENT_COMPARISON_OPTIONS.find((option) => option.id === id) ?? PAYMENT_COMPARISON_OPTIONS[0];
