import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants';
import { createInitialProcurementState } from '@/constants/procurementSteps';
import type { Order, PaymentProof } from '@/types/order';
import type { ProcurementState } from '@/types/procurement';
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
  updateProcurement: (patch: Partial<ProcurementState>) => void;
  startProcurement: (paymentVerifiedAt: string) => void;
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
    const parsed = JSON.parse(raw) as PersistedOrderState;
    const currentOrder = parsed.currentOrder
      ? {
          ...parsed.currentOrder,
          destination: parsed.currentOrder.destination ?? '',
          procurement: parsed.currentOrder.procurement ?? null,
          paymentVerifiedAt: parsed.currentOrder.paymentVerifiedAt ?? null,
          orderStatus: parsed.currentOrder.orderStatus ?? 'draft',
          priceLockStatus: parsed.currentOrder.priceLockStatus ?? 'active',
          priceLockStartedAt: parsed.currentOrder.priceLockStartedAt ?? null,
          priceLockDurationSeconds: parsed.currentOrder.priceLockDurationSeconds ?? 0,
          validationTimeline: parsed.currentOrder.validationTimeline ?? null,
          confirmationStatus: parsed.currentOrder.confirmationStatus ?? 'pending_petrotrade',
          supplierConfirmation: parsed.currentOrder.supplierConfirmation ?? 'pending',
          inventoryReserved: parsed.currentOrder.inventoryReserved ?? false,
          poNumber: parsed.currentOrder.poNumber ?? null,
          poGenerated: parsed.currentOrder.poGenerated ?? false,
          procurementCompleted: parsed.currentOrder.procurementCompleted ?? false,
          dispatchStatus: parsed.currentOrder.dispatchStatus ?? null,
          documentsReady: parsed.currentOrder.documentsReady ?? false,
          workflowTimeline: parsed.currentOrder.workflowTimeline ?? null,
          dispatchReadiness: parsed.currentOrder.dispatchReadiness ?? null,
          transitWindow: parsed.currentOrder.transitWindow ?? null,
        }
      : null;

    return { currentOrder, paymentProof: parsed.paymentProof };
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

  updateProcurement: (patch) => {
    const { currentOrder, paymentProof } = get();
    if (!currentOrder?.procurement) {
      return;
    }

    const nextProcurement: ProcurementState = {
      ...currentOrder.procurement,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    const nextOrder: Order = {
      ...currentOrder,
      procurement: nextProcurement,
    };

    persistOrderState({ currentOrder: nextOrder, paymentProof });
    set({ currentOrder: nextOrder });
  },

  startProcurement: (paymentVerifiedAt) => {
    const { currentOrder, paymentProof } = get();
    if (!currentOrder || currentOrder.procurement) {
      return;
    }

    const nextOrder: Order = {
      ...currentOrder,
      paymentVerifiedAt,
      procurement: createInitialProcurementState(paymentVerifiedAt),
    };

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
