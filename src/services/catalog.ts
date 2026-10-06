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
  priceTiers?: {
    minQty?: number | string | null;
    maxQty?: number | string | null;
    price?: number | string | null;
  }[];
};

type BlindProductDocument = {
  id: string;
  type: string;
  title: string;
  description?: string;
  version?: number;
  status?: string;
  available?: boolean;
  mimeType?: string | null;
  fileName?: string;
  fileSizeBytes?: string | null;
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
  grade?: {
    id?: string;
    code?: string;
    name?: string;
    category?: { id: string; code: string; name: string } | null;
  } | null;
  documents?: BlindProductDocument[];
};

function num(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function mapBlindProduct(product: BlindProduct): MarketProduct {
  const specs = (product.technicalSpecs ?? {}) as Record<string, unknown>;
  const listing = product.listing;
  const priceTiers = listing?.priceTiers ?? [];
  const bulkPricing =
    priceTiers.length > 0
      ? priceTiers.map((tier, index) => {
          const minMt = num(tier.minQty);
          const maxMt = tier.maxQty == null || tier.maxQty === '' ? null : num(tier.maxQty);
          return {
            id: `tier-${index}-${minMt}`,
            minMt,
            maxMt,
            pricePerMt: num(tier.price),
            quantityLabel: maxMt == null ? `${minMt}+ MT` : `${minMt} - ${maxMt} MT`,
          };
        })
      : undefined;

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
    gradeId: product.grade?.id,
    masterCategoryId: product.grade?.category?.id,
    masterCategoryName: product.grade?.category?.name,
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
    bulkPricing,
    documents: product.documents ?? [],
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

export async function fetchCustomerMarketplaceProduct(id: string): Promise<MarketProduct> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.get<Envelope<BlindProduct>>(`/customer/products/${id}`);
  const raw = payload.data.data;
  if (!raw) {
    throw new Error('Product not found');
  }
  const product = mapBlindProduct(raw);
  const without = liveCatalogCache.filter(
    (item) => item.id !== product.id && item.gradeCode !== product.gradeCode,
  );
  setLiveCatalogCache([product, ...without]);
  return product;
}

type ProductDocumentUrl = {
  id: string;
  url: string;
  expiresInSeconds?: number;
  fileName?: string;
  mimeType?: string | null;
  title?: string;
};

/** Short-lived signed URL for a seller-uploaded product PDF (TDS/MSDS/etc.). */
export async function fetchProductDocumentUrl(
  productId: string,
  documentId: string,
): Promise<ProductDocumentUrl> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.get<Envelope<ProductDocumentUrl>>(
    `/customer/products/${productId}/documents/${documentId}/url`,
  );
  const data = payload.data.data;
  if (!data?.url) {
    throw new Error('Document URL unavailable');
  }
  return data;
}

export type SellerGrade = {
  id: string;
  code: string;
  name: string;
  displayName?: string;
  gradeNo?: string | null;
  gradeGroup?: string | null;
  manufacturer?: string | null;
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

export function mergeLiveCatalogCache(products: MarketProduct[]) {
  const known = new Set(liveCatalogCache.map((product) => product.id));
  liveCatalogCache = [...liveCatalogCache, ...products.filter((product) => !known.has(product.id))];
}

export function getLiveCatalogProduct(id?: string | null): MarketProduct | undefined {
  if (!id) return undefined;
  return liveCatalogCache.find(
    (product) => product.id === id || product.gradeCode === id || product.grade === id,
  );
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
    gradeId: grade.id,
    gradeNo: grade.gradeNo ?? undefined,
    manufacturer: grade.manufacturer ?? undefined,
    masterCategoryId: grade.category?.id,
    masterCategoryName: grade.category?.name,
    categoryId: PARENT_FROM_GROUP[grade.category?.parentGroup ?? ''] ?? 'polymers',
    materialType: material,
    subCategory: grade.gradeGroup ?? undefined,
    description: grade.manufacturer ? `${grade.name} · ${grade.manufacturer}` : grade.name,
    applications: [],
    technicalSpecs: {},
    creditEligible: false,
  };
}
