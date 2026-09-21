import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';
import { buildProductTypeBadge } from '@/constants/cart';
import type { CartItem } from '@/types/product';
import { moneyNumberOrZero } from '@/utils/money';
import { useCartStore } from '@/store/cart-store';

type Envelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  code?: string;
};

export type BackendCartItem = {
  id: string;
  quantity: string | number;
  unit: string;
  unitPrice: string | number;
  currency: string;
  paymentMethod?: string | null;
  priceSnapshotAt?: string;
  lineTotal?: number;
  product: {
    id: string;
    code: string;
    name: string;
    packaging: string | null;
    unit: string;
  };
  grade: {
    id: string;
    code: string;
    name: string;
    displayName: string;
  } | null;
  offer: {
    id: string;
    moq?: string | number | null;
    quantityAvailable?: string | number | null;
    unit?: string;
    price?: string | number;
    deliveryTerms?: string | null;
    region?: string | null;
    packaging?: string | null;
    status?: string;
  };
};

export type BackendCart = {
  id: string;
  status: string;
  itemCount: number;
  subtotal: number;
  currency: string;
  items: BackendCartItem[];
};

const parseQty = (value: string | number | null | undefined): number => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 1;
};

export function mapBackendCartItem(item: BackendCartItem): CartItem {
  const quantityMt = parseQty(item.quantity);
  const moq = parseQty(item.offer?.moq ?? 1);
  const gradeName = item.grade?.displayName ?? item.grade?.name ?? item.grade?.code ?? '';
  return {
    id: item.id,
    backendItemId: item.id,
    productId: item.product?.id,
    offerId: item.offer?.id,
    name: item.product?.name ?? gradeName,
    productType: buildProductTypeBadge(item.product?.code || 'POLYMER'),
    grade: gradeName,
    quantityMt,
    unitPricePerMt: moneyNumberOrZero(item.unitPrice),
    tierId: 'live',
    imageUrl: '',
    moq,
    quantityIncrement: 1,
    packaging: item.product?.packaging ?? item.offer?.packaging ?? '',
    warehouseRegion: item.offer?.region ?? '',
    eta: item.offer?.deliveryTerms ?? '2–3 Business Days',
    addedAt: item.priceSnapshotAt ?? new Date().toISOString(),
    paymentOption: item.paymentMethod ?? undefined,
  };
}

export function mapBackendCartItems(cart: BackendCart | null | undefined): CartItem[] {
  return (cart?.items ?? []).map(mapBackendCartItem);
}

export async function fetchCustomerCart(): Promise<BackendCart> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.get<Envelope<BackendCart>>('/customer/cart');
  return payload.data.data;
}

export async function addCustomerCartItem(input: {
  offerId: string;
  quantity: number;
  paymentMethod?: string;
}): Promise<{ cart: BackendCart; item: { id: string } }> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.post<Envelope<{ cart: BackendCart; item: { id: string } }>>(
    '/customer/cart/items',
    input,
  );
  return payload.data.data;
}

export async function updateCustomerCartItem(
  itemId: string,
  input: { quantity?: number; paymentMethod?: string },
): Promise<BackendCart> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.patch<Envelope<BackendCart>>(
    `/customer/cart/items/${itemId}`,
    input,
  );
  return payload.data.data;
}

export async function removeCustomerCartItem(itemId: string): Promise<BackendCart> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.delete<Envelope<BackendCart>>(`/customer/cart/items/${itemId}`);
  return payload.data.data;
}

export async function clearCustomerCart(): Promise<BackendCart> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.delete<Envelope<BackendCart>>('/customer/cart');
  return payload.data.data;
}

/** @deprecated Prefer `useCartStore` plus backend cart APIs. */
export const addToCart = (item: Omit<CartItem, 'id' | 'addedAt'>): CartItem[] => {
  useCartStore.getState().addItem(item);
  return useCartStore.getState().items;
};

export const getCart = (): CartItem[] => useCartStore.getState().items;

export const clearCart = (): void => {
  useCartStore.getState().clearCart();
};
