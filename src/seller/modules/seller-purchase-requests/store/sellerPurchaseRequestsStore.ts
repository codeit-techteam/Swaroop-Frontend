import { create } from 'zustand';
import Toast from 'react-native-toast-message';

import {
  acceptSellerPurchaseRequest,
  counterSellerPurchaseRequest,
  fetchSellerPurchaseRequest,
  fetchSellerPurchaseRequests,
  rejectSellerPurchaseRequest,
  type SellerPurchaseRequest,
  type SellerPurchaseRequestStatus,
} from '@/services/seller-purchase-requests';

export type PurchaseRequestTabFilter =
  | 'all'
  | 'new'
  | 'under_review'
  | 'counter_sent'
  | 'accepted'
  | 'rejected';

type SellerPurchaseRequestsStore = {
  items: SellerPurchaseRequest[];
  selectedId: string | null;
  isHydrated: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  select: (id: string | null) => void;
  getById: (id: string) => SellerPurchaseRequest | undefined;
  filterByTab: (tab: PurchaseRequestTabFilter) => SellerPurchaseRequest[];
  search: (query: string, tab?: PurchaseRequestTabFilter) => SellerPurchaseRequest[];
  accept: (id: string) => Promise<boolean>;
  reject: (id: string, rejectionReason: string, message?: string) => Promise<boolean>;
  counter: (id: string, unitPrice: number, quantity: number, note?: string) => Promise<boolean>;
  loadDetail: (id: string) => Promise<SellerPurchaseRequest | null>;
};

const showError = (error: unknown, fallback: string): void => {
  const message = error instanceof Error ? error.message : fallback;
  Toast.show({ type: 'error', text1: 'Purchase Requests', text2: message });
};

const matchesTab = (
  item: SellerPurchaseRequest,
  tab: PurchaseRequestTabFilter,
): boolean => {
  if (tab === 'all') return true;
  if (tab === 'rejected') return item.status === 'rejected' || item.status === 'expired';
  return item.status === tab;
};

export const useSellerPurchaseRequestsStore = create<SellerPurchaseRequestsStore>((set, get) => ({
  items: [],
  selectedId: null,
  isHydrated: false,
  isLoading: false,
  isSubmitting: false,
  error: null,

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await fetchSellerPurchaseRequests();
      set({ items, isHydrated: true, isLoading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load purchase requests';
      set({ items: [], isHydrated: true, isLoading: false, error: message });
      showError(error, message);
    }
  },

  refresh: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await fetchSellerPurchaseRequests();
      set({ items, isLoading: false, error: null, isHydrated: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh purchase requests';
      set({ isLoading: false, error: message });
      showError(error, message);
    }
  },

  select: (id) => set({ selectedId: id }),

  getById: (id) =>
    get().items.find((item) => item.id === id || item.requestNumber === id),

  filterByTab: (tab) => get().items.filter((item) => matchesTab(item, tab)),

  search: (query, tab = 'all') => {
    const base = get().filterByTab(tab);
    const normalized = query.trim().toLowerCase();
    if (!normalized) return base;
    return base.filter((item) =>
      [
        item.requestNumber,
        item.productName,
        item.gradeName,
        item.buyerLabel,
        item.deliveryLocation,
        item.status,
      ].some((value) => value.toLowerCase().includes(normalized)),
    );
  },

  accept: async (id) => {
    set({ isSubmitting: true });
    try {
      await acceptSellerPurchaseRequest(id);
      await get().refresh();
      set({ isSubmitting: false });
      Toast.show({ type: 'success', text1: 'Request accepted' });
      return true;
    } catch (error) {
      set({ isSubmitting: false });
      showError(error, 'Failed to accept purchase request');
      return false;
    }
  },

  reject: async (id, rejectionReason, message) => {
    set({ isSubmitting: true });
    try {
      await rejectSellerPurchaseRequest(id, { rejectionReason, message });
      await get().refresh();
      set({ isSubmitting: false });
      Toast.show({ type: 'success', text1: 'Request rejected' });
      return true;
    } catch (error) {
      set({ isSubmitting: false });
      showError(error, 'Failed to reject purchase request');
      return false;
    }
  },

  counter: async (id, unitPrice, quantity, note) => {
    set({ isSubmitting: true });
    try {
      await counterSellerPurchaseRequest(id, { unitPrice, quantity, note });
      await get().refresh();
      set({ isSubmitting: false });
      Toast.show({ type: 'success', text1: 'Counter offer sent' });
      return true;
    } catch (error) {
      set({ isSubmitting: false });
      showError(error, 'Failed to send counter offer');
      return false;
    }
  },

  loadDetail: async (id) => {
    try {
      const detail = await fetchSellerPurchaseRequest(id);
      const items = get().items;
      const exists = items.some((item) => item.id === detail.id);
      set({
        items: exists
          ? items.map((item) => (item.id === detail.id ? detail : item))
          : [detail, ...items],
        selectedId: detail.id,
      });
      return detail;
    } catch (error) {
      showError(error, 'Failed to load purchase request');
      return get().getById(id) ?? null;
    }
  },
}));

export type { SellerPurchaseRequest, SellerPurchaseRequestStatus };
