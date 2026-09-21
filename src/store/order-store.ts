import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants';
import { fetchCustomerOrders } from '@/services/orders';
import {
  buildOrderTimeline,
  createInitialOrderFields,
  createStatusPatch,
  inferOrderStatus,
  ORDER_STATUS_PROGRESS,
} from '@/constants/orderWorkflow';
import { syncOrderDerivedFields } from '@/constants/orderStatus';
import {
  createCreditCountdownPatch,
  createCreditRestoredPatch,
  createInitialCreditState,
  createInvoicePatch,
  isCreditPaymentFlow,
  mapOrderStatusToCreditPhase,
} from '@/constants/creditWorkflow';
import { createInitialProcurementState } from '@/constants/procurementSteps';
import type { Order, PaymentProof } from '@/types/order';
import type { OrderStatus } from '@/types/orderStatus';
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
  createOrder: (order: Order) => void;
  setCurrentOrder: (order: Order) => void;
  updateOrder: (patch: Partial<Order>) => void;
  updateProcurement: (patch: Partial<ProcurementState>) => void;
  setOrderStatus: (status: OrderStatus, orderId?: string) => void;
  startProcurement: (paymentVerifiedAt?: string) => void;
  startSupplierMatching: () => void;
  scheduleLoading: () => void;
  completeLoading: () => void;
  markPaymentPending: () => void;
  verifyPayment: (verifiedAt?: string) => void;
  startDispatch: () => void;
  markInTransit: () => void;
  markOutForDelivery: () => void;
  markDelivered: () => void;
  completeDelivery: () => void;
  approveCredit: () => void;
  generateCreditInvoice: () => void;
  startCreditCountdown: () => void;
  submitCreditPaymentProof: (proof: PaymentProof) => void;
  restoreCredit: (verifiedAt?: string) => void;
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
  const withDefaults: Order = {
    ...DEFAULT_ORDER_FIELDS,
    ...createInitialOrderFields(),
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
    dispatchTrackingTimeline: order.dispatchTrackingTimeline ?? null,
    trackingAvailable: order.trackingAvailable ?? false,
    dispatchProgress: order.dispatchProgress ?? 0,
    dispatchStartedAt: order.dispatchStartedAt ?? null,
    shipmentDetails: order.shipmentDetails ?? null,
    loadingStatus: order.loadingStatus ?? 'pending',
    loadingSchedule: order.loadingSchedule ?? null,
    loadingProof: order.loadingProof ?? null,
    deliveryStatus: order.deliveryStatus,
    deliveryDetails: order.deliveryDetails ?? null,
    deliveryProof: order.deliveryProof ?? null,
    deliveryReceiver: order.deliveryReceiver ?? null,
    digitalPod: order.digitalPod ?? null,
    deliverySummary: order.deliverySummary ?? null,
    deliveredAt: order.deliveredAt ?? null,
    documents: order.documents ?? [],
    credit: order.credit ?? null,
  };

  const status = inferOrderStatus(withDefaults);
  const normalized: Order = {
    ...withDefaults,
    status,
    currentStep: status,
    progress: ORDER_STATUS_PROGRESS[status],
    timeline: buildOrderTimeline({ ...withDefaults, status }),
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

const EMPTY_ORDER_STATE: PersistedOrderState = {
  currentOrder: null,
  paymentProof: null,
  orders: [],
};

const readPersistedOrderState = (): PersistedOrderState => {
  const raw = getStorageItem(STORAGE_KEYS.ORDER_KEY);
  if (!raw) {
    return EMPTY_ORDER_STATE;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedOrderState>;
    const currentOrder = parsed.currentOrder ? normalizeOrder(parsed.currentOrder) : null;
    const orders = (parsed.orders ?? []).map(normalizeOrder);
    const mergedOrders = currentOrder ? upsertOrderInList(orders, currentOrder) : orders;

    return {
      currentOrder,
      paymentProof: parsed.paymentProof ?? null,
      orders: mergedOrders,
    };
  } catch {
    return EMPTY_ORDER_STATE;
  }
};

const applyStatusToOrder = (order: Order, status: OrderStatus): Order => {
  const patch = createStatusPatch(status, order);
  const creditPhase = isCreditPaymentFlow(order)
    ? mapOrderStatusToCreditPhase(status)
    : null;
  const withCredit =
    creditPhase && order.credit
      ? { ...order, credit: { ...order.credit, workflowPhase: creditPhase } }
      : order;
  return normalizeOrder({ ...withCredit, ...patch });
};

export const useOrderStore = create<OrderStore>((set, get) => {
  const commitOrder = (nextOrder: Order): void => {
    const { paymentProof, orders } = get();
    const normalized = normalizeOrder(nextOrder);
    const nextOrders = upsertOrderInList(orders, normalized);
    persistOrderState({ currentOrder: normalized, paymentProof, orders: nextOrders });
    set({ currentOrder: normalized, orders: nextOrders });
  };

  const transitionCurrentOrder = (status: OrderStatus): void => {
    const { currentOrder } = get();
    if (!currentOrder) {
      return;
    }
    commitOrder(applyStatusToOrder(currentOrder, status));
  };

  return {
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
        isHydrated: false,
      });
      // Authoritative source: PurchaseOrder projection via /customer/orders
      void fetchCustomerOrders()
        .then((orders) => {
          const currentOrder =
            persisted.currentOrder && orders.some((item) => item.id === persisted.currentOrder?.id)
              ? orders.find((item) => item.id === persisted.currentOrder?.id) ?? persisted.currentOrder
              : orders[0] ?? null;
          persistOrderState({
            currentOrder,
            paymentProof: persisted.paymentProof,
            orders,
          });
          set({
            currentOrder,
            paymentProof: persisted.paymentProof,
            orders,
            isHydrated: true,
          });
        })
        .catch(() => {
          // Never fall back to mock/static orders on API failure
          persistOrderState({ currentOrder: null, paymentProof: null, orders: [] });
          set({
            currentOrder: null,
            paymentProof: persisted.paymentProof,
            orders: [],
            isHydrated: true,
          });
        });
    },

    createOrder: (order) => {
      const withCredit = isCreditPaymentFlow(order)
        ? {
            ...order,
            credit:
              order.credit ?? createInitialCreditState(order.paymentMethodId, order.amount),
          }
        : order;
      const normalized = applyStatusToOrder(withCredit, 'ORDER_CREATED');
      commitOrder(normalized);
    },

    setCurrentOrder: (order) => {
      commitOrder(order);
    },

    updateOrder: (patch) => {
      const { currentOrder } = get();
      if (!currentOrder) {
        return;
      }
      commitOrder({ ...currentOrder, ...patch });
    },

    setOrderStatus: (status, orderId) => {
      const { currentOrder, paymentProof, orders } = get();
      const targetId = orderId ?? currentOrder?.id;

      if (!targetId) {
        return;
      }

      const existingOrder =
        targetId === currentOrder?.id
          ? currentOrder
          : orders.find((item) => item.id === targetId);

      if (!existingOrder) {
        return;
      }

      const nextOrder = applyStatusToOrder(existingOrder, status);
      const nextOrders = upsertOrderInList(orders, nextOrder);
      const nextCurrentOrder = currentOrder?.id === targetId ? nextOrder : currentOrder;

      persistOrderState({
        currentOrder: nextCurrentOrder,
        paymentProof,
        orders: nextOrders,
      });
      set({ currentOrder: nextCurrentOrder, orders: nextOrders });
    },

    updateProcurement: (patch) => {
      const { currentOrder } = get();
      if (!currentOrder?.procurement) {
        return;
      }

      const nextProcurement: ProcurementState = {
        ...currentOrder.procurement,
        ...patch,
        updatedAt: new Date().toISOString(),
      };

      commitOrder({ ...currentOrder, procurement: nextProcurement });
    },

    startProcurement: (paymentVerifiedAt) => {
      const { currentOrder } = get();
      if (!currentOrder) {
        return;
      }

      const verifiedAt = paymentVerifiedAt ?? new Date().toISOString();
      const withProcurement = applyStatusToOrder(
        {
          ...currentOrder,
          paymentVerifiedAt: currentOrder.paymentVerifiedAt ?? verifiedAt,
          procurement: currentOrder.procurement ?? createInitialProcurementState(verifiedAt),
        },
        'PROCUREMENT_STARTED',
      );
      commitOrder(withProcurement);
    },

    startSupplierMatching: () => {
      transitionCurrentOrder('SUPPLIER_MATCHING');
    },

    scheduleLoading: () => {
      transitionCurrentOrder('LOADING_SCHEDULED');
    },

    completeLoading: () => {
      transitionCurrentOrder('LOADING_COMPLETED');
    },

    markPaymentPending: () => {
      transitionCurrentOrder('PAYMENT_PENDING');
    },

    verifyPayment: (verifiedAt) => {
      const { currentOrder } = get();
      if (!currentOrder) {
        return;
      }

      const withVerifiedAt = {
        ...currentOrder,
        paymentVerifiedAt: verifiedAt ?? currentOrder.paymentVerifiedAt ?? new Date().toISOString(),
      };
      commitOrder(applyStatusToOrder(withVerifiedAt, 'PAYMENT_VERIFIED'));
    },

    startDispatch: () => {
      transitionCurrentOrder('DISPATCH_STARTED');
    },

    markInTransit: () => {
      transitionCurrentOrder('IN_TRANSIT');
    },

    markOutForDelivery: () => {
      transitionCurrentOrder('OUT_FOR_DELIVERY');
    },

    markDelivered: () => {
      transitionCurrentOrder('DELIVERED');
    },

    completeDelivery: () => {
      transitionCurrentOrder('DELIVERY_COMPLETED');
    },

    approveCredit: () => {
      const { currentOrder } = get();
      if (!currentOrder || !isCreditPaymentFlow(currentOrder)) {
        return;
      }

      const credit =
        currentOrder.credit ??
        createInitialCreditState(currentOrder.paymentMethodId, currentOrder.amount);

      commitOrder({
        ...currentOrder,
        credit: { ...credit, creditApproved: true, workflowPhase: 'approved' },
      });
    },

    generateCreditInvoice: () => {
      const { currentOrder } = get();
      if (!currentOrder?.credit) {
        return;
      }

      commitOrder({ ...currentOrder, ...createInvoicePatch(currentOrder) });
    },

    startCreditCountdown: () => {
      const { currentOrder } = get();
      if (!currentOrder?.credit) {
        return;
      }

      commitOrder({
        ...currentOrder,
        ...createCreditCountdownPatch(currentOrder),
        status: 'PAYMENT_PENDING',
        paymentStatus: 'pending',
      });
    },

    submitCreditPaymentProof: (proof) => {
      const { currentOrder, orders } = get();
      if (!currentOrder?.credit) {
        return;
      }

      const nextOrder = normalizeOrder({
        ...currentOrder,
        paymentStatus: 'submitted',
        verificationStatus: 'pending',
        status: 'PAYMENT_PENDING',
        credit: { ...currentOrder.credit, workflowPhase: 'payment_uploaded' },
      });
      const nextOrders = upsertOrderInList(orders, nextOrder);

      persistOrderState({ currentOrder: nextOrder, paymentProof: proof, orders: nextOrders });
      set({ currentOrder: nextOrder, paymentProof: proof, orders: nextOrders });
    },

    restoreCredit: (verifiedAt) => {
      const { currentOrder } = get();
      if (!currentOrder?.credit) {
        return;
      }

      const verified = verifiedAt ?? new Date().toISOString();
      commitOrder({
        ...currentOrder,
        ...createCreditRestoredPatch(currentOrder),
        paymentVerifiedAt: verified,
        status: 'PAYMENT_VERIFIED',
        shipmentStatus: 'delivered',
      });
    },

    submitPaymentProof: (proof) => {
      const { currentOrder, orders } = get();
      if (!currentOrder) {
        return;
      }
      const nextOrder = applyStatusToOrder(currentOrder, 'PAYMENT_PENDING');
      const nextOrders = upsertOrderInList(orders, nextOrder);

      persistOrderState({ currentOrder: nextOrder, paymentProof: proof, orders: nextOrders });
      set({ currentOrder: nextOrder, paymentProof: proof, orders: nextOrders });
    },

    resetOrder: () => {
      persistOrderState({ currentOrder: null, paymentProof: null, orders: [] });
      set({ currentOrder: null, paymentProof: null, orders: [], selectedOrderId: null });
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
  };
});

export const selectCurrentOrder = (state: OrderStore) => state.currentOrder;
export const selectPaymentProof = (state: OrderStore) => state.paymentProof;
export const selectOrderHydrated = (state: OrderStore) => state.isHydrated;
export const selectOrders = (state: OrderStore) => state.orders;
export const selectSelectedOrderId = (state: OrderStore) => state.selectedOrderId;
export const selectActiveOrder = (state: OrderStore) => {
  const active = state.orders.filter(
    (order) =>
      inferOrderStatus(order) !== 'DELIVERED' && order.shipmentStatus !== 'cancelled',
  );
  return state.currentOrder && active.some((o) => o.id === state.currentOrder?.id)
    ? state.currentOrder
    : active[0] ?? state.currentOrder;
};

export const createOrderId = generateOrderId;
