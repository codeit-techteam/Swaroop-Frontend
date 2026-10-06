import { STORAGE_KEYS } from '@/constants';
import type {
  SellerPricingTier,
  SellerProduct,
  SellerProductForm,
  SellerProductSnapshot,
  SellerTechnicalSpecs,
} from '@/seller/types';
import { matchCatalogForLegacyForm } from '@/seller/utils/catalog';
import { buildListingInput, isBackendId } from '@/seller/utils/listing-input';
import { createEmptyPricing, normalizeSellerPricing } from '@/seller/utils/pricing';
import { mergeApiProductsWithDeviceDrafts } from '@/seller/utils/product-merge';
import {
  createSellerListing,
  fetchSellerProducts,
  updateSellerListing,
} from '@/services/seller-products';
import { getStorageItem, setStorageItem } from '@/utils/storage';

const safeParse = <T>(value: string | undefined, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const createEmptyProductForm = (): SellerProductForm => ({
  name: '',
  grade: '',
  category: '',
  brand: '',
  origin: 'India',
  description: '',
  availableQty: '',
  moq: '',
  warehouseLocation: '',
  polymerType: '',
  packagingType: '25 kg bags',
  unit: 'MT',
  currency: 'INR',
  gstPercent: '18',
  reservedQty: '0',
  catalogProductId: '',
});

export { createEmptyPricing };

export const createDefaultTiers = (): SellerPricingTier[] => [
  {
    id: 'tier-1',
    minQty: '1',
    maxQty: '10',
    price: '145',
    discountLabel: 'Standard',
  },
  {
    id: 'tier-2',
    minQty: '10',
    maxQty: '50',
    price: '142',
    discountLabel: 'Save ₹3/MT',
  },
  {
    id: 'tier-3',
    minQty: '50',
    maxQty: '',
    price: '139',
    discountLabel: 'Save ₹6/MT',
  },
];

export const createEmptyTechnicalSpecs = (): SellerTechnicalSpecs => ({
  mfi: '',
  density: '',
  primaryApplication: '',
  technicalDatasheetName: '',
  qualityCertificateName: '',
});

export const buildDefaultSellerProductSnapshot = (): SellerProductSnapshot => {
  return {
    products: [],
    draftProducts: [],
    publishedProducts: [],
    inactiveProducts: [],
    selectedProductId: null,
    form: createEmptyProductForm(),
    pricing: createEmptyPricing(),
    tiers: createDefaultTiers(),
    technicalSpecs: createEmptyTechnicalSpecs(),
    dashboardStats: [
      { id: 'new-orders', label: 'New Orders', value: 8 },
      { id: 'pending-accept', label: 'Pending Accept', value: 3 },
      { id: 'active-offers', label: 'Active Offers', value: 3 },
      { id: 'dispatched', label: 'Dispatched', value: 5 },
    ],
    shipments: [
      {
        id: 'shipment-1',
        shipmentId: 'SHP-90214',
        route: 'Mumbai -> Pune',
        status: 'On Time',
        eta: 'Today, 6:30 PM',
      },
      {
        id: 'shipment-2',
        shipmentId: 'SHP-88321',
        route: 'Panipat -> Kandla',
        status: 'In Transit',
        eta: 'Tomorrow, 9:00 AM',
      },
      {
        id: 'shipment-3',
        shipmentId: 'SHP-77210',
        route: 'Jamnagar -> Vizag',
        status: 'On Time',
        eta: 'Today, 11:45 PM',
      },
    ],
    revenueToday: '₹24.5L',
    revenueDelta: '+12%',
    pendingSettlement: '₹1.2Cr',
    overdueCount: 4,
  };
};

/** Prefer live seller catalog when available; falls back to local snapshot. */
export const fetchSellerProductsFromApi = async (): Promise<SellerProduct[]> => {
  return fetchSellerProducts();
};

export const getSellerProductSnapshot = (): SellerProductSnapshot => {
  const snapshot = safeParse(
    getStorageItem(STORAGE_KEYS.SELLER_PRODUCT_STATE),
    buildDefaultSellerProductSnapshot(),
  );
  const withFormDefaults = (form: SellerProductForm): SellerProductForm => {
    const merged = {
      ...createEmptyProductForm(),
      ...form,
    };
    if (merged.catalogProductId) {
      return merged;
    }
    const matched = matchCatalogForLegacyForm(merged);
    if (!matched) {
      return merged;
    }
    return {
      ...merged,
      catalogProductId: matched.id,
      name: merged.name || matched.name,
      grade: matched.gradeCode || merged.grade,
      category: matched.materialType || merged.category,
      polymerType: matched.grade || merged.polymerType,
    };
  };
  const products = snapshot.products.map((product) => ({
    ...product,
    form: withFormDefaults(product.form),
    pricing: normalizeSellerPricing(product.pricing),
  }));

  return {
    ...snapshot,
    form: withFormDefaults(snapshot.form),
    pricing: normalizeSellerPricing(snapshot.pricing),
    pendingSettlement:
      snapshot.pendingSettlement ??
      (snapshot as SellerProductSnapshot & { creditReceivables?: string }).creditReceivables ??
      '₹0',
    products,
    draftProducts: products.filter((item) => item.status === 'draft'),
    publishedProducts: products.filter((item) => item.status === 'published'),
    inactiveProducts: products.filter((item) => item.status === 'inactive'),
  };
};

export const persistSellerProductSnapshot = (snapshot: SellerProductSnapshot): void => {
  setStorageItem(STORAGE_KEYS.SELLER_PRODUCT_STATE, JSON.stringify(snapshot));
};

const buildId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const buildProductId = (): string => `PT-PROD-${String(Date.now()).slice(-6)}`;

export const createProduct = (
  snapshot: SellerProductSnapshot,
  status: 'draft' | 'published',
): { snapshot: SellerProductSnapshot; product: SellerProduct } => {
  const now = new Date().toISOString();
  const product: SellerProduct = {
    id: buildId('seller-product'),
    productId: buildProductId(),
    status,
    createdAt: now,
    updatedAt: now,
    imageUrl: '',
    form: { ...snapshot.form },
    pricing: { ...snapshot.pricing },
    tiers: snapshot.tiers.map((tier) => ({ ...tier })),
    technicalSpecs: { ...snapshot.technicalSpecs },
  };

  return upsertProduct(snapshot, product);
};

export const updateProduct = (
  snapshot: SellerProductSnapshot,
  productId: string,
  status: 'draft' | 'published',
): { snapshot: SellerProductSnapshot; product: SellerProduct } => {
  const existing = snapshot.products.find((item) => item.id === productId);
  if (!existing) {
    return createProduct(snapshot, status);
  }

  const product: SellerProduct = {
    ...existing,
    status,
    updatedAt: new Date().toISOString(),
    form: { ...snapshot.form },
    pricing: { ...snapshot.pricing },
    tiers: snapshot.tiers.map((tier) => ({ ...tier })),
    technicalSpecs: { ...snapshot.technicalSpecs },
  };

  return upsertProduct(snapshot, product);
};

export const saveDraft = (snapshot: SellerProductSnapshot, selectedProductId: string | null) =>
  selectedProductId
    ? updateProduct(snapshot, selectedProductId, 'draft')
    : createProduct(snapshot, 'draft');

/**
 * Creates or updates the listing on the backend (product + inventory + offer)
 * and replaces the local entry with the saved backend product.
 */
export const saveListingToBackend = async (
  snapshot: SellerProductSnapshot,
  selectedProductId: string | null,
  publish: boolean,
): Promise<{ snapshot: SellerProductSnapshot; product: SellerProduct }> => {
  const input = buildListingInput(snapshot, publish);
  const saved = isBackendId(selectedProductId)
    ? await updateSellerListing(selectedProductId, input)
    : await createSellerListing(input);
  const products = snapshot.products.filter(
    (item) => item.id !== selectedProductId && item.id !== saved.id,
  );
  return {
    product: saved,
    snapshot: reconcileCollections({
      ...snapshot,
      products: [saved, ...products],
      selectedProductId: saved.id,
    }),
  };
};

export const getProducts = (snapshot: SellerProductSnapshot): SellerProduct[] => snapshot.products;

export const deleteProduct = (
  snapshot: SellerProductSnapshot,
  productId: string,
): SellerProductSnapshot => {
  const products = snapshot.products.filter((item) => item.id !== productId);
  return reconcileCollections({
    ...snapshot,
    products,
    selectedProductId: snapshot.selectedProductId === productId ? null : snapshot.selectedProductId,
  });
};

export const duplicateProduct = (
  snapshot: SellerProductSnapshot,
  productId: string,
): SellerProductSnapshot => {
  const product = snapshot.products.find((item) => item.id === productId);
  if (!product) {
    return snapshot;
  }

  const now = new Date().toISOString();
  const duplicate: SellerProduct = {
    ...product,
    id: buildId('seller-product'),
    productId: buildProductId(),
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    form: {
      ...product.form,
      name: `Copy of ${product.form.name}`,
    },
  };

  return reconcileCollections({
    ...snapshot,
    products: [duplicate, ...snapshot.products],
  });
};

export const deactivateProduct = (
  snapshot: SellerProductSnapshot,
  productId: string,
): SellerProductSnapshot => {
  const products = snapshot.products.map((item) =>
    item.id === productId
      ? { ...item, status: 'inactive' as const, updatedAt: new Date().toISOString() }
      : item,
  );
  return reconcileCollections({ ...snapshot, products });
};

export const updateStock = (
  snapshot: SellerProductSnapshot,
  productId: string,
  newStock: string,
  warehouse: string,
): SellerProductSnapshot => {
  const products = snapshot.products.map((item) =>
    item.id === productId
      ? {
          ...item,
          updatedAt: new Date().toISOString(),
          form: {
            ...item.form,
            availableQty: newStock,
            warehouseLocation: warehouse || item.form.warehouseLocation,
          },
        }
      : item,
  );
  return reconcileCollections({ ...snapshot, products });
};

export const loadProductIntoEditor = (
  snapshot: SellerProductSnapshot,
  productId: string,
): SellerProductSnapshot => {
  const product = snapshot.products.find((item) => item.id === productId);
  if (!product) {
    return snapshot;
  }

  return {
    ...snapshot,
    selectedProductId: product.id,
    form: { ...createEmptyProductForm(), ...product.form },
    pricing: normalizeSellerPricing(product.pricing),
    tiers: product.tiers.map((tier) => ({ ...tier })),
    technicalSpecs: { ...product.technicalSpecs },
  };
};

export const resetEditorState = (snapshot: SellerProductSnapshot): SellerProductSnapshot => ({
  ...snapshot,
  selectedProductId: null,
  form: createEmptyProductForm(),
  pricing: createEmptyPricing(),
  tiers: createDefaultTiers().map((tier) => ({ ...tier })),
  technicalSpecs: createEmptyTechnicalSpecs(),
});

export const createNextTier = (tiers: SellerPricingTier[]): SellerPricingTier => {
  const lastTier = tiers[tiers.length - 1];
  const minQty = String(Math.max(Number(lastTier?.maxQty || lastTier?.minQty || '1'), 1));
  return {
    id: buildId('tier'),
    minQty,
    maxQty: '',
    price: '',
    discountLabel: `Tier ${tiers.length + 1}`,
  };
};

const upsertProduct = (
  snapshot: SellerProductSnapshot,
  product: SellerProduct,
): { snapshot: SellerProductSnapshot; product: SellerProduct } => {
  const exists = snapshot.products.some((item) => item.id === product.id);
  const products = exists
    ? snapshot.products.map((item) => (item.id === product.id ? product : item))
    : [product, ...snapshot.products];

  return {
    product,
    snapshot: reconcileCollections({
      ...snapshot,
      products,
      selectedProductId: product.id,
    }),
  };
};

const reconcileCollections = (snapshot: SellerProductSnapshot): SellerProductSnapshot => {
  const products = [...snapshot.products].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return {
    ...snapshot,
    products,
    draftProducts: products.filter((item) => item.status === 'draft'),
    publishedProducts: products.filter((item) => item.status === 'published'),
    inactiveProducts: products.filter((item) => item.status === 'inactive'),
  };
};

/** Applies the backend list without wiping drafts that only exist on this device. */
export const applyApiProductsToSnapshot = (
  snapshot: SellerProductSnapshot,
  products: SellerProduct[],
): SellerProductSnapshot =>
  reconcileCollections({
    ...snapshot,
    products: mergeApiProductsWithDeviceDrafts(snapshot.products, products),
  });
