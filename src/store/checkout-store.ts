import { create } from 'zustand';

import { CHECKOUT_GST_RATE, CHECKOUT_PLATFORM_FEE } from '@/constants/checkout';
import type { CheckoutOrderSummary, CheckoutShippingAddress } from '@/types/checkout';
import type { CartItem } from '@/types/product';

type CheckoutState = {
  /** The customer's real selected delivery address (from their saved address book). */
  address: CheckoutShippingAddress | null;
  isHydrated: boolean;
};

type CheckoutActions = {
  hydrateCheckout: () => void;
  setAddress: (address: CheckoutShippingAddress | null) => void;
  getSelectedAddress: () => CheckoutShippingAddress;
  calculateFreight: (quantityMt: number) => number;
  calculateGST: (baseSubtotal: number, freight: number) => number;
  calculateTotal: (baseSubtotal: number, freight: number, gst: number) => number;
  getOrderSummary: (items: CartItem[]) => CheckoutOrderSummary;
};

export type CheckoutStore = CheckoutState & CheckoutActions;

/** Neutral placeholder: never a real-looking address. Shown only when nothing is selected. */
export const EMPTY_CHECKOUT_ADDRESS: CheckoutShippingAddress = {
  id: '',
  warehouseName: '',
  line1: '',
  line2: '',
  state: '',
  pincode: '',
  zoneLabel: '',
  cityShort: '',
  freightAmount: 0,
  etaLabel: '',
};

const totalQuantityMt = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.quantityMt, 0);

const baseSubtotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.unitPricePerMt * item.quantityMt, 0);

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
    freightLabel: address.cityShort ? `Freight (${address.cityShort})` : 'Freight',
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
  address: null,
  isHydrated: false,

  hydrateCheckout: () => {
    set({ isHydrated: true });
  },

  setAddress: (address) => {
    set({ address });
  },

  getSelectedAddress: () => get().address ?? EMPTY_CHECKOUT_ADDRESS,

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

export const selectCheckoutAddressId = (state: CheckoutStore) => state.address?.id ?? null;
export const selectCheckoutHydrated = (state: CheckoutStore) => state.isHydrated;
export const selectCheckoutAddress = (state: CheckoutStore) =>
  state.address ?? EMPTY_CHECKOUT_ADDRESS;

export const selectCheckoutOrderSummary =
  (items: CartItem[]) =>
  (state: CheckoutStore): CheckoutOrderSummary =>
    getStableCheckoutSummary(items, state.address ?? EMPTY_CHECKOUT_ADDRESS);
