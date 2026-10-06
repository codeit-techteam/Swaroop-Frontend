import type { MarketplaceGradeCategory } from '@/types/grade-master';
import type { MarketProduct, StockLevel } from '@/types/market';

export const MARKET_SEARCH_PLACEHOLDER = 'Search GST, invoices, grades, materials, orders…';

export const MARKET_LOCATION_LABEL = 'Mumbai, MH';

/**
 * Market chips: backend Grade Master categories (in admin sort order) that currently have at
 * least one live listing in the loaded catalog.
 */
export function marketCategoryChips(
  categories: MarketplaceGradeCategory[],
  products: MarketProduct[],
): { id: string; label: string }[] {
  const listed = new Set(products.map((product) => product.masterCategoryId).filter(Boolean));
  return categories
    .filter((category) => listed.has(category.id))
    .map((category) => ({ id: category.id, label: category.displayName }));
}

export const getMarketProductById = (
  id: string,
  catalog: MarketProduct[] = [],
): MarketProduct | undefined => catalog.find((product) => product.id === id);

export const formatMarketPrice = (price: number): string => `₹${price.toLocaleString('en-IN')}`;

export const formatStockLabel = (stock: number): string => `${stock.toLocaleString('en-IN')} MT`;

export const formatMoqLabel = (moq: number): string => `${moq} MT`;

export const getStockLevel = (stock: number): StockLevel => {
  if (stock >= 500) {
    return 'high';
  }
  if (stock >= 100) {
    return 'medium';
  }
  return 'low';
};
