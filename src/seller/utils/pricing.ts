import type { SellerPaymentPricing } from '@/seller/types';

export const POLYSTOREX_CREDIT_LABEL = 'Credit — PolyStoreX Managed';

export const POLYSTOREX_CREDIT_NOTE =
  'Customer credit eligibility and payment terms are determined by PolyStoreX.';

type LegacySellerPricing = Partial<SellerPaymentPricing> & {
  advance?: string;
  onLoading?: string;
  onDelivery?: string;
  credit15Days?: string;
  credit30Days?: string;
};

export function createEmptyPricing(): SellerPaymentPricing {
  return { sellingPrice: '' };
}

export function normalizeSellerPricing(pricing?: LegacySellerPricing | null): SellerPaymentPricing {
  return {
    sellingPrice: String(pricing?.sellingPrice ?? pricing?.advance ?? ''),
  };
}

export function getSellerSellingPrice(pricing?: LegacySellerPricing | null): number {
  const value = Number(normalizeSellerPricing(pricing).sellingPrice);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function formatSellerSellingPrice(
  pricing?: LegacySellerPricing | null,
  unit = 'MT',
): string {
  const price = getSellerSellingPrice(pricing);
  if (price <= 0) {
    return '—';
  }
  return `₹${price.toLocaleString('en-IN')}/${unit}`;
}
