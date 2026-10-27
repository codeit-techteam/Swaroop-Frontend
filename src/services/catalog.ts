import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';
import { useAuthStore } from '@/store/auth-store';
import type { MarketProduct } from '@/types/market';
import {
  formatCategoryDisplayName,
  isInternalMasterCode,
} from '@/utils/master-label';

/** Guest browse uses public marketplace; signed-in customers keep customer paths. */
function productsApiBase(): '/public/marketplace/products' | '/customer/products' {
  return useAuthStore.getState().accessToken
    ? '/customer/products'
    : '/public/marketplace/products';
}

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
  manufacturer?: string | null;
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
    displayName?: string | null;
    fullGradeName?: string | null;
    gradeNo?: string | null;
    gradeGroup?: string | null;
    manufacturer?: string | null;
    category?: {
      id: string;
      code: string;
      name: string;
      displayName?: string | null;
      parentGroup?: string | null;
    } | null;
  } | null;
  documents?: BlindProductDocument[];
};

function num(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

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

function firstReadable(...candidates: Array<string | null | undefined>): string {
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value && !isInternalMasterCode(value)) return value;
  }
  // Fall back to a humanized snake_case label (S-14) when nothing else is readable.
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value) return formatCategoryDisplayName(value);
  }
  return '';
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

  const materialFromSpecs =
    typeof specs.materialType === 'string' ? specs.materialType.trim() : '';
  const subFromSpecs =
    typeof specs.subCategory === 'string' ? specs.subCategory.trim() : '';

  // Prefer commercial product name / specs over generic grade labels (B-05 / B-10 / N-05).
  const gradeFull = product.grade?.fullGradeName?.trim() || '';
  const gradeDisplay = product.grade?.displayName?.trim() || '';
  const productName = product.name?.trim() || '';
  const displayName =
    gradeFull ||
    (productName && (!gradeDisplay || productName.length > gradeDisplay.length)
      ? productName
      : '') ||
    firstReadable(gradeDisplay, product.grade?.name, productName) ||
    productName;

  const categoryIdFromGroup =
    PARENT_FROM_GROUP[product.grade?.category?.parentGroup ?? ''] ?? undefined;
  const categoryId =
    (typeof specs.parentCategoryId === 'string'
      ? (specs.parentCategoryId as MarketProduct['categoryId'])
      : undefined) ??
    categoryIdFromGroup ??
    'polymers';

  // Prefer human-readable category/group labels over raw enum codes (B-10 / N-05 / S-14).
  const readableCategory =
    firstReadable(
      product.grade?.category?.displayName,
      product.grade?.category?.name,
      materialFromSpecs,
      product.grade?.gradeGroup?.replace(/_/g, ' '),
      product.grade?.name,
      productName,
    ) || productName;

  // B-05: white MB must not show MASTERBATCH_BLACK — prefer White + Masterbatch from specs.
  const materialLabel = firstReadable(materialFromSpecs) || '';
  const readableBadgeLabel =
    firstReadable(
      subFromSpecs && materialLabel ? `${subFromSpecs} ${materialLabel}` : undefined,
      subFromSpecs,
      product.grade?.gradeNo,
      materialLabel,
      product.grade?.gradeGroup?.replace(/_/g, ' '),
      readableCategory,
    ) || readableCategory;

  const gradeCode = firstReadable(product.grade?.gradeNo, product.code) || product.code;

  return {
    id: product.id,
    name: displayName,
    grade: readableBadgeLabel,
    price: num(listing?.price),
    origin: String(specs.origin ?? product.countryOfOrigin ?? ''),
    stock: num(listing?.quantityAvailable),
    moq: num(listing?.moq),
    eta: String(listing?.leadTime ?? specs.eta ?? ''),
    category: readableCategory,
    badge: (typeof specs.badge === 'string' ? specs.badge : 'Best Value') as MarketProduct['badge'],
    image: '',
    gradeCode,
    gradeId: product.grade?.id,
    gradeNo: product.grade?.gradeNo ?? undefined,
    manufacturer:
      product.manufacturer ?? product.brand ?? product.grade?.manufacturer ?? undefined,
    masterCategoryId: product.grade?.category?.id,
    masterCategoryName: formatCategoryDisplayName(
      product.grade?.category?.displayName,
      product.grade?.category?.name,
      product.grade?.category?.code,
    ),
    categoryId,
    materialType: firstReadable(materialFromSpecs, readableCategory) || readableCategory,
    subCategory: subFromSpecs || undefined,
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

/** B-06: one card per commercially distinct listing (grade + price + MOQ + origin + ETA). */
export function dedupeMarketProducts(products: MarketProduct[]): MarketProduct[] {
  const byId = new Map<string, MarketProduct>();
  for (const product of products) {
    if (!byId.has(product.id)) byId.set(product.id, product);
  }
  const unique = [...byId.values()];
  const best = new Map<string, MarketProduct>();
  for (const product of unique) {
    const key = [
      product.gradeId || product.gradeCode || product.id,
      product.price,
      product.moq,
      (product.origin ?? '').trim().toLowerCase(),
      (product.warehouseLabel ?? '').trim().toLowerCase(),
      (product.eta ?? '').trim().toLowerCase().replace(/\s+/g, ''),
    ].join('::');
    const previous = best.get(key);
    if (!previous || product.stock > previous.stock) {
      best.set(key, product);
    }
  }
  const keep = new Set([...best.values()].map((product) => product.id));
  return unique.filter((product) => keep.has(product.id));
}

export async function fetchCustomerMarketplaceProducts(): Promise<MarketProduct[]> {
  const base = productsApiBase();
  if (base === '/customer/products') await ensureDevBackendSession('customer');
  const pages: BlindProduct[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const payload = await apiClient.get<Envelope<BlindProduct[]>>(base, {
      params: { page, limit: 100, sortBy: 'name', sortOrder: 'asc' },
    });
    const body = payload.data;
    pages.push(...(body.data ?? []));
    totalPages = body.meta?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages && page <= 10);
  const products = dedupeMarketProducts(pages.map(mapBlindProduct));
  setLiveCatalogCache(products);
  return products;
}

export async function fetchCustomerMarketplaceProduct(id: string): Promise<MarketProduct> {
  const base = productsApiBase();
  if (base === '/customer/products') await ensureDevBackendSession('customer');
  const payload = await apiClient.get<Envelope<BlindProduct>>(`${base}/${id}`);
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

export type GradeTdsDocument = BlindProductDocument & {
  productId?: string;
  productCode?: string | null;
  productName?: string | null;
  manufacturer?: string | null;
  downloadRequiresAuth?: boolean;
};

export type GradeTdsResponse = {
  grade: { id: string; code: string; name: string };
  available: boolean;
  message: string | null;
  items: GradeTdsDocument[];
};

/** TDS metadata — public for guests; customer marketplace when signed in. */
export async function fetchGradeTdsDocuments(gradeId: string): Promise<GradeTdsResponse> {
  const base = useAuthStore.getState().accessToken
    ? '/customer/marketplace'
    : '/public/marketplace';
  const payload = await apiClient.get<Envelope<GradeTdsResponse>>(
    `${base}/grades/${gradeId}/tds`,
  );
  return (
    payload.data.data ?? {
      grade: { id: gradeId, code: '', name: '' },
      available: false,
      message: 'TDS unavailable',
      items: [],
    }
  );
}

/** Document metadata is guest-readable; signed download URLs still require auth. */
export async function fetchProductDocuments(productId: string): Promise<BlindProductDocument[]> {
  const payload = await apiClient.get<Envelope<BlindProductDocument[]>>(
    `/public/marketplace/products/${productId}/documents`,
  );
  return payload.data.data ?? [];
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
