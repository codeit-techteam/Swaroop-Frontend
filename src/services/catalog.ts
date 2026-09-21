import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';
import type { MarketProduct } from '@/types/market';

type Envelope<T> = {
  success: boolean;
  data: T;
  meta?: { total: number; totalPages?: number };
};

type BlindListing = {
  offerId: string;
  price?: number | string;
  moq?: number | string | null;
  quantityAvailable?: number | string | null;
  leadTime?: string | null;
};

type BlindProduct = {
  id: string;
  code: string;
  name: string;
  brand?: string | null;
  description?: string | null;
  technicalSpecs?: Record<string, unknown> | null;
  mfi?: string | null;
  density?: string | null;
  packaging?: string | null;
  countryOfOrigin?: string | null;
  supplyOrigin?: string | null;
  listing?: BlindListing | null;
  grade?: { code?: string; name?: string } | null;
};

function num(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function mapBlindProduct(product: BlindProduct): MarketProduct {
  const specs = (product.technicalSpecs ?? {}) as Record<string, unknown>;
  const listing = product.listing;
  return {
    id: product.id,
    name: product.name,
    grade: product.grade?.code ?? String(specs.materialType ?? product.code),
    price: num(listing?.price),
    origin: String(specs.origin ?? product.countryOfOrigin ?? ''),
    stock: num(listing?.quantityAvailable),
    moq: num(listing?.moq),
    eta: String(listing?.leadTime ?? specs.eta ?? ''),
    category: String(specs.materialType ?? product.grade?.name ?? product.name),
    badge: (typeof specs.badge === 'string' ? specs.badge : 'Best Value') as MarketProduct['badge'],
    image: '',
    gradeCode: product.code,
    categoryId: (specs.parentCategoryId as MarketProduct['categoryId']) ?? 'polymers',
    materialType: String(specs.materialType ?? product.grade?.name ?? product.name),
    subCategory: typeof specs.subCategory === 'string' ? specs.subCategory : undefined,
    description: product.description ?? undefined,
    warehouseLabel: typeof specs.warehouseLabel === 'string' ? specs.warehouseLabel : undefined,
    casNumber: typeof specs.casNumber === 'string' ? specs.casNumber : undefined,
    applications: Array.isArray(specs.applications) ? (specs.applications as string[]) : [],
    technicalSpecs: {
      mfi: product.mfi ?? (typeof specs.mfi === 'string' ? specs.mfi : undefined),
      density: product.density ?? (typeof specs.density === 'string' ? specs.density : undefined),
      form: typeof specs.form === 'string' ? specs.form : undefined,
    },
    creditEligible: Boolean(specs.creditEligible),
    offerId: listing?.offerId,
  };
}

export async function fetchCustomerMarketplaceProducts(): Promise<MarketProduct[]> {
  await ensureDevBackendSession('customer');
  const pages: BlindProduct[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const payload = await apiClient.get<Envelope<BlindProduct[]>>('/customer/products', {
      params: { page, limit: 100, sortBy: 'name', sortOrder: 'asc' },
    });
    const body = payload.data;
    pages.push(...(body.data ?? []));
    totalPages = body.meta?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages && page <= 10);
  const products = pages.map(mapBlindProduct);
  setLiveCatalogCache(products);
  return products;
}

type SellerGrade = {
  id: string;
  code: string;
  name: string;
  displayName?: string;
  category?: { id: string; code: string; name: string; parentGroup?: string } | null;
};

const PARENT_FROM_GROUP: Record<string, MarketProduct['categoryId']> = {
  POLYMERS: 'polymers',
  COMPOUNDS: 'polymers',
  ELASTOMERS: 'polymers',
  RECYCLED: 'polymers',
  CHEMICALS: 'chemicals',
  SOLVENTS: 'chemicals',
  INTERMEDIATES: 'chemicals',
  MASTERBATCH: 'additives',
  SPECIALTY: 'additives',
  BASE_OILS: 'base-oils',
};

let liveCatalogCache: MarketProduct[] = [];

export function setLiveCatalogCache(products: MarketProduct[]) {
  liveCatalogCache = products;
}

export function getLiveCatalogProduct(id?: string | null): MarketProduct | undefined {
  if (!id) return undefined;
  return liveCatalogCache.find(
    (product) => product.id === id || product.gradeCode === id || product.grade === id,
  );
}

export async function fetchSellerVisibleGrades(): Promise<SellerGrade[]> {
  await ensureDevBackendSession('seller');
  const pages: SellerGrade[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const payload = await apiClient.get<Envelope<SellerGrade[]>>('/master-data/grades/seller', {
      params: { page, limit: 100, sortBy: 'sortOrder', sortOrder: 'asc' },
    });
    const body = payload.data;
    pages.push(...(body.data ?? []));
    totalPages = body.meta?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages && page <= 10);
  return pages;
}

export function mapSellerGradeToCatalogItem(grade: SellerGrade): MarketProduct {
  const material = grade.category?.name ?? grade.displayName ?? grade.name;
  return {
    id: grade.id,
    name: grade.displayName ?? grade.name,
    grade: grade.code,
    price: 0,
    origin: '',
    stock: 0,
    moq: 0,
    eta: '',
    category: material,
    badge: 'Best Value',
    image: '',
    gradeCode: grade.code,
    categoryId: PARENT_FROM_GROUP[grade.category?.parentGroup ?? ''] ?? 'polymers',
    materialType: material,
    description: grade.name,
    applications: [],
    technicalSpecs: {},
    creditEligible: false,
  };
}

export async function fetchSellerCatalogProducts(): Promise<MarketProduct[]> {
  const grades = await fetchSellerVisibleGrades();
  const products = grades.map(mapSellerGradeToCatalogItem);
  setLiveCatalogCache(products);
  return products;
}
