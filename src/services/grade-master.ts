import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';
import {
  getLiveCatalogProduct,
  mapBlindProduct,
  mapSellerGradeToCatalogItem,
  mergeLiveCatalogCache,
  type SellerGrade,
} from '@/services/catalog';
import type {
  BlindGradeOffer,
  CustomerGrade,
  GradeBrowseFilters,
  GradeFacets,
  GradePage,
  MarketplaceGradeCategory,
} from '@/types/grade-master';
import type { MarketProduct } from '@/types/market';

type Envelope<T> = {
  success: boolean;
  data: T;
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number };
};

export const GRADE_PAGE_SIZE = 30;

const num = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const str = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value : null;

const browseParams = (filters: GradeBrowseFilters, page: number, limit: number) => {
  const search = filters.search?.trim();
  return {
    page,
    limit,
    ...(search ? { search } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.gradeGroup ? { gradeGroup: filters.gradeGroup } : {}),
    ...(filters.manufacturer ? { manufacturer: filters.manufacturer } : {}),
    ...(filters.hasOffers ? { hasOffers: true } : {}),
  };
};

const toPage = <T>(body: Envelope<T[]>, page: number): GradePage<T> => {
  const items = body.data ?? [];
  return {
    items,
    page: body.meta?.page ?? page,
    totalPages: body.meta?.totalPages ?? 1,
    total: body.meta?.total ?? items.length,
  };
};

const emptyFacets = (): GradeFacets => ({ categories: [], gradeGroups: [], manufacturers: [] });

const normalizeFacets = (data: Partial<GradeFacets> | null | undefined): GradeFacets => ({
  ...emptyFacets(),
  ...data,
  categories: (data?.categories ?? []).map((category) => ({
    ...category,
    displayName: category.displayName || category.name,
  })),
});

const normalizeCustomerGrade = (grade: CustomerGrade): CustomerGrade => ({
  ...grade,
  displayName: grade.displayName || grade.name,
  description: grade.description ?? null,
  gradeGroup: grade.gradeGroup ?? null,
  gradeNo: grade.gradeNo ?? null,
  manufacturer: grade.manufacturer ?? null,
  fullGradeName: grade.fullGradeName ?? null,
  category: grade.category
    ? { ...grade.category, displayName: grade.category.displayName || grade.category.name }
    : null,
});

const mapBlindOffer = (raw: Record<string, unknown>): BlindGradeOffer => {
  const product =
    raw.product && typeof raw.product === 'object'
      ? (raw.product as Record<string, unknown>)
      : null;
  const validUntil = raw.validUntil;
  return {
    id: String(raw.id),
    referenceNumber: str(raw.referenceNumber),
    price: num(raw.price),
    currency: str(raw.currency) ?? 'INR',
    unit: str(raw.unit) ?? 'MT',
    moq: num(raw.moq),
    quantityAvailable: num(raw.quantityAvailable),
    packaging: str(raw.packaging),
    region: str(raw.region),
    deliveryTerms: str(raw.deliveryTerms),
    validUntil: typeof validUntil === 'string' ? validUntil : null,
    productId: product ? str(product.id) : null,
  };
};

/* ---------------------------------- Customer ---------------------------------- */

export async function fetchCustomerGradePage(
  filters: GradeBrowseFilters,
  page = 1,
  limit = GRADE_PAGE_SIZE,
): Promise<GradePage<CustomerGrade>> {
  await ensureDevBackendSession('customer');
  const response = await apiClient.get<Envelope<CustomerGrade[]>>('/customer/marketplace/grades', {
    params: browseParams(filters, page, limit),
  });
  const result = toPage(response.data, page);
  return { ...result, items: result.items.map(normalizeCustomerGrade) };
}

export async function fetchCustomerGrade(id: string): Promise<CustomerGrade> {
  await ensureDevBackendSession('customer');
  const response = await apiClient.get<Envelope<CustomerGrade>>(
    `/customer/marketplace/grades/${id}`,
  );
  if (!response.data.data) {
    throw new Error('Grade not found');
  }
  return normalizeCustomerGrade(response.data.data);
}

export async function fetchCustomerGradeProducts(id: string): Promise<MarketProduct[]> {
  await ensureDevBackendSession('customer');
  const response = await apiClient.get<Envelope<Parameters<typeof mapBlindProduct>[0][]>>(
    `/customer/marketplace/grades/${id}/products`,
    { params: { page: 1, limit: 50 } },
  );
  const products = (response.data.data ?? []).map(mapBlindProduct);
  mergeLiveCatalogCache(products);
  return products;
}

export async function fetchCustomerGradeOffers(id: string): Promise<BlindGradeOffer[]> {
  await ensureDevBackendSession('customer');
  const response = await apiClient.get<Envelope<Record<string, unknown>[]>>(
    `/customer/marketplace/grades/${id}/offers`,
    { params: { page: 1, limit: 50 } },
  );
  return (response.data.data ?? []).map(mapBlindOffer);
}

export async function fetchCustomerMarketplaceCategories(): Promise<MarketplaceGradeCategory[]> {
  await ensureDevBackendSession('customer');
  const response = await apiClient.get<Envelope<MarketplaceGradeCategory[]>>(
    '/customer/marketplace/categories',
  );
  return (response.data.data ?? []).map((category) => ({
    ...category,
    displayName: category.displayName || category.name,
  }));
}

export async function fetchCustomerGradeFacets(params: {
  categoryId?: string | null;
  search?: string;
}): Promise<GradeFacets> {
  await ensureDevBackendSession('customer');
  const response = await apiClient.get<Envelope<GradeFacets>>(
    '/master-data/grades/customer/facets',
    {
      params: {
        ...(params.categoryId ? { categoryId: params.categoryId } : {}),
        ...(params.search?.trim() ? { search: params.search.trim() } : {}),
      },
    },
  );
  return normalizeFacets(response.data.data);
}

/* ----------------------------------- Seller ----------------------------------- */

export async function fetchSellerGradeFacets(params: {
  categoryId?: string | null;
}): Promise<GradeFacets> {
  await ensureDevBackendSession('seller');
  const response = await apiClient.get<Envelope<GradeFacets>>('/master-data/grades/seller/facets', {
    params: params.categoryId ? { categoryId: params.categoryId } : {},
  });
  return normalizeFacets(response.data.data);
}

/** ACTIVE + seller-visible grades, mapped to catalog items and cached for the listing editor. */
export async function fetchSellerGradePage(
  filters: GradeBrowseFilters,
  page = 1,
  limit = GRADE_PAGE_SIZE,
): Promise<GradePage<MarketProduct>> {
  await ensureDevBackendSession('seller');
  const response = await apiClient.get<Envelope<SellerGrade[]>>('/master-data/grades/seller', {
    params: { ...browseParams(filters, page, limit), sortBy: 'sortOrder', sortOrder: 'asc' },
  });
  const result = toPage(response.data, page);
  const items = result.items.map(mapSellerGradeToCatalogItem);
  mergeLiveCatalogCache(items);
  return { ...result, items };
}

/** Resolves a seller-visible grade by id (cache first), e.g. for deep links or a restored draft. */
export async function fetchSellerGradeById(id: string): Promise<MarketProduct | null> {
  const cached = getLiveCatalogProduct(id);
  if (cached) return cached;
  await ensureDevBackendSession('seller');
  const response = await apiClient.get<Envelope<SellerGrade | null>>(`/master-data/grades/${id}`);
  const grade = response.data.data;
  if (!grade) return null;
  const item = mapSellerGradeToCatalogItem(grade);
  mergeLiveCatalogCache([item]);
  return item;
}
