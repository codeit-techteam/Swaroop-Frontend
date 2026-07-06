import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants';
import { createDemoOrders } from '@/constants/demoOrders';
import { syncOrderDerivedFields } from '@/constants/orderStatus';
import { createInitialProcurementState } from '@/constants/procurementSteps';
import type { Order, PaymentProof } from '@/types/order';
import type { ProcurementState } from '@/types/procurement';
import { generateOrderId } from '@/utils/payment-proof';
import { getStorageItem, setStorageItem } from '@/utils/storage';

type PersistedOrderState = {
  currentOrder: Order | null;
  paymentProof: PaymentProof | null;
  orders: Order[];
};

type OrderState = {
  currentOrder: Order | null;
  paymentProof: PaymentProof | null;
  orders: Order[];
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
  setSelectedOrderId: (orderId: string | null) => void;
  updateOrderById: (orderId: string, patch: Partial<Order>) => void;
};

export type OrderStore = OrderState &
  OrderActions & {
    selectedOrderId: string | null;
  };

const DEFAULT_ORDER_FIELDS: Pick<
  Order,
  | 'grade'
  | 'productCategory'
  | 'eta'
  | 'progress'
  | 'shipmentStatus'
  | 'insuranceCovered'
  | 'isMasterShipment'
  | 'documents'
> = {
  grade: '',
  productCategory: 'PP',
  eta: null,
  progress: 0,
  shipmentStatus: 'processing',
  insuranceCovered: false,
  isMasterShipment: false,
  documents: [],
};

const normalizeOrder = (order: Order): Order => {
  const normalized: Order = {
    ...DEFAULT_ORDER_FIELDS,
    ...order,
    destination: order.destination ?? '',
    procurement: order.procurement ?? null,
    paymentVerifiedAt: order.paymentVerifiedAt ?? null,
    orderStatus: order.orderStatus ?? 'draft',
    priceLockStatus: order.priceLockStatus ?? 'active',
    priceLockStartedAt: order.priceLockStartedAt ?? null,
    priceLockDurationSeconds: order.priceLockDurationSeconds ?? 0,
    validationTimeline: order.validationTimeline ?? null,
    confirmationStatus: order.confirmationStatus ?? 'pending_petrotrade',
    supplierConfirmation: order.supplierConfirmation ?? 'pending',
    inventoryReserved: order.inventoryReserved ?? false,
    poNumber: order.poNumber ?? null,
    poGenerated: order.poGenerated ?? false,
    procurementCompleted: order.procurementCompleted ?? false,
    dispatchStatus: order.dispatchStatus ?? null,
    documentsReady: order.documentsReady ?? false,
    workflowTimeline: order.workflowTimeline ?? null,
    dispatchReadiness: order.dispatchReadiness ?? null,
    transitWindow: order.transitWindow ?? null,
    trackingTimeline: order.trackingTimeline ?? null,
    documents: order.documents ?? [],
  };

  return syncOrderDerivedFields(normalized);
};

const upsertOrderInList = (orders: Order[], order: Order): Order[] => {
  const normalized = normalizeOrder(order);
  const index = orders.findIndex((item) => item.id === normalized.id);

  if (index === -1) {
    return [normalized, ...orders];
  }

  const nextOrders = [...orders];
  nextOrders[index] = normalized;
  return nextOrders;
};

const persistOrderState = (state: PersistedOrderState): void => {
  setStorageItem(STORAGE_KEYS.ORDER_KEY, JSON.stringify(state));
};

const readPersistedOrderState = (): PersistedOrderState => {
  const raw = getStorageItem(STORAGE_KEYS.ORDER_KEY);
  if (!raw) {
    return { currentOrder: null, paymentProof: null, orders: createDemoOrders() };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedOrderState>;
    const currentOrder = parsed.currentOrder ? normalizeOrder(parsed.currentOrder) : null;
    const orders =
      parsed.orders && parsed.orders.length > 0
        ? parsed.orders.map(normalizeOrder)
        : createDemoOrders();

    const mergedOrders = currentOrder ? upsertOrderInList(orders, currentOrder) : orders;

    return {
      currentOrder,
      paymentProof: parsed.paymentProof ?? null,
      orders: mergedOrders,
    };
  } catch {
    return { currentOrder: null, paymentProof: null, orders: createDemoOrders() };
  }
};

