import { create } from 'zustand';

import type { Order } from '@/types/order';
import { useAuthStore } from '@/store/auth-store';
import { useOrderStore } from '@/store/order-store';
import { mapDispatchOrderToOrder } from '@/seller/modules/dispatch/services/dispatchService';
import { useDispatchStore } from '@/seller/modules/dispatch/store/dispatchStore';
import {
  buildDefaultSellerOrdersSnapshot,
  mapSellerOrderToOrder,
  persistSellerOrdersSnapshot,
  snapshotFromOrders,
  syncSellerOrdersWithDispatch,
} from '@/seller/modules/seller-orders/services/sellerOrdersService';
import { fetchSellerPurchaseOrders } from '@/services/seller-operations';
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
  // Never inject seller POs into the customer Orders list.
  const role = useAuthStore.getState().selectedRole;
  if (role !== 'seller') {
    return;
  }
  orders.forEach((order) => syncSellerOrderToGlobal(order));
};

export const useSellerOrdersStore = create<SellerOrdersStore>((set, get) => ({
  ...buildDefaultSellerOrdersSnapshot(),
  isHydrated: false,

  hydrateSellerOrdersState: () => {
    set({ isHydrated: false });
    void fetchSellerPurchaseOrders()
      .then((orders) => {
        const dispatchSnapshot = useDispatchStore.getState();
        const synced = syncSellerOrdersWithDispatch(snapshotFromOrders(orders), dispatchSnapshot);
        set({
          ...synced,
          isHydrated: true,
        });
        persistSellerOrdersSnapshot(synced);
        syncAllSellerOrders(synced.orders);
      })
      .catch(() => {
        const empty = buildDefaultSellerOrdersSnapshot();
        set({ ...empty, isHydrated: true });
        persistSellerOrdersSnapshot(empty);
      });
  },

  refreshSellerOrdersState: () => {
    void fetchSellerPurchaseOrders()
      .then((orders) => {
        const dispatchSnapshot = useDispatchStore.getState();
        const synced = syncSellerOrdersWithDispatch(snapshotFromOrders(orders), dispatchSnapshot);
        set(synced);
        persistSellerOrdersSnapshot(synced);
        syncAllSellerOrders(synced.orders);
      })
      .catch(() => {
        const empty = buildDefaultSellerOrdersSnapshot();
        set(empty);
        persistSellerOrdersSnapshot(empty);
      });
  },

  selectOrder: (orderId) => {
    const snapshot = { ...get(), selectedOrderId: orderId };
    set({ selectedOrderId: orderId });
    persistSellerOrdersSnapshot(snapshot);
  },

  // Accept/reject inventing local dispatch is disabled — use Purchase Requests APIs.
  acceptOrder: (_orderId) => null,

  rejectOrder: (_orderId, _reason, _remarks) => null,

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
