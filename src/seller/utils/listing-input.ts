import { normalizeSellerOrigin } from '@/seller/constants/grade-options';
import type { SellerProductSnapshot } from '@/seller/types';
import type { CreateMarketplaceListingInput } from '@/services/seller-products';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Backend rows use UUIDs; local-only drafts use `seller-product-…` ids. */
export const isBackendId = (value?: string | null): value is string =>
  Boolean(value && UUID_RE.test(value));

const positiveNumber = (value: string): number => {
  const n = Number(String(value).trim());
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Invalid positive number: ${value}`);
  }
  return n;
};

const nonNegativeNumber = (value: string): number => {
  const n = Number(String(value).trim());
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`Invalid non-negative number: ${value}`);
  }
  return n;
};

/** Safe parse for optional UI fields that may still be empty before publish. */
const positiveNumberOrZero = (value: string): number => {
  const trimmed = String(value).trim();
  if (!trimmed) return 0;
  const n = Number(trimmed);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

type ListingSource = Pick<SellerProductSnapshot, 'form' | 'pricing' | 'tiers' | 'technicalSpecs'>;

/** The backend listing needs a Grade Master id and a selling price; drafts without them stay on the device. */
export const canSaveListingToBackend = (snapshot: ListingSource): boolean => {
  if (!isBackendId(snapshot.form.catalogProductId)) return false;
  const price = Number(String(snapshot.pricing.sellingPrice).trim());
  const moq = Number(String(snapshot.form.moq).trim());
  const stock = Number(String(snapshot.form.availableQty).trim() || '0');
  return (
    Number.isFinite(price) &&
    price > 0 &&
    Number.isFinite(moq) &&
    moq > 0 &&
    Number.isFinite(stock) &&
    stock >= 0
  );
};

export const buildListingInput = (
  snapshot: ListingSource,
  publish: boolean,
): CreateMarketplaceListingInput => {
  const { form, technicalSpecs, tiers, pricing } = snapshot;
  const optional = (value: string) => value.trim() || undefined;
  const priceTiers = tiers
    .map((tier) => {
      const price = positiveNumberOrZero(tier.price);
      const maxParsed = tier.maxQty.trim() ? Number(tier.maxQty) : null;
      return {
        minQty: Number(tier.minQty),
        // Never persist maxQty 0 — it renders as "1-0 MT" and breaks open-ended tiers.
        maxQty:
          maxParsed !== null && Number.isFinite(maxParsed) && maxParsed > 0
            ? maxParsed
            : null,
        price,
        label: optional(tier.discountLabel),
      };
    })
    .filter(
      (tier) =>
        Number.isFinite(tier.minQty) &&
        tier.minQty >= 0 &&
        tier.price > 0 &&
        (tier.maxQty === null || Number.isFinite(tier.maxQty)),
    );

  const moq = positiveNumber(form.moq);
  const availableStock = nonNegativeNumber(form.availableQty || '0');
  if (moq > availableStock && availableStock > 0) {
    throw new Error('MOQ cannot exceed available stock');
  }

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
    countryOfOrigin: optional(
      form.origin ? normalizeSellerOrigin(form.origin) : form.origin,
    ),
    application: optional(technicalSpecs.primaryApplication),
    polymerType: optional(form.polymerType),
    warehouseName: optional(form.warehouseLocation),
    availableStock,
    reservedStock: nonNegativeNumber(form.reservedQty || '0'),
    moq,
    sellingPrice: positiveNumber(pricing.sellingPrice),
    priceTiers: priceTiers.length ? priceTiers : undefined,
    description: optional(form.description),
    publishToMarketplace: publish,
    catalogProductId: form.catalogProductId,
    gstPercent: positiveNumberOrZero(form.gstPercent) || undefined,
  };
};
