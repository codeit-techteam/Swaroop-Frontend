import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';
import { useAuthStore } from '@/store/auth-store';
import type { MarketProduct } from '@/types/market';

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

  const displayName =
    product.grade?.fullGradeName?.trim() ||
    product.grade?.displayName?.trim() ||
    product.name;
  const categoryIdFromGroup =
    PARENT_FROM_GROUP[product.grade?.category?.parentGroup ?? ''] ?? undefined;
  const categoryId =
    (typeof specs.parentCategoryId === 'string'
      ? (specs.parentCategoryId as MarketProduct['categoryId'])
      : undefined) ??
    categoryIdFromGroup ??
    'polymers';

  return {
    id: product.id,
    name: displayName,
    grade: product.grade?.code ?? String(specs.materialType ?? product.code),
    price: num(listing?.price),
    origin: String(specs.origin ?? product.countryOfOrigin ?? ''),
    stock: num(listing?.quantityAvailable),
    moq: num(listing?.moq),
    eta: String(listing?.leadTime ?? specs.eta ?? ''),
    category: String(
      specs.materialType ?? product.grade?.category?.name ?? product.grade?.name ?? product.name,
    ),
    badge: (typeof specs.badge === 'string' ? specs.badge : 'Best Value') as MarketProduct['badge'],
    image: '',
    gradeCode: product.grade?.code ?? product.code,
    gradeId: product.grade?.id,
    gradeNo: product.grade?.gradeNo ?? undefined,
    manufacturer:
      product.manufacturer ?? product.brand ?? product.grade?.manufacturer ?? undefined,
    masterCategoryId: product.grade?.category?.id,
    masterCategoryName: product.grade?.category?.name,
    categoryId,
    materialType: String(
      specs.materialType ?? product.grade?.category?.name ?? product.grade?.name ?? product.name,
    ),
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
  const products = pages.map(mapBlindProduct);
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
