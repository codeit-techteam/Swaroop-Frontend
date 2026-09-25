import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';
import type {
  SellerProduct,
  SellerProductForm,
  SellerProductStatus,
  SellerPricingTier,
  SellerTechnicalSpecs,
} from '@/seller/types';

type Envelope<T> = {
  success?: boolean;
  data: T;
  meta?: { total?: number; totalPages?: number; page?: number; limit?: number };
  message?: string;
};

export type SellerGradeOption = {
  id: string;
  code: string;
  name: string;
  displayName?: string;
  category?: { id: string; code: string; name: string } | null;
};

type BackendPriceTier = {
  id?: string;
  minQty?: number | string;
  maxQty?: number | string | null;
  price?: number | string;
  label?: string;
};

type BackendSellerProduct = {
  id: string;
  code?: string;
  name?: string;
  brand?: string | null;
  manufacturer?: string | null;
  mfi?: string | null;
  density?: string | null;
  packaging?: string | null;
  unit?: string;
  status?: string;
  countryOfOrigin?: string | null;
  technicalSpecs?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
  offerId?: string;
  inventoryId?: string;
  published?: boolean;
  imageUrl?: string | null;
  grade?: {
    id?: string;
    code?: string;
    name?: string;
    category?: { name?: string; code?: string } | null;
  };
  inventory?: Array<{
    id?: string;
    availableQty?: number | string;
    reservedQty?: number | string;
    allocatedQty?: number | string;
    warehouse?: { id?: string; name?: string; city?: string } | null;
  }>;
  offers?: Array<{
    id?: string;
    basePrice?: number | string;
    moq?: number | string;
    quantity?: number | string;
    status?: string;
    deliveryTerms?: string | null;
    inventoryId?: string | null;
    priceTiers?: BackendPriceTier[];
  }>;
};

export type CreateMarketplaceListingInput = {
  gradeId: string;
  name: string;
  code: string;
  manufacturer?: string;
  brand?: string;
  mfi?: string;
  density?: string;
  packaging?: string;
  unit?: string;
  countryOfOrigin?: string;
  supplyOrigin?: string;
  application?: string;
  polymerType?: string;
  warehouseName?: string;
  availableStock: number;
  reservedStock?: number;
  moq: number;
  sellingPrice: number;
  priceTiers?: Array<{
    minQty: number;
    maxQty?: number | null;
    price: number;
    label?: string;
  }>;
  notes?: string;
  publishToMarketplace?: boolean;
  catalogProductId?: string;
  gstPercent?: number;
  description?: string;
};

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function str(value: unknown, fallback = ''): string {
  if (value == null) return fallback;
  const s = String(value).trim();
  return s || fallback;
}

async function withSellerSession<T>(fn: () => Promise<T>): Promise<T> {
  await ensureDevBackendSession('seller');
  return fn();
}

function mapProductStatus(
  offerStatus?: string,
  productStatus?: string,
  published?: boolean,
): SellerProductStatus {
  const key = (offerStatus ?? productStatus ?? '').toUpperCase();
  if (key === 'ACTIVE' || published === true) return 'published';
  if (key === 'PAUSED' || key === 'INACTIVE' || key === 'CLOSED' || key === 'REJECTED') {
    return 'inactive';
  }
  if (key === 'DRAFT' || key === 'PENDING_REVIEW' || key === 'NEED_CHANGES') return 'draft';
  if (productStatus?.toLowerCase() === 'inactive') return 'inactive';
  return published ? 'published' : 'draft';
}

function mapTiers(tiers: BackendPriceTier[] | undefined, basePrice: number): SellerPricingTier[] {
  if (!tiers?.length) {
    return [
      {
        id: 'tier-1',
        minQty: '1',
        maxQty: '',
        price: String(basePrice || ''),
        discountLabel: 'Standard',
      },
    ];
  }
  return tiers.map((tier, index) => {
    const price = num(tier.price, basePrice);
    const discount =
      basePrice > 0 && price < basePrice
        ? `Save ₹${Math.round(basePrice - price)}/MT`
        : str(tier.label, index === 0 ? 'Standard' : `Tier ${index + 1}`);
    return {
      id: str(tier.id, `tier-${index + 1}`),
      minQty: String(num(tier.minQty, 1)),
      maxQty: tier.maxQty == null || tier.maxQty === '' ? '' : String(num(tier.maxQty)),
      price: String(price),
      discountLabel: discount,
    };
  });
}

function mapMobileProduct(item: BackendSellerProduct): SellerProduct {
  const offer = item.offers?.[0];
  const inventory = item.inventory?.[0];
  const specs = (item.technicalSpecs ?? {}) as Record<string, unknown>;
  const metadata = (item.metadata ?? {}) as Record<string, unknown>;
  const basePrice = num(offer?.basePrice);
  const availableQty = num(inventory?.availableQty ?? offer?.quantity);
  const reservedQty = num(inventory?.reservedQty);
  const application =
    str(specs.application) ||
    (Array.isArray(specs.applications) ? str(specs.applications[0]) : '') ||
    str(item.grade?.name);

  const form: SellerProductForm = {
    name: str(item.name, 'Product'),
    grade: str(item.code ?? item.grade?.code),
    category: str(item.grade?.category?.name ?? item.grade?.name, 'Grade'),
    brand: str(item.manufacturer ?? item.brand, 'PRIVATE'),
    origin: str(item.countryOfOrigin, 'India'),
    description: str(metadata.notes ?? metadata.description),
    availableQty: String(availableQty),
    moq: String(num(offer?.moq)),
    warehouseLocation: str(
      inventory?.warehouse?.name ??
        (typeof specs.warehouseLabel === 'string' ? specs.warehouseLabel : ''),
    ),
    polymerType:
      str(specs.polymerType) ||
      str(item.grade?.category?.code ?? item.grade?.code),
    packagingType: str(item.packaging, '25 kg bags'),
    unit: item.unit === 'kg' ? 'kg' : 'MT',
    currency: 'INR',
    gstPercent: String(num(metadata.gstPercent, 18)),
    reservedQty: String(reservedQty),
    catalogProductId: str(metadata.catalogProductId),
  };

  const technicalSpecs: SellerTechnicalSpecs = {
    mfi: str(item.mfi ?? specs.mfi),
    density: str(item.density ?? specs.density),
    primaryApplication: application,
    technicalDatasheetName: str(metadata.technicalDatasheetName),
    qualityCertificateName: str(metadata.qualityCertificateName),
  };

  return {
    id: item.id,
    productId: str(item.code, item.id),
    status: mapProductStatus(offer?.status, item.status, item.published),
    createdAt: item.createdAt ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
    imageUrl: str(item.imageUrl),
    form,
    pricing: { sellingPrice: String(basePrice || '') },
    tiers: mapTiers(offer?.priceTiers, basePrice),
    technicalSpecs,
  };
}

