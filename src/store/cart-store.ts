import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants';
import {
  calculateFreightForQuantity,
  CART_GST_RATE,
  CART_PLATFORM_FEE,
  DEFAULT_CART_DELIVERY,
} from '@/constants/cart';
import type { CartDeliveryLocation, CartItem, CartOrderSummary } from '@/types/product';
import { getStorageItem, setStorageItem } from '@/utils/storage';

type CartState = {
  items: CartItem[];
  delivery: CartDeliveryLocation;
  isHydrated: boolean;
};

type CartActions = {
  hydrateCart: () => void;
  addItem: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
  removeItem: (itemId: string) => void;
  increaseQuantity: (itemId: string) => void;
  decreaseQuantity: (itemId: string) => void;
  setQuantity: (itemId: string, quantityMt: number) => void;
  clearCart: () => void;
  setDelivery: (delivery: CartDeliveryLocation) => void;
  calculateSubtotal: () => number;
  calculateFreight: () => number;
  calculateGST: () => number;
  calculateTotal: () => number;
  getOrderSummary: () => CartOrderSummary;
  meetsMoq: () => boolean;
};

export type CartStore = CartState & CartActions;

const buildItemId = (productId: string, tierId: string): string => `${productId}::${tierId}`;

const isValidCartItem = (item: unknown): item is CartItem => {
  if (!item || typeof item !== 'object') {
    return false;
  }
  const entry = item as Partial<CartItem>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.productId === 'string' &&
    typeof entry.name === 'string' &&
    typeof entry.productType === 'string' &&
    typeof entry.quantityMt === 'number' &&
    typeof entry.unitPricePerMt === 'number' &&
    typeof entry.moq === 'number' &&
    typeof entry.imageUrl === 'string'
  );
};

const readPersistedItems = (): CartItem[] => {
  const raw = getStorageItem(STORAGE_KEYS.CART_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isValidCartItem);
  } catch {
    return [];
  }
};

const persistItems = (items: CartItem[]): void => {
  setStorageItem(STORAGE_KEYS.CART_KEY, JSON.stringify(items));
};

const totalQuantityMt = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.quantityMt, 0);

const baseSubtotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.unitPricePerMt * item.quantityMt, 0);

const freightForItems = (items: CartItem[]): number => {
  const qty = totalQuantityMt(items);
  return calculateFreightForQuantity(qty);
};

const gstForItems = (items: CartItem[]): number => {
  const taxable = baseSubtotal(items) + freightForItems(items);
  return Math.round(taxable * CART_GST_RATE);
};

const totalForItems = (items: CartItem[]): number =>
  baseSubtotal(items) + freightForItems(items) + gstForItems(items) + CART_PLATFORM_FEE;

const meetsMoqForItems = (items: CartItem[]): boolean => {
  if (items.length === 0) {
    return false;
  }
  return items.every((item) => item.quantityMt >= item.moq);
};

const buildOrderSummary = (items: CartItem[]): CartOrderSummary => ({
  baseSubtotal: baseSubtotal(items),
  freight: freightForItems(items),
  gst: gstForItems(items),
  platformFee: CART_PLATFORM_FEE,
  insuranceIncluded: true,
  totalLandedCost: totalForItems(items),
  totalQuantityMt: totalQuantityMt(items),
  meetsMoq: meetsMoqForItems(items),
});

const isSameOrderSummary = (a: CartOrderSummary, b: CartOrderSummary): boolean =>
  a.baseSubtotal === b.baseSubtotal &&
  a.freight === b.freight &&
  a.gst === b.gst &&
  a.platformFee === b.platformFee &&
  a.insuranceIncluded === b.insuranceIncluded &&
  a.totalLandedCost === b.totalLandedCost &&
  a.totalQuantityMt === b.totalQuantityMt &&
  a.meetsMoq === b.meetsMoq;

/** Cached so useSyncExternalStore does not loop on a fresh object each read. */
let cachedOrderSummary: CartOrderSummary | null = null;

const getStableOrderSummary = (items: CartItem[]): CartOrderSummary => {
  const next = buildOrderSummary(items);
  if (cachedOrderSummary && isSameOrderSummary(cachedOrderSummary, next)) {
    return cachedOrderSummary;
  }
  cachedOrderSummary = next;
  return next;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  delivery: DEFAULT_CART_DELIVERY,
  isHydrated: false,

  hydrateCart: () => {
    set({
      items: readPersistedItems(),
      isHydrated: true,
    });
  },

  addItem: (item) => {
    const items = [...get().items];
    const id = buildItemId(item.productId, item.tierId);
    const existingIndex = items.findIndex((entry) => entry.id === id);

    const nextItem: CartItem = {
      ...item,
      id,
      addedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      const existing = items[existingIndex];
      items[existingIndex] = {
        ...nextItem,
        quantityMt: existing.quantityMt + item.quantityMt,
        unitPricePerMt: item.unitPricePerMt,
      };
    } else {
      items.push(nextItem);
    }

    persistItems(items);
    set({ items });
  },

  removeItem: (itemId) => {
    const items = get().items.filter((item) => item.id !== itemId);
    persistItems(items);
    set({ items });
  },

  increaseQuantity: (itemId) => {
    const items = get().items.map((item) => {
      if (item.id !== itemId) {
        return item;
      }
      return {
        ...item,
        quantityMt: item.quantityMt + 1,
      };
    });
    persistItems(items);
    set({ items });
  },

  decreaseQuantity: (itemId) => {
    const items = get().items.map((item) => {
      if (item.id !== itemId) {
        return item;
      }
      return {
        ...item,
        /** Allow values below MOQ so the warning + disabled checkout can surface. */
        quantityMt: Math.max(1, item.quantityMt - 1),
      };
    });
    persistItems(items);
    set({ items });
  },

  setQuantity: (itemId, quantityMt) => {
    const items = get().items.map((item) => {
      if (item.id !== itemId) {
        return item;
      }
      return {
        ...item,
        quantityMt: Math.max(1, quantityMt),
      };
    });
    persistItems(items);
    set({ items });
  },

  clearCart: () => {
    persistItems([]);
    set({ items: [] });
  },

  setDelivery: (delivery) => {
    set({ delivery });
  },

  calculateSubtotal: () => baseSubtotal(get().items),

  calculateFreight: () => freightForItems(get().items),

  calculateGST: () => gstForItems(get().items),

  calculateTotal: () => totalForItems(get().items),

  getOrderSummary: (): CartOrderSummary => getStableOrderSummary(get().items),

  meetsMoq: () => meetsMoqForItems(get().items),
}));

export const selectCartItems = (state: CartStore) => state.items;
export const selectCartCount = (state: CartStore) => state.items.length;
export const selectCartDelivery = (state: CartStore) => state.delivery;
export const selectCartHydrated = (state: CartStore) => state.isHydrated;
export const selectCartTotal = (state: CartStore) => state.calculateTotal();
export const selectCartMeetsMoq = (state: CartStore) => state.meetsMoq();
export const selectOrderSummary = (state: CartStore): CartOrderSummary =>
  getStableOrderSummary(state.items);
