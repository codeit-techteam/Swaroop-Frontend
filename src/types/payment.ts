export type PaymentMethodId = 'advance' | 'on_loading' | 'on_delivery' | 'credit_15' | 'credit_30';

export type PaymentBadgeVariant = 'recommended' | 'eligible' | 'credit' | 'premium';

export type PaymentMethod = {
  id: PaymentMethodId;
  title: string;
  description: string;
  badge?: {
    label: string;
    variant: PaymentBadgeVariant;
  };
  /** Flat discount in ₹ (Advance). */
  discount: number;
  /** Interest rate as percent, e.g. 1.5 */
  interestRate: number;
  creditLimit?: number;
  availableCredit?: number;
  timing: string;
  bestFor: string;
  hasCredit: boolean;
};

export type PaymentCalculation = {
  methodId: PaymentMethodId;
  methodTitle: string;
  baseAmount: number;
  discount: number;
  interest: number;
  interestRate: number;
  payableAmount: number;
};

export type PaymentComparisonRow = {
  id: PaymentMethodId;
  title: string;
  timing: string;
  interest: string;
  credit: string;
  bestFor: string;
};

export type PaymentComparisonOption = {
  id: PaymentMethodId;
  title: string;
  subtitle: string;
  discount: string;
  timeline: string;
  interest: string;
  eligibility: string;
  recommended: boolean;
  description: string;
  benefits: string[];
  risk: string;
};