function listingBody(input: CreateMarketplaceListingInput) {
  return {
    gradeId: input.gradeId,
    code: input.code,
    name: input.name,
    manufacturer: input.manufacturer,
    brand: input.brand ?? input.manufacturer,
    mfi: input.mfi,
    density: input.density,
    packaging: input.packaging,
    unit: input.unit ?? 'MT',
    countryOfOrigin: input.countryOfOrigin,
    supplyOrigin: input.supplyOrigin ?? input.countryOfOrigin,
    application: input.application,
    polymerType: input.polymerType,
    warehouseName: input.warehouseName,
    availableStock: input.availableStock,
    reservedStock: input.reservedStock ?? 0,
    moq: input.moq,
    sellingPrice: input.sellingPrice,
    priceTiers: input.priceTiers,
    notes: input.notes ?? input.description,
    publishToMarketplace: input.publishToMarketplace ?? true,
    technicalSpecs: {
      ...(input.application ? { application: input.application } : {}),
      ...(input.polymerType ? { polymerType: input.polymerType } : {}),
      ...(input.application ? { applications: [input.application] } : {}),
    },
    metadata: {
      ...(input.catalogProductId ? { catalogProductId: input.catalogProductId } : {}),
      ...(input.gstPercent != null ? { gstPercent: input.gstPercent } : {}),
      ...(input.description ? { description: input.description } : {}),
    },
  };
}

export async function fetchSellerGrades(): Promise<SellerGradeOption[]> {
  return withSellerSession(async () => {
    const pages: SellerGradeOption[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const payload = await apiClient.get<Envelope<SellerGradeOption[]>>(
        '/master-data/grades/seller',
        { params: { page, limit: 100, sortBy: 'sortOrder', sortOrder: 'asc' } },
      );
      pages.push(...(payload.data.data ?? []));
      const total = payload.data.meta?.total ?? pages.length;
      totalPages = Math.max(1, Math.ceil(total / 100));
      page += 1;
    } while (page <= totalPages && page <= 10);
    return pages;
  });
}

export async function fetchSellerProducts(): Promise<SellerProduct[]> {
  return withSellerSession(async () => {
    const pages: SellerProduct[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const payload = await apiClient.get<Envelope<BackendSellerProduct[]>>(
        '/seller/products',
        { params: { page, limit: 100 } },
      );
      pages.push(...(payload.data.data ?? []).map(mapMobileProduct));
      totalPages = payload.data.meta?.totalPages ?? 1;
      page += 1;
    } while (page <= totalPages && page <= 10);
    return pages;
  });
}

export async function fetchSellerProduct(id: string): Promise<SellerProduct> {
  return withSellerSession(async () => {
    const payload = await apiClient.get<Envelope<BackendSellerProduct>>(
      `/seller/products/${id}`,
    );
    const row = payload.data.data;
    if (!row) {
      throw new Error(payload.data.message ?? 'Product not found');
    }
    return mapMobileProduct(row);
  });
}

export async function createSellerListing(
  input: CreateMarketplaceListingInput,
): Promise<SellerProduct> {
  return withSellerSession(async () => {
    const payload = await apiClient.post<Envelope<BackendSellerProduct>>(
      '/seller/products/listings',
      listingBody(input),
    );
    const row = payload.data.data;
    if (!row) {
      throw new Error(payload.data.message ?? 'Failed to create listing');
    }
    return mapMobileProduct(row);
  });
}

export async function updateSellerListing(
  id: string,
  input: CreateMarketplaceListingInput,
): Promise<SellerProduct> {
  return withSellerSession(async () => {
    const payload = await apiClient.patch<Envelope<BackendSellerProduct>>(
      `/seller/products/listings/${id}`,
      listingBody(input),
    );
    const row = payload.data.data;
    if (!row) {
      throw new Error(payload.data.message ?? 'Failed to update listing');
    }
    return mapMobileProduct(row);
  });
}

export async function adjustSellerInventory(input: {
  inventoryId: string;
  quantityDelta: number;
  notes?: string;
}): Promise<unknown> {
  return withSellerSession(async () => {
    const payload = await apiClient.post(
      `/seller/inventory/${input.inventoryId}/adjust`,
      {
        quantityDelta: input.quantityDelta,
        type: 'ADJUSTMENT',
        notes: input.notes ?? 'Stock adjustment from seller app',
      },
    );
    return (payload.data as Envelope<unknown>).data;
  });
}

export { mapMobileProduct };
