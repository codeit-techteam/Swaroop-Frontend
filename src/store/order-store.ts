import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants';
import type { Order, PaymentProof } from '@/types/order';
import { generateOrderId } from '@/utils/payment-proof';
import { getStorageItem, setStorageItem } from '@/utils/storage';

type PersistedOrderState = {
  currentOrder: Order | null;
  paymentProof: PaymentProof | null;
};

type OrderState = {
  currentOrder: Order | null;
  paymentProof: PaymentProof | null;
  isHydrated: boolean;
};

type OrderActions = {
  hydrateOrder: () => void;
  setCurrentOrder: (order: Order) => void;
  updateOrder: (patch: Partial<Order>) => void;
  submitPaymentProof: (proof: PaymentProof) => void;
  resetOrder: () => void;
};

export type OrderStore = OrderState & OrderActions;

const persistOrderState = (state: PersistedOrderState): void => {
  setStorageItem(STORAGE_KEYS.ORDER_KEY, JSON.stringify(state));
};

const readPersistedOrderState = (): PersistedOrderState => {
  const raw = getStorageItem(STORAGE_KEYS.ORDER_KEY);
  if (!raw) {
    return { currentOrder: null, paymentProof: null };
  }

  try {
    return JSON.parse(raw) as PersistedOrderState;
  } catch {
    return { currentOrder: null, paymentProof: null };
  }
};

export const useOrderStore = create<OrderStore>((set, get) => ({
  currentOrder: null,
  paymentProof: null,
  isHydrated: false,

  hydrateOrder: () => {
    const persisted = readPersistedOrderState();
    set({
      currentOrder: persisted.currentOrder,
      paymentProof: persisted.paymentProof,
      isHydrated: true,
    });
  },

  setCurrentOrder: (order) => {
    const { paymentProof } = get();
    persistOrderState({ currentOrder: order, paymentProof });
    set({ currentOrder: order });
  },

  updateOrder: (patch) => {
    const { currentOrder, paymentProof } = get();
    if (!currentOrder) {
      return;
    }
    const nextOrder: Order = { ...currentOrder, ...patch };
    persistOrderState({ currentOrder: nextOrder, paymentProof });
    set({ currentOrder: nextOrder });
  },

  submitPaymentProof: (proof) => {
    const { currentOrder } = get();
    if (!currentOrder) {
      return;
    }

    const nextOrder: Order = {
      ...currentOrder,
      paymentStatus: 'submitted',
      verificationStatus: 'pending',
    };

    persistOrderState({ currentOrder: nextOrder, paymentProof: proof });
    set({ currentOrder: nextOrder, paymentProof: proof });
  },

  resetOrder: () => {
    persistOrderState({ currentOrder: null, paymentProof: null });
    set({ currentOrder: null, paymentProof: null });
  },
}));

export const selectCurrentOrder = (state: OrderStore) => state.currentOrder;
export const selectPaymentProof = (state: OrderStore) => state.paymentProof;
export const selectOrderHydrated = (state: OrderStore) => state.isHydrated;

export const createOrderId = generateOrderId;
