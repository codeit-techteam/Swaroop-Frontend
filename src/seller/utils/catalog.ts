import { getBlindGradeById } from '@/constants/blind-grades';
import { getMaterialFamilyByName } from '@/constants/materials-taxonomy';
import type {
  InventoryCategory,
  SellerPaymentPricing,
  SellerPricingTier,
  SellerProduct,
  SellerProductForm,
  SellerTechnicalSpecs,
} from '@/seller/types';
import type { MarketParentCategoryId, MarketProduct } from '@/types/market';

const ORIGIN_MAP: Array<{ match: string; value: string }> = [
  { match: 'india', value: 'India' },
  { match: 'uae', value: 'UAE' },
  { match: 'saudi', value: 'Saudi Arabia' },
  { match: 'singapore', value: 'Singapore' },
  { match: 'china', value: 'China' },
  { match: 'thailand', value: 'Thailand' },
  { match: 'ksa', value: 'KSA' },
  { match: 'usa', value: 'USA' },
];

export function formatCatalogPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

export function formatCatalogKgPrice(price: number): string {
  return `₹${(price / 1000).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function catalogOriginToSeller(origin: string): string {
  const normalized = origin.toLowerCase();
  const match = ORIGIN_MAP.find((item) => normalized.includes(item.match));
  return match?.value ?? 'India';
}

export function catalogParentToInventoryCategory(
  categoryId?: MarketParentCategoryId | string,
): InventoryCategory {
  if (categoryId === 'chemicals') {
    return 'Chemicals';
  }
  if (categoryId === 'additives') {
    return 'Speciality';
  }
  if (categoryId === 'base-oils') {
    return 'Lubricants';
  }
  return 'Polymer';
}

export function findSellerListingForCatalog(
  products: SellerProduct[],
  catalogId: string,
  gradeCode?: string,
): SellerProduct | undefined {
  return products.find((product) => {
    if (product.form.catalogProductId && product.form.catalogProductId === catalogId) {
      return true;
    }
    if (gradeCode && product.form.grade === gradeCode) {
      return true;
    }
    return false;
  });
}

const stripSpecUnit = (value?: string): string => {
  if (!value) {
    return '';
  }
  return value.replace(/\s*g\/10 min/i, '').replace(/\s*g\/cm[³3]/i, '').trim();
};

export type CatalogEditorPatch = {
  form: Partial<SellerProductForm>;
  pricing: SellerPaymentPricing;
  technicalSpecs: Partial<SellerTechnicalSpecs>;
  tiers: SellerPricingTier[];
};

export function buildEditorFromCatalog(product: MarketProduct): CatalogEditorPatch {
  const advance = String(product.price);
  const onLoading = String(Math.round(product.price * 1.01));
  const onDelivery = String(Math.round(product.price * 1.02));
  const credit15Days = String(Math.round(product.price * 1.04));
  const credit30Days = String(Math.round(product.price * 1.05));
  const family = getMaterialFamilyByName(product.materialType || product.category);

  return {
    form: {
      catalogProductId: product.id,
      name: product.name,
      grade: product.gradeCode || product.grade,
      category: product.materialType || product.category,
      polymerType: family?.code === 'PP' ? 'PP' : product.grade || product.materialType || '',
      origin: catalogOriginToSeller(product.origin),
      description: product.description || '',
      moq: String(product.moq),
    },
    pricing: {
      advance,
      onLoading,
      onDelivery,
      credit15Days,
      credit30Days,
    },
    technicalSpecs: {
      mfi: stripSpecUnit(product.technicalSpecs?.mfi),
      density: stripSpecUnit(product.technicalSpecs?.density),
      primaryApplication: product.applications?.slice(0, 2).join(', ') || product.subCategory || '',
    },
    tiers: [
      {
        id: 'tier-1',
        minQty: '1',
        maxQty: String(product.moq),
        price: advance,
        discountLabel: 'Standard',
      },
      {
        id: 'tier-2',
        minQty: String(product.moq),
        maxQty: String(Math.max(product.moq * 3, 30)),
        price: String(Math.round(product.price * 0.98)),
        discountLabel: 'Volume',
      },
      {
        id: 'tier-3',
        minQty: String(Math.max(product.moq * 3, 30)),
        maxQty: '',
        price: String(Math.round(product.price * 0.96)),
        discountLabel: 'Contract',
      },
    ],
  };
}

export function buildEditorFromCatalogId(catalogId: string): CatalogEditorPatch | null {
  const product = getBlindGradeById(catalogId);
  if (!product) {
    return null;
  }
  return buildEditorFromCatalog(product);
}

export function matchCatalogForLegacyForm(form: SellerProductForm): MarketProduct | undefined {
  if (form.catalogProductId) {
    return getBlindGradeById(form.catalogProductId);
  }

  const haystack = `${form.name} ${form.grade}`.toLowerCase();
  if (haystack.includes('pe100')) {
    return getBlindGradeById('mkt-hdpe-pipe');
  }

  return undefined;
}
