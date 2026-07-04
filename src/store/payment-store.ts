import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants';
import {
  calculatePaymentAmounts,
  DEFAULT_PAYMENT_METHOD_ID,
  getPaymentMethodById,
} from '@/constants/payment';
import type { PaymentCalculation, PaymentMethodId } from '@/types/payment';
import { getStorageItem, setStorageItem } from '@/utils/storage';

type PersistedPayment = {
  selectedMethodId: PaymentMethodId;
};

type PaymentState = {
  selectedMethodId: PaymentMethodId;
  baseAmount: number;
  discount: number;
  interest: number;
  interestRate: number;
  payableAmount: number;
  isHydrated: boolean;
};

type PaymentActions = {
  hydratePayment: () => void;
  setBaseAmount: (baseAmount: number) => void;
  selectPayment: (methodId: PaymentMethodId) => void;
  calculatePayable: () => PaymentCalculation;
  resetPayment: () => void;
  getCalculation: () => PaymentCalculation;
};

export type PaymentStore = PaymentState & PaymentActions;

const persistSelection = (selectedMethodId: PaymentMethodId): void => {
  const payload: PersistedPayment = { selectedMethodId };
  setStorageItem(STORAGE_KEYS.PAYMENT_KEY, JSON.stringify(payload));
};

const readPersistedSelection = (): PaymentMethodId => {
  const raw = getStorageItem(STORAGE_KEYS.PAYMENT_KEY);
  if (!raw) {
    return DEFAULT_PAYMENT_METHOD_ID;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedPayment;
    const method = getPaymentMethodById(parsed.selectedMethodId);
    return method.id;
  } catch {
    return DEFAULT_PAYMENT_METHOD_ID;
  }
};

const applyMethod = (
  baseAmount: number,
  methodId: PaymentMethodId,
): Pick<
  PaymentState,
  'selectedMethodId' | 'discount' | 'interest' | 'interestRate' | 'payableAmount'
> => {
  const amounts = calculatePaymentAmounts(baseAmount, methodId);
  return {
    selectedMethodId: methodId,
    discount: amounts.discount,
    interest: amounts.interest,
    interestRate: amounts.interestRate,
    payableAmount: amounts.payableAmount,
  };
};

const initialMethod = DEFAULT_PAYMENT_METHOD_ID;
const initialAmounts = calculatePaymentAmounts(0, initialMethod);

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  selectedMethodId: initialMethod,
  baseAmount: 0,
  discount: initialAmounts.discount,
  interest: initialAmounts.interest,
  interestRate: initialAmounts.interestRate,
  payableAmount: initialAmounts.payableAmount,
  isHydrated: false,

  hydratePayment: () => {
    const selectedMethodId = readPersistedSelection();
    const { baseAmount } = get();
    set({
      ...applyMethod(baseAmount, selectedMethodId),
      isHydrated: true,
    });
  },

  setBaseAmount: (baseAmount) => {
    const { selectedMethodId } = get();
    set({
      baseAmount,
      ...applyMethod(baseAmount, selectedMethodId),
    });
  },

  selectPayment: (methodId) => {
    const { baseAmount } = get();
    const next = applyMethod(baseAmount, methodId);
    persistSelection(methodId);
    set(next);
  },

  calculatePayable: () => {
    const { baseAmount, selectedMethodId } = get();
    const amounts = calculatePaymentAmounts(baseAmount, selectedMethodId);
    const method = getPaymentMethodById(selectedMethodId);
    set({
      discount: amounts.discount,
      interest: amounts.interest,
      interestRate: amounts.interestRate,
      payableAmount: amounts.payableAmount,
    });
    return {
      methodId: selectedMethodId,
      methodTitle: method.title,
      baseAmount,
      ...amounts,
    };
  },

  resetPayment: () => {
    const amounts = calculatePaymentAmounts(0, DEFAULT_PAYMENT_METHOD_ID);
    persistSelection(DEFAULT_PAYMENT_METHOD_ID);
    set({
      selectedMethodId: DEFAULT_PAYMENT_METHOD_ID,
      baseAmount: 0,
      discount: amounts.discount,
      interest: amounts.interest,
      interestRate: amounts.interestRate,
      payableAmount: amounts.payableAmount,
    });
  },

  getCalculation: (): PaymentCalculation => {
    const { selectedMethodId, baseAmount, discount, interest, interestRate, payableAmount } = get();
    const method = getPaymentMethodById(selectedMethodId);
    return {
      methodId: selectedMethodId,
      methodTitle: method.title,
      baseAmount,
      discount,
      interest,
      interestRate,
      payableAmount,
    };
  },
}));

export const selectPaymentMethodId = (state: PaymentStore) => state.selectedMethodId;
export const selectPaymentDiscount = (state: PaymentStore) => state.discount;
export const selectPaymentInterest = (state: PaymentStore) => state.interest;
export const selectPaymentPayable = (state: PaymentStore) => state.payableAmount;
export const selectPaymentBaseAmount = (state: PaymentStore) => state.baseAmount;
export const selectPaymentCalculation = (state: PaymentStore): PaymentCalculation =>
  state.getCalculation();
