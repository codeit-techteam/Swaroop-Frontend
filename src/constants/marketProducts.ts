import { blindGradesMock, getBlindGradeById } from '@/constants/blind-grades';
import type { MarketCategory, MarketProduct, StockLevel } from '@/types/market';

export const MARKET_SEARCH_PLACEHOLDER = 'Search materials, grades, CAS, MFI...';

export const MARKET_LOCATION_LABEL = 'Mumbai, MH';

const PREFERRED_CATEGORIES: MarketCategory[] = [
  'Polypropylene',
  'HDPE',
  'LDPE',
  'LLDPE',
  'PVC',
  'PET',
  'ABS',
  'EVA',
  'Polycarbonate',
  'Nylon',
  'CPVC',
  'HIPS',
];

/** WEBAPP Source.one-style blind catalog — no product photography. */
export const MARKET_PRODUCTS: MarketProduct[] = blindGradesMock;

const uniqueCategories = Array.from(
  new Set(MARKET_PRODUCTS.map((product) => product.category).filter(Boolean)),
);

export const MARKET_CATEGORIES: MarketCategory[] = [
  ...PREFERRED_CATEGORIES.filter((category) => uniqueCategories.includes(category)),
  ...uniqueCategories
    .filter((category) => !PREFERRED_CATEGORIES.includes(category))
    .sort((a, b) => a.localeCompare(b)),
];

export const getMarketProductById = (id: string): MarketProduct | undefined =>
  getBlindGradeById(id) ?? MARKET_PRODUCTS.find((product) => product.id === id);

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
