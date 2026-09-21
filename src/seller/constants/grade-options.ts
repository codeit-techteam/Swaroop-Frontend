import { materialsFromCatalog } from '@/constants/materials-taxonomy';
import type { MarketProduct } from '@/types/market';

export function sellerProductCategories(catalog: MarketProduct[]): string[] {
  return materialsFromCatalog(catalog).map((family) => family.name);
}

export function sellerPolymerTypes(catalog: MarketProduct[]): string[] {
  return Array.from(new Set(catalog.map((product) => product.grade).filter(Boolean))).sort(
    (left, right) => left.localeCompare(right),
  );
}

export const SELLER_PACKAGING_TYPES = ['25 kg bags', 'Jumbo bags', 'Palletized bags'] as const;

export const SELLER_ORIGIN_OPTIONS = [
  'India',
  'UAE',
  'Saudi Arabia',
  'Singapore',
  'China',
  'Thailand',
  'KSA',
  'USA',
] as const;

export const SELLER_UNIT_OPTIONS = ['MT', 'kg'] as const;

export const SELLER_PAYMENT_TERM_PRICE_FIELDS = [
  { key: 'sellingPrice', label: 'Selling Price (₹/MT)' },
] as const;
