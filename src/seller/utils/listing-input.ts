import type { SellerProductSnapshot } from '@/seller/types';
import type { CreateMarketplaceListingInput } from '@/services/seller-products';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Backend rows use UUIDs; local-only drafts use `seller-product-…` ids. */
export const isBackendId = (value?: string | null): value is string =>
  Boolean(value && UUID_RE.test(value));

const positiveNumber = (value: string): number => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const nonNegativeNumber = (value: string): number => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

type ListingSource = Pick<SellerProductSnapshot, 'form' | 'pricing' | 'tiers' | 'technicalSpecs'>;

/** The backend listing needs a Grade Master id and a selling price; drafts without them stay on the device. */
export const canSaveListingToBackend = (snapshot: ListingSource): boolean =>
  isBackendId(snapshot.form.catalogProductId) && positiveNumber(snapshot.pricing.sellingPrice) > 0;

export const buildListingInput = (
  snapshot: ListingSource,
  publish: boolean,
): CreateMarketplaceListingInput => {
  const { form, technicalSpecs, tiers, pricing } = snapshot;
  const optional = (value: string) => value.trim() || undefined;
  const priceTiers = tiers
    .map((tier) => ({
      minQty: Number(tier.minQty),
      maxQty: tier.maxQty.trim() ? Number(tier.maxQty) : null,
      price: positiveNumber(tier.price),
      label: optional(tier.discountLabel),
    }))
    .filter(
      (tier) =>
        Number.isFinite(tier.minQty) &&
        tier.minQty >= 0 &&
        tier.price > 0 &&
        (tier.maxQty === null || Number.isFinite(tier.maxQty)),
    );

  return {
    gradeId: form.catalogProductId,
    name: form.name.trim(),
    code: form.grade.trim(),
    manufacturer: optional(form.brand),
    brand: optional(form.brand),
    mfi: optional(technicalSpecs.mfi),
    density: optional(technicalSpecs.density),
    packaging: optional(form.packagingType),
    unit: form.unit || 'MT',
    countryOfOrigin: optional(form.origin),
    application: optional(technicalSpecs.primaryApplication),
    polymerType: optional(form.polymerType),
    warehouseName: optional(form.warehouseLocation),
    availableStock: nonNegativeNumber(form.availableQty),
    reservedStock: nonNegativeNumber(form.reservedQty),
    moq: nonNegativeNumber(form.moq),
    sellingPrice: positiveNumber(pricing.sellingPrice),
    priceTiers: priceTiers.length ? priceTiers : undefined,
    description: optional(form.description),
    publishToMarketplace: publish,
    catalogProductId: form.catalogProductId,
    gstPercent: positiveNumber(form.gstPercent) || undefined,
  };
};
