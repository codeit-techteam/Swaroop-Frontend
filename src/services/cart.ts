import { useCartStore } from '@/store/cart-store';
import type { CartItem } from '@/types/product';

/** @deprecated Prefer `useCartStore` — kept for compatibility. */
export const addToCart = (item: Omit<CartItem, 'id' | 'addedAt'>): CartItem[] => {
  useCartStore.getState().addItem(item);
  return useCartStore.getState().items;
};

export const getCart = (): CartItem[] => useCartStore.getState().items;

export const clearCart = (): void => {
  useCartStore.getState().clearCart();
};
