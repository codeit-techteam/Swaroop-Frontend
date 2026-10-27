import { getMaterialFamilyByName, materialsFromCatalog } from '@/constants/materials-taxonomy';
import { normalizeSellerOrigin } from '@/seller/constants/grade-options';
import type {
  InventoryCategory,
  SellerPaymentPricing,
  SellerPricingTier,
  SellerProduct,
  SellerProductForm,
  SellerTechnicalSpecs,
} from '@/seller/types';
import { defaultBulkTierMaxQty } from '@/seller/utils/bulk-tier-range';
import { positiveOrEmpty } from '@/seller/utils/numeric-input';
import { getLiveCatalogProduct } from '@/services/catalog';
import type { MarketParentCategoryId, MarketProduct } from '@/types/market';

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
  return normalizeSellerOrigin(origin);
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
  const sellingPrice = positiveOrEmpty(product.price);
  const moq = positiveOrEmpty(product.moq);
  const family = getMaterialFamilyByName(
    product.materialType || product.category,
    materialsFromCatalog([product]),
  );

  return {
    form: {
      catalogProductId: product.id,
      name: product.name,
      grade: product.gradeCode || product.grade,
      category: product.materialType || product.category,
      polymerType: family?.code === 'PP' ? 'PP' : product.grade || product.materialType || '',
      origin: catalogOriginToSeller(product.origin),
      description: product.description || '',
      moq,
    },
    pricing: {
      sellingPrice,
    },
    technicalSpecs: {
      mfi: stripSpecUnit(product.technicalSpecs?.mfi),
      density: stripSpecUnit(product.technicalSpecs?.density),
      primaryApplication: product.applications?.slice(0, 2).join(', ') || product.subCategory || '',
    },
    // Sensible closed range — never seed maxQty 0 / empty which rendered as "1-0 MT".
    tiers: [
      {
        id: 'tier-1',
        minQty: '1',
        maxQty: defaultBulkTierMaxQty(moq),
        price: sellingPrice,
        discountLabel: 'Standard',
      },
    ],
  };
}

export function buildEditorFromCatalogId(catalogId: string): CatalogEditorPatch | null {
  const product = getLiveCatalogProduct(catalogId);
  if (!product) {
    return null;
  }
  return buildEditorFromCatalog(product);
}

export function matchCatalogForLegacyForm(form: SellerProductForm): MarketProduct | undefined {
  if (form.catalogProductId) {
    return getLiveCatalogProduct(form.catalogProductId);
  }

  return undefined;
}
