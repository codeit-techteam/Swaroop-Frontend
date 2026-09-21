import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants';
import { DEFAULT_CART_DELIVERY } from '@/constants/cart';
import type { CartDeliveryLocation, CartItem, CartOrderSummary } from '@/types/product';
import { getStorageItem, setStorageItem } from '@/utils/storage';

type CartState = {
  items: CartItem[];
  delivery: CartDeliveryLocation;
  isHydrated: boolean;
};

type CartActions = {
  hydrateCart: () => void;
  addItem: (item: Omit<CartItem, 'id' | 'addedAt'> & { id?: string }) => void;
  replaceItems: (items: CartItem[]) => void;
  removeItem: (itemId: string) => void;
  increaseQuantity: (itemId: string) => void;
  decreaseQuantity: (itemId: string) => void;
  setQuantity: (itemId: string, quantityMt: number) => void;
  clearCart: () => void;
  setDelivery: (delivery: CartDeliveryLocation) => void;
  meetsMoq: () => boolean;
};

export type CartStore = CartState & CartActions;

const buildItemId = (productId: string, offerOrTierId: string): string =>
  `${productId}::${offerOrTierId}`;

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

const meetsMoqForItems = (items: CartItem[]): boolean => {
  if (items.length === 0) {
    return false;
  }
  return items.every((item) => item.quantityMt >= item.moq);
};

export const emptyCartSummary = (items: CartItem[]): CartOrderSummary => ({
  baseSubtotal: null,
  discount: null,
  freight: null,
  gst: null,
  gstLabel: 'GST',
  platformFee: null,
  insuranceIncluded: true,
  insuranceAmount: null,
  totalLandedCost: null,
  totalQuantityMt: items.reduce((sum, item) => sum + item.quantityMt, 0),
  meetsMoq: meetsMoqForItems(items),
  fromQuote: false,
});

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
    const id = item.id ?? buildItemId(item.productId, item.offerId || item.tierId);
    const existingIndex = items.findIndex(
      (entry) =>
        entry.id === id ||
        (item.offerId && entry.offerId === item.offerId) ||
        (entry.productId === item.productId && entry.tierId === item.tierId),
    );

    const nextItem: CartItem = {
      ...item,
      id,
      addedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      const existing = items[existingIndex];
      items[existingIndex] = {
        ...nextItem,
        id: existing.backendItemId ?? existing.id,
        backendItemId: existing.backendItemId ?? item.backendItemId,
        quantityMt: existing.quantityMt + item.quantityMt,
        unitPricePerMt: item.unitPricePerMt,
      };
    } else {
      items.push(nextItem);
    }

    persistItems(items);
    set({ items });
  },

  replaceItems: (items) => {
    persistItems(items);
    set({ items, isHydrated: true });
  },

  removeItem: (itemId) => {
    const items = get().items.filter((item) => item.id !== itemId && item.backendItemId !== itemId);
    persistItems(items);
    set({ items });
  },

  increaseQuantity: (itemId) => {
    const items = get().items.map((item) => {
      if (item.id !== itemId && item.backendItemId !== itemId) {
        return item;
      }
      const increment = item.quantityIncrement > 0 ? item.quantityIncrement : 1;
      return {
        ...item,
        quantityMt: item.quantityMt + increment,
      };
    });
    persistItems(items);
    set({ items });
  },

  decreaseQuantity: (itemId) => {
    const items = get().items.map((item) => {
      if (item.id !== itemId && item.backendItemId !== itemId) {
        return item;
      }
      const increment = item.quantityIncrement > 0 ? item.quantityIncrement : 1;
      return {
        ...item,
        quantityMt: Math.max(1, item.quantityMt - increment),
      };
    });
    persistItems(items);
    set({ items });
  },

  setQuantity: (itemId, quantityMt) => {
    const items = get().items.map((item) => {
      if (item.id !== itemId && item.backendItemId !== itemId) {
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

  meetsMoq: () => meetsMoqForItems(get().items),
}));

export const selectCartItems = (state: CartStore) => state.items;
export const selectCartCount = (state: CartStore) => state.items.length;
export const selectCartDelivery = (state: CartStore) => state.delivery;
export const selectCartHydrated = (state: CartStore) => state.isHydrated;
export const selectCartMeetsMoq = (state: CartStore) => state.meetsMoq();
export const selectCartTotal = (_state: CartStore) => 0;
export const selectOrderSummary = (state: CartStore): CartOrderSummary =>
  emptyCartSummary(state.items);
