import { create } from 'zustand';

import type { Order } from '@/types/order';
import { useOrderStore } from '@/store/order-store';

import {
  assignVehicle as applyAssignVehicle,
  buildDefaultDispatchSnapshot,
  downloadDocument as resolveDocumentDownload,
  generateInvoice as applyGenerateInvoice,
  getDispatchOrders,
  getDocuments as resolveDocuments,
  mapDispatchOrderToOrder,
  markDelivered as applyMarkDelivered,
  markDispatched as applyMarkDispatched,
  persistDispatchSnapshot,
  completeLoading as applyCompleteLoading,
} from '@/seller/modules/dispatch/services/dispatchService';
import type { DispatchStore } from '@/seller/modules/dispatch/types/dispatch';
import { useSellerOrdersStore } from '@/seller/modules/seller-orders/store/sellerOrdersStore';

const syncSellerOrdersFromDispatch = (): void => {
  useSellerOrdersStore.getState().syncFromDispatch();
};

const syncOrder = (dispatchOrder: Order): void => {
  const orderStore = useOrderStore.getState();
  const existing = orderStore.orders.find((order) => order.id === dispatchOrder.id);
  if (existing) {
    orderStore.updateOrderById(dispatchOrder.id, dispatchOrder as Partial<Order>);
    return;
  }
  orderStore.createOrder(dispatchOrder);
};

const syncAllOrders = (orders: Order[]): void => {
  orders.forEach((order) => syncOrder(order));
};

export const useDispatchStore = create<DispatchStore>((set, get) => ({
  ...buildDefaultDispatchSnapshot(),
  isHydrated: false,

  hydrateDispatchState: () => {
    const snapshot = getDispatchOrders();
    set({
      ...snapshot,
      isHydrated: true,
    });
    syncAllOrders(snapshot.dispatchOrders.map(mapDispatchOrderToOrder));
  },

  refreshDispatchState: () => {
    const snapshot = getDispatchOrders();
    set(snapshot);
    syncAllOrders(snapshot.dispatchOrders.map(mapDispatchOrderToOrder));
  },

  selectDispatch: (orderId) => {
    set({ selectedDispatchId: orderId });
    persistDispatchSnapshot(get());
  },

  assignVehicle: (orderId, vehicleId, driverId) => {
    const result = applyAssignVehicle(get(), orderId, vehicleId, driverId);
    if (!result.order) {
      return null;
    }
    set(result.snapshot);
    persistDispatchSnapshot(result.snapshot);
    syncOrder(mapDispatchOrderToOrder(result.order));
    syncSellerOrdersFromDispatch();
    return result.order;
  },

  generateInvoice: (orderId) => {
    const result = applyGenerateInvoice(get(), orderId);
    if (!result.order) {
      return null;
    }
    set(result.snapshot);
    persistDispatchSnapshot(result.snapshot);
    syncOrder(mapDispatchOrderToOrder(result.order));
    syncSellerOrdersFromDispatch();
    return result.order;
  },

  completeLoading: (orderId) => {
    const result = applyCompleteLoading(get(), orderId);
    if (!result.order) {
      return null;
    }
    set(result.snapshot);
    persistDispatchSnapshot(result.snapshot);
    syncOrder(mapDispatchOrderToOrder(result.order));
    syncSellerOrdersFromDispatch();
    return result.order;
  },

  markDispatched: (orderId) => {
    const result = applyMarkDispatched(get(), orderId);
    if (!result.order) {
      return null;
    }
    set(result.snapshot);
    persistDispatchSnapshot(result.snapshot);
    syncOrder(mapDispatchOrderToOrder(result.order));
    syncSellerOrdersFromDispatch();
    return result.order;
  },

  markDelivered: (orderId) => {
    const result = applyMarkDelivered(get(), orderId);
    if (!result.order) {
      return null;
    }
    set(result.snapshot);
    persistDispatchSnapshot(result.snapshot);
    syncOrder(mapDispatchOrderToOrder(result.order));
    syncSellerOrdersFromDispatch();
    return result.order;
  },

  getDocuments: (orderId) => resolveDocuments(get(), orderId),

  downloadDocument: (orderId, documentId) => resolveDocumentDownload(get(), orderId, documentId),
}));
