import { STORAGE_KEYS } from '@/constants';
import type { CartItem } from '@/types/product';
import { getStorageItem, setStorageItem } from '@/utils/storage';

const getCartItems = (): CartItem[] => {
  const raw = getStorageItem(STORAGE_KEYS.CART_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveCartItems = (items: CartItem[]): void => {
  setStorageItem(STORAGE_KEYS.CART_KEY, JSON.stringify(items));
};

export const addToCart = (item: Omit<CartItem, 'addedAt'>): CartItem[] => {
  const items = getCartItems();
  const existingIndex = items.findIndex(
    (entry) => entry.productId === item.productId && entry.tierId === item.tierId,
  );

  const nextItem: CartItem = {
    ...item,
    addedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...nextItem,
      quantityMt: items[existingIndex].quantityMt + item.quantityMt,
    };
  } else {
    items.push(nextItem);
  }

  saveCartItems(items);
  return items;
};

export const getCart = (): CartItem[] => getCartItems();

export const clearCart = (): void => {
  saveCartItems([]);
};
