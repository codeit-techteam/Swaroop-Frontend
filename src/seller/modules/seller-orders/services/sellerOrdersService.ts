import { STORAGE_KEYS } from '@/constants';
import { syncOrderDerivedFields } from '@/constants/orderStatus';
import { getStorageItem, setStorageItem } from '@/utils/storage';
import type { Order } from '@/types/order';
import type { DispatchSnapshot } from '@/seller/modules/dispatch/types/dispatch';
import {
  createDispatchOrderFromSellerAcceptance,
  getDispatchOrders,
  mapDispatchStageToSellerOrderStatus,
  persistDispatchSnapshot,
} from '@/seller/modules/dispatch/services/dispatchService';
import type {
  SellerOrder,
  SellerOrdersSnapshot,
  SellerOrdersSummary,
  SellerOrderStatus,
  SellerOrderTabFilter,
  SellerRejectReason,
} from '@/seller/modules/seller-orders/types/sellerOrders';

const safeParse = <T>(value: string | undefined, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const nowIso = (): string => new Date().toISOString();

const sortOrders = (orders: SellerOrder[]): SellerOrder[] =>
  [...orders].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

const buildSummary = (orders: SellerOrder[]): SellerOrdersSummary => ({
  total: orders.length,
  pending: orders.filter((order) => order.orderStatus === 'pending').length,
  accepted: orders.filter((order) => order.orderStatus === 'accepted').length,
  dispatchPending: orders.filter((order) => order.orderStatus === 'dispatch_pending').length,
  delivered: orders.filter((order) => order.orderStatus === 'delivered').length,
  rejected: orders.filter((order) => order.orderStatus === 'rejected').length,
});

const partitionOrders = (orders: SellerOrder[]) => ({
  pendingOrders: orders.filter((order) => order.orderStatus === 'pending'),
  acceptedOrders: orders.filter((order) => order.orderStatus === 'accepted'),
  dispatchPendingOrders: orders.filter((order) => order.orderStatus === 'dispatch_pending'),
  completedOrders: orders.filter((order) => order.orderStatus === 'delivered'),
  rejectedOrders: orders.filter((order) => order.orderStatus === 'rejected'),
});

const buildSnapshot = (
  orders: SellerOrder[],
  selectedOrderId: string | null = null,
): SellerOrdersSnapshot => {
  const normalized = sortOrders(orders);
  return {
    orders: normalized,
    ...partitionOrders(normalized),
    selectedOrderId:
      selectedOrderId && normalized.some((order) => order.id === selectedOrderId)
        ? selectedOrderId
        : normalized[0]?.id ?? null,
    summary: buildSummary(normalized),
  };
};

export const buildDefaultSellerOrdersSnapshot = (): SellerOrdersSnapshot =>
  buildSnapshot([], null);

export const snapshotFromOrders = (orders: SellerOrder[]): SellerOrdersSnapshot =>
  buildSnapshot(orders, orders[0]?.id ?? null);

export const getOrders = (): SellerOrdersSnapshot => {
  const persisted = safeParse<Partial<SellerOrdersSnapshot>>(
    getStorageItem(STORAGE_KEYS.SELLER_ORDERS_STATE),
    { orders: [] },
  );
  const orders = persisted.orders ?? [];
  return buildSnapshot(orders, persisted.selectedOrderId ?? null);
};

export const persistSellerOrdersSnapshot = (snapshot: SellerOrdersSnapshot): void => {
  setStorageItem(STORAGE_KEYS.SELLER_ORDERS_STATE, JSON.stringify(snapshot));
};

export const syncSellerOrdersWithDispatch = (
  snapshot: SellerOrdersSnapshot,
  dispatchSnapshot: DispatchSnapshot,
): SellerOrdersSnapshot => {
  const orders = snapshot.orders.map((order) => {
    if (!order.dispatchLinkId || order.orderStatus === 'rejected' || order.orderStatus === 'pending') {
      return order;
    }

    const dispatchOrder = dispatchSnapshot.dispatchOrders.find(
      (item) => item.id === order.dispatchLinkId,
    );
    if (!dispatchOrder) {
      return order;
    }

    const nextStatus = mapDispatchStageToSellerOrderStatus(dispatchOrder.stage);
    if (nextStatus === order.orderStatus) {
      return order;
    }

    return {
      ...order,
      orderStatus: nextStatus,
      updatedAt: dispatchOrder.updatedAt,
    };
  });

  return buildSnapshot(orders, snapshot.selectedOrderId);
};

export const getOrder = (snapshot: SellerOrdersSnapshot, orderId: string): SellerOrder | undefined =>
  snapshot.orders.find((order) => order.id === orderId || order.orderId === orderId);

export const filterOrders = (
  snapshot: SellerOrdersSnapshot,
  tab: SellerOrderTabFilter,
): SellerOrder[] => {
  if (tab === 'all') {
    return snapshot.orders.filter((order) => order.orderStatus !== 'rejected');
  }
  if (tab === 'delivered') {
    return snapshot.completedOrders;
  }
  return snapshot.orders.filter((order) => order.orderStatus === tab);
};

export const searchOrders = (
  snapshot: SellerOrdersSnapshot,
  query: string,
  tab: SellerOrderTabFilter = 'all',
): SellerOrder[] => {
  const normalizedQuery = query.trim().toLowerCase();
  const base = filterOrders(snapshot, tab);

  if (!normalizedQuery) {
    return base;
  }

  return base.filter((order) =>
    [
      order.orderId,
      order.buyerName,
      order.material,
      order.destination,
      order.city,
    ].some((value) => value.toLowerCase().includes(normalizedQuery)),
  );
};

const mapPaymentMethodId = (method: SellerOrder['paymentMethod']): Order['paymentMethodId'] => {
  if (method === 'credit_15_days') {
    return 'credit_15';
  }
  if (method === 'credit_30_days') {
    return 'credit_30';
  }
  if (method === 'on_loading') {
    return 'on_loading';
  }
  if (method === 'on_delivery') {
    return 'on_delivery';
  }
  return 'advance';
};

export const mapSellerOrderToOrder = (sellerOrder: SellerOrder): Order =>
  syncOrderDerivedFields({
    id: sellerOrder.dispatchLinkId ?? `PT-${sellerOrder.orderId}`,
    productName: sellerOrder.material,
    grade: sellerOrder.grade,
    productCategory: sellerOrder.material.includes('PVC')
      ? 'PVC'
      : sellerOrder.material.includes('LLDPE')
        ? 'LLDPE'
        : sellerOrder.material.includes('HDPE')
          ? 'HDPE'
          : 'PP',
    quantityMt: sellerOrder.quantity,
    warehouse: sellerOrder.warehouse,
    destination: sellerOrder.destination,
    eta:
      sellerOrder.orderStatus === 'delivered'
        ? 'Delivered'
        : sellerOrder.orderStatus === 'dispatch_pending'
          ? 'In Transit'
          : null,
    progress:
      sellerOrder.orderStatus === 'delivered'
        ? 100
        : sellerOrder.orderStatus === 'dispatch_pending'
          ? 75
          : sellerOrder.orderStatus === 'accepted'
            ? 45
            : 15,
    shipmentStatus:
      sellerOrder.orderStatus === 'delivered'
        ? 'delivered'
        : sellerOrder.orderStatus === 'dispatch_pending'
          ? 'in_transit'
          : 'processing',
    insuranceCovered: sellerOrder.insuranceStatus === 'active',
    isMasterShipment: false,
    documents: [],
    amount: sellerOrder.value,
    paymentMethod:
      sellerOrder.paymentMethod === 'credit_15_days' ||
      sellerOrder.paymentMethod === 'credit_30_days'
        ? 'Credit — PetroTrade Managed'
        : sellerOrder.paymentMethod === 'on_loading'
          ? 'On Loading'
          : sellerOrder.paymentMethod === 'on_delivery'
            ? 'On Delivery'
            : 'Advance Payment',
    paymentMethodId: mapPaymentMethodId(sellerOrder.paymentMethod),
    paymentStatus:
      sellerOrder.paymentStatus === 'completed'
        ? 'verified'
        : sellerOrder.paymentStatus === 'eligible'
          ? 'pending'
          : 'submitted',
    verificationStatus:
      sellerOrder.paymentStatus === 'completed' ? 'verified' : 'pending',
    procurement: null,
    paymentVerifiedAt:
      sellerOrder.paymentStatus === 'completed' ? sellerOrder.acceptedAt : null,
    orderStatus:
      sellerOrder.orderStatus === 'dispatch_pending' || sellerOrder.orderStatus === 'delivered'
        ? 'dispatch_started'
        : sellerOrder.orderStatus === 'accepted'
          ? 'purchase_order_generated'
          : 'awaiting_confirmation',
    priceLockStatus: 'active',
    priceLockStartedAt: sellerOrder.createdAt,
    priceLockDurationSeconds: 3600,
    validationTimeline: null,
    confirmationStatus:
      sellerOrder.orderStatus === 'pending' ? 'pending_petrotrade' : 'confirmed',
    supplierConfirmation:
      sellerOrder.orderStatus === 'pending' ? 'pending' : 'confirmed',
    inventoryReserved: sellerOrder.inventoryReserved,
    poNumber:
      sellerOrder.orderStatus === 'accepted' ||
      sellerOrder.orderStatus === 'dispatch_pending' ||
      sellerOrder.orderStatus === 'delivered'
        ? `PT-PO-${sellerOrder.orderId.replace('ORD-', '')}`
        : null,
    poGenerated:
      sellerOrder.orderStatus === 'accepted' ||
      sellerOrder.orderStatus === 'dispatch_pending' ||
      sellerOrder.orderStatus === 'delivered',
    procurementCompleted: sellerOrder.orderStatus !== 'pending',
    dispatchStatus:
      sellerOrder.orderStatus === 'delivered'
        ? 'delivered'
        : sellerOrder.orderStatus === 'dispatch_pending'
          ? 'shipment_started'
          : sellerOrder.orderStatus === 'accepted'
            ? 'planning'
            : null,
    documentsReady: sellerOrder.orderStatus !== 'pending',
    workflowTimeline: null,
    dispatchReadiness:
      sellerOrder.orderStatus === 'delivered'
        ? 'Delivered'
        : sellerOrder.orderStatus === 'dispatch_pending'
          ? 'Dispatch in Progress'
          : sellerOrder.orderStatus === 'accepted'
            ? 'Processing Logistics'
            : 'Awaiting Review',
    transitWindow: null,
    trackingTimeline: null,
    dispatchTrackingTimeline: null,
    trackingAvailable: sellerOrder.orderStatus === 'dispatch_pending' || sellerOrder.orderStatus === 'delivered',
    dispatchProgress:
      sellerOrder.orderStatus === 'delivered'
        ? 100
        : sellerOrder.orderStatus === 'dispatch_pending'
          ? 80
          : sellerOrder.orderStatus === 'accepted'
            ? 45
            : 10,
    dispatchStartedAt: sellerOrder.acceptedAt,
    shipmentDetails: null,
    loadingStatus: sellerOrder.orderStatus === 'dispatch_pending' ? 'scheduled' : 'pending',
    loadingSchedule: null,
    loadingProof: null,
    deliveryStatus: sellerOrder.orderStatus === 'delivered' ? 'delivered' : 'pending',
    deliveryDetails: null,
    deliveryProof: null,
    deliveryReceiver: null,
    digitalPod: null,
    deliverySummary: null,
    deliveredAt: sellerOrder.orderStatus === 'delivered' ? sellerOrder.updatedAt : null,
    createdAt: sellerOrder.createdAt,
    status:
      sellerOrder.orderStatus === 'delivered'
        ? 'DELIVERED'
        : sellerOrder.orderStatus === 'dispatch_pending'
          ? 'DISPATCH_STARTED'
          : sellerOrder.orderStatus === 'accepted'
            ? 'PAYMENT_VERIFIED'
            : 'ORDER_CREATED',
    currentStep:
      sellerOrder.orderStatus === 'delivered'
        ? 'DELIVERED'
        : sellerOrder.orderStatus === 'dispatch_pending'
          ? 'DISPATCH_STARTED'
          : sellerOrder.orderStatus === 'accepted'
            ? 'PAYMENT_VERIFIED'
            : 'ORDER_CREATED',
  });

const updateOrderInSnapshot = (
  snapshot: SellerOrdersSnapshot,
  orderId: string,
  updater: (order: SellerOrder) => SellerOrder,
): SellerOrdersSnapshot => {
  const orders = snapshot.orders.map((order) =>
    order.id === orderId || order.orderId === orderId ? updater(order) : order,
  );
  return buildSnapshot(orders, orderId);
};

export type AcceptOrderResult = {
  snapshot: SellerOrdersSnapshot;
  order: SellerOrder | null;
  dispatchSnapshot?: DispatchSnapshot;
};

export const acceptOrder = (
  snapshot: SellerOrdersSnapshot,
  orderId: string,
  reserveInventory: (productId: string, quantity: number) => boolean,
): AcceptOrderResult => {
  const target = getOrder(snapshot, orderId);
  if (!target || target.orderStatus !== 'pending') {
    return { snapshot, order: null };
  }

  if (target.inventoryProductId) {
    const reserved = reserveInventory(target.inventoryProductId, target.quantity);
    if (!reserved) {
      return { snapshot, order: null };
    }
  }

  const timestamp = nowIso();
  const dispatchLinkId = `PT-${target.orderId}`;
  const acceptedOrder: SellerOrder = {
    ...target,
    orderStatus: 'accepted',
    dispatchLinkId,
    inventoryReserved: true,
    acceptedAt: timestamp,
    updatedAt: timestamp,
  };

  const nextSnapshot = updateOrderInSnapshot(snapshot, target.id, () => acceptedOrder);
  const dispatchSnapshot = getDispatchOrders();
  const dispatchResult = createDispatchOrderFromSellerAcceptance(dispatchSnapshot, {
    orderId: acceptedOrder.orderId,
    material: acceptedOrder.material,
    quantity: acceptedOrder.quantity,
    destination: acceptedOrder.destination,
    warehouse: acceptedOrder.warehouse,
    value: acceptedOrder.value,
    paymentMethod: acceptedOrder.paymentMethod,
    buyerName: acceptedOrder.buyerName,
  });

  persistDispatchSnapshot(dispatchResult.snapshot);

  return {
    snapshot: nextSnapshot,
    order: acceptedOrder,
    dispatchSnapshot: dispatchResult.snapshot,
  };
};

export const rejectOrder = (
  snapshot: SellerOrdersSnapshot,
  orderId: string,
  reason: SellerRejectReason,
  remarks: string,
): { snapshot: SellerOrdersSnapshot; order: SellerOrder | null } => {
  const target = getOrder(snapshot, orderId);
  if (!target || target.orderStatus !== 'pending') {
    return { snapshot, order: null };
  }

  const timestamp = nowIso();
  const rejectedOrder: SellerOrder = {
    ...target,
    orderStatus: 'rejected',
    rejectionReason: reason,
    rejectionRemarks: remarks,
    rejectedAt: timestamp,
    updatedAt: timestamp,
  };

  return {
    snapshot: updateOrderInSnapshot(snapshot, target.id, () => rejectedOrder),
    order: rejectedOrder,
  };
};

export const PAYMENT_METHOD_LABELS: Record<SellerOrder['paymentMethod'], string> = {
  advance_payment: 'Advance Payment',
  on_loading: 'On Loading',
  on_delivery: 'On Delivery',
  credit_15_days: 'Credit — PetroTrade Managed',
  credit_30_days: 'Credit — PetroTrade Managed',
};

export const ORDER_STATUS_LABELS: Record<SellerOrderStatus, string> = {
  pending: 'PENDING',
  accepted: 'ACCEPTED',
  dispatch_pending: 'DISPATCH PENDING',
  delivered: 'DELIVERED',
  rejected: 'REJECTED',
};
