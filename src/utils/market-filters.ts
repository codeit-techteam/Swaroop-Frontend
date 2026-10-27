/**
 * Market tab filters (B-07).
 *
 * The Market tab loads the complete buyable catalogue (`fetchCustomerMarketplaceProducts`
 * pages through `/customer/products` until exhausted) and searches it in memory, so
 * filters are applied the same way. Facets are derived from the loaded catalogue so the
 * sheet only ever offers values that exist. Pure functions — unit-tested under Node.
 */
import type { MarketProduct } from '@/types/market';

export type MarketSort = 'relevance' | 'price-asc' | 'price-desc' | 'moq-asc';

export type MarketFilters = {
  inStockOnly: boolean;
  creditEligibleOnly: boolean;
  manufacturers: string[];
  origins: string[];
  /** Inclusive ₹/MT bounds; `null` = unbounded. */
  priceMin: number | null;
  priceMax: number | null;
  /** Only listings whose MOQ is at most this many MT. */
  maxMoq: number | null;
  sort: MarketSort;
};

export type MarketFacetBucket = { name: string; count: number };

export type MarketFacets = {
  manufacturers: MarketFacetBucket[];
  origins: MarketFacetBucket[];
  /** Observed price range across listings with a positive price. */
  priceRange: { min: number; max: number } | null;
};

export const EMPTY_MARKET_FILTERS: MarketFilters = {
  inStockOnly: false,
  creditEligibleOnly: false,
  manufacturers: [],
  origins: [],
  priceMin: null,
  priceMax: null,
  maxMoq: null,
  sort: 'relevance',
};

export const MARKET_SORT_OPTIONS: { value: MarketSort; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'moq-asc', label: 'Lowest MOQ first' },
];

const normalize = (value: string | undefined | null): string => (value ?? '').trim();

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** Parses a free-text numeric field; blank / junk → null, negatives clamp to 0. */
export function parseFilterNumber(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  const digits = String(raw).replace(/[^\d.]/g, '');
  if (!digits) return null;
  const parsed = Number(digits);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, parsed);
}

/** Normalises user input so min ≤ max and empty arrays stay empty. */
export function normalizeMarketFilters(input: MarketFilters): MarketFilters {
  let { priceMin, priceMax } = input;
  if (isFiniteNumber(priceMin) && isFiniteNumber(priceMax) && priceMin > priceMax) {
    [priceMin, priceMax] = [priceMax, priceMin];
  }
  return {
    ...input,
    manufacturers: Array.from(new Set(input.manufacturers.map(normalize).filter(Boolean))),
    origins: Array.from(new Set(input.origins.map(normalize).filter(Boolean))),
    priceMin: isFiniteNumber(priceMin) ? priceMin : null,
    priceMax: isFiniteNumber(priceMax) ? priceMax : null,
    maxMoq: isFiniteNumber(input.maxMoq) && input.maxMoq > 0 ? input.maxMoq : null,
  };
}

export function countActiveMarketFilters(filters: MarketFilters): number {
  let count = 0;
  if (filters.inStockOnly) count += 1;
  if (filters.creditEligibleOnly) count += 1;
  if (filters.manufacturers.length > 0) count += 1;
  if (filters.origins.length > 0) count += 1;
  if (filters.priceMin !== null || filters.priceMax !== null) count += 1;
  if (filters.maxMoq !== null) count += 1;
  if (filters.sort !== 'relevance') count += 1;
  return count;
}

export const hasActiveMarketFilters = (filters: MarketFilters): boolean =>
  countActiveMarketFilters(filters) > 0;

function bucketise(values: (string | undefined)[]): MarketFacetBucket[] {
  const counts = new Map<string, number>();
  for (const raw of values) {
    const value = normalize(raw);
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function buildMarketFacets(products: MarketProduct[]): MarketFacets {
  const prices = products.map((p) => p.price).filter((p) => isFiniteNumber(p) && p > 0);
  return {
    manufacturers: bucketise(products.map((p) => p.manufacturer)),
    origins: bucketise(products.map((p) => p.origin)),
    priceRange: prices.length > 0 ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
  };
}

function matchesMarketFilters(product: MarketProduct, filters: MarketFilters): boolean {
  if (filters.inStockOnly && !(product.stock > 0)) return false;
  if (filters.creditEligibleOnly && !product.creditEligible) return false;
  if (
    filters.manufacturers.length > 0 &&
    !filters.manufacturers.includes(normalize(product.manufacturer))
  ) {
    return false;
  }
  if (filters.origins.length > 0 && !filters.origins.includes(normalize(product.origin))) {
    return false;
  }
  if (filters.priceMin !== null || filters.priceMax !== null) {
    // Price-less (RFQ-only) rows cannot satisfy a price bound.
    if (!(product.price > 0)) return false;
    if (filters.priceMin !== null && product.price < filters.priceMin) return false;
    if (filters.priceMax !== null && product.price > filters.priceMax) return false;
  }
  if (filters.maxMoq !== null && product.moq > filters.maxMoq) return false;
  return true;
}

function sortProducts(products: MarketProduct[], sort: MarketSort): MarketProduct[] {
  if (sort === 'relevance') return products;
  const copy = [...products];
  const priced = (p: MarketProduct) => (p.price > 0 ? p.price : Number.POSITIVE_INFINITY);
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => priced(a) - priced(b));
    case 'price-desc':
      return copy.sort((a, b) => (b.price > 0 ? b.price : -1) - (a.price > 0 ? a.price : -1));
    case 'moq-asc':
      return copy.sort((a, b) => a.moq - b.moq);
    default:
      return copy;
  }
}

/** Applies filters then sort; stable for `relevance` so search ranking is preserved. */
export function applyMarketFilters(
  products: MarketProduct[],
  rawFilters: MarketFilters,
): MarketProduct[] {
  const filters = normalizeMarketFilters(rawFilters);
  if (!hasActiveMarketFilters(filters)) return products;
  return sortProducts(
    products.filter((product) => matchesMarketFilters(product, filters)),
    filters.sort,
  );
}