export const useOrderStore = create<OrderStore>((set, get) => ({
  currentOrder: null,
  paymentProof: null,
  orders: [],
  selectedOrderId: null,
  isHydrated: false,

  hydrateOrder: () => {
    const persisted = readPersistedOrderState();
    set({
      currentOrder: persisted.currentOrder,
      paymentProof: persisted.paymentProof,
      orders: persisted.orders,
      isHydrated: true,
    });
  },

  setCurrentOrder: (order) => {
    const { paymentProof, orders } = get();
    const normalized = normalizeOrder(order);
    const nextOrders = upsertOrderInList(orders, normalized);
    persistOrderState({ currentOrder: normalized, paymentProof, orders: nextOrders });
    set({ currentOrder: normalized, orders: nextOrders });
  },

  updateOrder: (patch) => {
    const { currentOrder, paymentProof, orders } = get();
    if (!currentOrder) {
      return;
    }

    const nextOrder = normalizeOrder({ ...currentOrder, ...patch });
    const nextOrders = upsertOrderInList(orders, nextOrder);
    persistOrderState({ currentOrder: nextOrder, paymentProof, orders: nextOrders });
    set({ currentOrder: nextOrder, orders: nextOrders });
  },

  updateProcurement: (patch) => {
    const { currentOrder, paymentProof, orders } = get();
    if (!currentOrder?.procurement) {
      return;
    }

    const nextProcurement: ProcurementState = {
      ...currentOrder.procurement,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    const nextOrder = normalizeOrder({
      ...currentOrder,
      procurement: nextProcurement,
    });
    const nextOrders = upsertOrderInList(orders, nextOrder);

    persistOrderState({ currentOrder: nextOrder, paymentProof, orders: nextOrders });
    set({ currentOrder: nextOrder, orders: nextOrders });
  },

  startProcurement: (paymentVerifiedAt) => {
    const { currentOrder, paymentProof, orders } = get();
    if (!currentOrder || currentOrder.procurement) {
      return;
    }

    const nextOrder = normalizeOrder({
      ...currentOrder,
      paymentVerifiedAt,
      procurement: createInitialProcurementState(paymentVerifiedAt),
    });
    const nextOrders = upsertOrderInList(orders, nextOrder);

    persistOrderState({ currentOrder: nextOrder, paymentProof, orders: nextOrders });
    set({ currentOrder: nextOrder, orders: nextOrders });
  },

  submitPaymentProof: (proof) => {
    const { currentOrder, orders } = get();
    if (!currentOrder) {
      return;
    }

    const nextOrder = normalizeOrder({
      ...currentOrder,
      paymentStatus: 'submitted',
      verificationStatus: 'pending',
    });
    const nextOrders = upsertOrderInList(orders, nextOrder);

    persistOrderState({ currentOrder: nextOrder, paymentProof: proof, orders: nextOrders });
    set({ currentOrder: nextOrder, paymentProof: proof, orders: nextOrders });
  },

  resetOrder: () => {
    const demoOrders = createDemoOrders();
    persistOrderState({ currentOrder: null, paymentProof: null, orders: demoOrders });
    set({ currentOrder: null, paymentProof: null, orders: demoOrders, selectedOrderId: null });
  },

  setSelectedOrderId: (orderId) => {
    set({ selectedOrderId: orderId });
  },

  updateOrderById: (orderId, patch) => {
    const { currentOrder, paymentProof, orders } = get();
    const existingOrder = orders.find((item) => item.id === orderId);

    if (!existingOrder) {
      return;
    }

    const nextOrder = normalizeOrder({ ...existingOrder, ...patch });
    const nextOrders = upsertOrderInList(orders, nextOrder);
    const nextCurrentOrder = currentOrder?.id === orderId ? nextOrder : currentOrder;

    persistOrderState({
      currentOrder: nextCurrentOrder,
      paymentProof,
      orders: nextOrders,
    });
    set({ currentOrder: nextCurrentOrder, orders: nextOrders });
  },
}));

export const selectCurrentOrder = (state: OrderStore) => state.currentOrder;
export const selectPaymentProof = (state: OrderStore) => state.paymentProof;
export const selectOrderHydrated = (state: OrderStore) => state.isHydrated;
export const selectOrders = (state: OrderStore) => state.orders;
export const selectSelectedOrderId = (state: OrderStore) => state.selectedOrderId;

export const createOrderId = generateOrderId;
