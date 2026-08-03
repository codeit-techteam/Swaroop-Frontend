import { create } from 'zustand';

import type { Order } from '@/types/order';
import { useOrderStore } from '@/store/order-store';
import { mapDispatchOrderToOrder } from '@/seller/modules/dispatch/services/dispatchService';
import { useDispatchStore } from '@/seller/modules/dispatch/store/dispatchStore';
import { useInventoryStore } from '@/seller/store/inventoryStore';
import {
  acceptOrder as applyAcceptOrder,
  buildDefaultSellerOrdersSnapshot,
  getOrders,
  mapSellerOrderToOrder,
  persistSellerOrdersSnapshot,
  rejectOrder as applyRejectOrder,
  syncSellerOrdersWithDispatch,
} from '@/seller/modules/seller-orders/services/sellerOrdersService';
import type {
  SellerOrdersStore,
  SellerOrderTabFilter,
} from '@/seller/modules/seller-orders/types/sellerOrders';

const syncGlobalOrder = (order: Order): void => {
  const orderStore = useOrderStore.getState();
  const existing = orderStore.orders.find((item) => item.id === order.id);
  if (existing) {
    orderStore.updateOrderById(order.id, order);
    return;
  }
  orderStore.createOrder(order);
};

const syncSellerOrderToGlobal = (sellerOrder: Parameters<typeof mapSellerOrderToOrder>[0]): void => {
  syncGlobalOrder(mapSellerOrderToOrder(sellerOrder));
};

const syncAllSellerOrders = (orders: Parameters<typeof mapSellerOrderToOrder>[0][]): void => {
  orders.forEach((order) => syncSellerOrderToGlobal(order));
};

export const useSellerOrdersStore = create<SellerOrdersStore>((set, get) => ({
  ...buildDefaultSellerOrdersSnapshot(),
  isHydrated: false,

  hydrateSellerOrdersState: () => {
    const dispatchSnapshot = useDispatchStore.getState();
    const baseSnapshot = getOrders();
    const synced = syncSellerOrdersWithDispatch(baseSnapshot, dispatchSnapshot);
    set({
      ...synced,
      isHydrated: true,
    });
    persistSellerOrdersSnapshot(synced);
    syncAllSellerOrders(synced.orders);
  },

  refreshSellerOrdersState: () => {
    const dispatchSnapshot = useDispatchStore.getState();
    const baseSnapshot = getOrders();
    const synced = syncSellerOrdersWithDispatch(baseSnapshot, dispatchSnapshot);
    set(synced);
    persistSellerOrdersSnapshot(synced);
    syncAllSellerOrders(synced.orders);
  },

  selectOrder: (orderId) => {
    const snapshot = { ...get(), selectedOrderId: orderId };
    set({ selectedOrderId: orderId });
    persistSellerOrdersSnapshot(snapshot);
  },

  acceptOrder: (orderId) => {
    const reserveInventory = useInventoryStore.getState().reserveStockForOrder;
    const result = applyAcceptOrder(get(), orderId, reserveInventory);
    if (!result.order) {
      return null;
    }

    set(result.snapshot);
    persistSellerOrdersSnapshot(result.snapshot);
    syncSellerOrderToGlobal(result.order);

    if (result.dispatchSnapshot) {
      useDispatchStore.setState(result.dispatchSnapshot);
      const dispatchOrder = result.dispatchSnapshot.dispatchOrders.find(
        (order) => order.id === result.order?.dispatchLinkId,
      );
      if (dispatchOrder) {
        syncGlobalOrder(mapDispatchOrderToOrder(dispatchOrder));
      }
    }

    return result.order;
  },

  rejectOrder: (orderId, reason, remarks) => {
    const result = applyRejectOrder(get(), orderId, reason, remarks);
    if (!result.order) {
      return null;
    }

    set(result.snapshot);
    persistSellerOrdersSnapshot(result.snapshot);
    syncSellerOrderToGlobal(result.order);
    return result.order;
  },

  syncFromDispatch: () => {
    const dispatchSnapshot = useDispatchStore.getState();
    const synced = syncSellerOrdersWithDispatch(get(), dispatchSnapshot);
    set(synced);
    persistSellerOrdersSnapshot(synced);
    syncAllSellerOrders(synced.orders);
  },

  getOrder: (orderId) => get().orders.find((order) => order.id === orderId || order.orderId === orderId),

  filterOrders: (tab: SellerOrderTabFilter) => {
    const snapshot = get();
    if (tab === 'all') {
      return snapshot.orders.filter((order) => order.orderStatus !== 'rejected');
    }
    if (tab === 'delivered') {
      return snapshot.completedOrders;
    }
    return snapshot.orders.filter((order) => order.orderStatus === tab);
  },

  searchOrders: (query, tab = 'all') => {
    const normalizedQuery = query.trim().toLowerCase();
    const base = get().filterOrders(tab);
    if (!normalizedQuery) {
      return base;
    }
    return base.filter((order) =>
      [order.orderId, order.buyerName, order.material, order.destination, order.city].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  },
}));
