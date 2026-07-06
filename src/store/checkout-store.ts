import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants';
import {
  CHECKOUT_GST_RATE,
  CHECKOUT_PLATFORM_FEE,
  DEFAULT_CHECKOUT_ADDRESS_ID,
  getCheckoutAddressById,
} from '@/constants/checkout';
import type { CartItem } from '@/types/product';
import type { CheckoutOrderSummary, CheckoutShippingAddress } from '@/types/checkout';
import { getStorageItem, setStorageItem } from '@/utils/storage';

type CheckoutState = {
  selectedAddressId: string;
  isHydrated: boolean;
};

type CheckoutActions = {
  hydrateCheckout: () => void;
  changeAddress: (addressId: string) => void;
  getSelectedAddress: () => CheckoutShippingAddress;
  calculateFreight: (quantityMt: number) => number;
  calculateGST: (baseSubtotal: number, freight: number) => number;
  calculateTotal: (baseSubtotal: number, freight: number, gst: number) => number;
  getOrderSummary: (items: CartItem[]) => CheckoutOrderSummary;
};

export type CheckoutStore = CheckoutState & CheckoutActions;

type PersistedCheckout = {
  selectedAddressId: string;
};

const totalQuantityMt = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.quantityMt, 0);

const baseSubtotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.unitPricePerMt * item.quantityMt, 0);

const readPersistedCheckout = (): string => {
  const raw = getStorageItem(STORAGE_KEYS.CHECKOUT_KEY);
  if (!raw) {
    return DEFAULT_CHECKOUT_ADDRESS_ID;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedCheckout;
    const address = getCheckoutAddressById(parsed.selectedAddressId);
    return address.id;
  } catch {
    return DEFAULT_CHECKOUT_ADDRESS_ID;
  }
};

const persistCheckout = (selectedAddressId: string): void => {
  const payload: PersistedCheckout = { selectedAddressId };
  setStorageItem(STORAGE_KEYS.CHECKOUT_KEY, JSON.stringify(payload));
};

const buildOrderSummary = (
  items: CartItem[],
  address: CheckoutShippingAddress,
): CheckoutOrderSummary => {
  const subtotal = baseSubtotal(items);
  const freight = address.freightAmount;
  const gst = Math.round((subtotal + freight) * CHECKOUT_GST_RATE);

  return {
    baseSubtotal: subtotal,
    freight,
    freightLabel: `Freight (${address.cityShort})`,
    gst,
    platformFee: CHECKOUT_PLATFORM_FEE,
    insuranceIncluded: true,
    totalPayable: subtotal + freight + gst + CHECKOUT_PLATFORM_FEE,
    totalQuantityMt: totalQuantityMt(items),
  };
};

const isSameCheckoutSummary = (a: CheckoutOrderSummary, b: CheckoutOrderSummary): boolean =>
  a.baseSubtotal === b.baseSubtotal &&
  a.freight === b.freight &&
  a.freightLabel === b.freightLabel &&
  a.gst === b.gst &&
  a.platformFee === b.platformFee &&
  a.insuranceIncluded === b.insuranceIncluded &&
  a.totalPayable === b.totalPayable &&
  a.totalQuantityMt === b.totalQuantityMt;

/** Cached so useSyncExternalStore does not loop on a fresh object each read. */
let cachedCheckoutSummary: CheckoutOrderSummary | null = null;
let cachedCheckoutSummaryKey = '';

const getStableCheckoutSummary = (
  items: CartItem[],
  address: CheckoutShippingAddress,
): CheckoutOrderSummary => {
  const key = `${address.id}:${items.map((item) => `${item.id}-${item.quantityMt}`).join('|')}`;
  const next = buildOrderSummary(items, address);

  if (
    cachedCheckoutSummary &&
    cachedCheckoutSummaryKey === key &&
    isSameCheckoutSummary(cachedCheckoutSummary, next)
  ) {
    return cachedCheckoutSummary;
  }

  cachedCheckoutSummary = next;
  cachedCheckoutSummaryKey = key;
  return next;
};

export const useCheckoutStore = create<CheckoutStore>((set, get) => ({
  selectedAddressId: DEFAULT_CHECKOUT_ADDRESS_ID,
  isHydrated: false,

  hydrateCheckout: () => {
    set({
      selectedAddressId: readPersistedCheckout(),
      isHydrated: true,
    });
  },

  changeAddress: (addressId) => {
    const address = getCheckoutAddressById(addressId);
    persistCheckout(address.id);
    set({ selectedAddressId: address.id });
  },

  getSelectedAddress: () => getCheckoutAddressById(get().selectedAddressId),

  calculateFreight: (quantityMt) => {
    if (quantityMt <= 0) {
      return 0;
    }
    return get().getSelectedAddress().freightAmount;
  },

  calculateGST: (baseSubtotalAmount, freight) =>
    Math.round((baseSubtotalAmount + freight) * CHECKOUT_GST_RATE),

  calculateTotal: (baseSubtotalAmount, freight, gst) =>
    baseSubtotalAmount + freight + gst + CHECKOUT_PLATFORM_FEE,

  getOrderSummary: (items) => getStableCheckoutSummary(items, get().getSelectedAddress()),
}));

export const selectCheckoutAddressId = (state: CheckoutStore) => state.selectedAddressId;
export const selectCheckoutHydrated = (state: CheckoutStore) => state.isHydrated;
export const selectCheckoutAddress = (state: CheckoutStore) =>
  getCheckoutAddressById(state.selectedAddressId);

export const selectCheckoutOrderSummary =
  (items: CartItem[]) =>
  (state: CheckoutStore): CheckoutOrderSummary =>
    getStableCheckoutSummary(items, getCheckoutAddressById(state.selectedAddressId));
