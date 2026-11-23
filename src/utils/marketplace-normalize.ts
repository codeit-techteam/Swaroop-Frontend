import type { CustomerGrade } from '@/types/grade-master';
import type { MarketProduct } from '@/types/market';

/**
 * Marketplace normalization for blind customer catalogue cards.
 *
 * Rules (stable IDs first — never dedupe by display name alone):
 * 1. Same catalogue `grade.id` → one grade row.
 * 2. Same live `product.id` or `offerId` → one listing row.
 * 3. Commercially identical blind cards (same grade + price + MOQ + origin + ETA)
 *    → keep the higher-stock listing. Different sellers with different commercial
 *    terms remain visible.
 *
 * Warehouse is intentionally excluded: Market ProductCards do not show warehouse,
 * so differing hub labels must not produce twin-looking cards.
 */

export type MarketplaceNormalizeReport = {
  catalogueInput: number;
  catalogueUnique: number;
  liveInput: number;
  liveUniqueById: number;
  liveUniqueCommercial: number;
  duplicateGradeIds: string[];
  duplicateProductIds: string[];
  duplicateOfferIds: string[];
  collapsedCommercialKeys: string[];
};

const normalizeText = (value: string | null | undefined): string =>
  (value ?? '').trim().toLowerCase().replace(/\s+/g, '');

/** Customer-visible commercial fingerprint for a live listing card. */
export function commercialListingKey(
  product: Pick<
    MarketProduct,
    'id' | 'gradeId' | 'gradeCode' | 'name' | 'price' | 'moq' | 'origin' | 'eta'
  >,
): string {
  const gradeKey = product.gradeId || product.gradeCode || product.name || product.id;
  return [
    gradeKey,
    Number(product.price) || 0,
    Number(product.moq) || 0,
    normalizeText(product.origin),
    normalizeText(product.eta),
  ].join('::');
}

export function deduplicateCatalogueGrades<T extends Pick<CustomerGrade, 'id'>>(
  grades: T[],
): T[] {
  const byId = new Map<string, T>();
  for (const grade of grades) {
    const id = grade.id?.trim();
    if (!id) continue;
    if (!byId.has(id)) byId.set(id, grade);
  }
  return [...byId.values()];
}

/**
 * Collapse live marketplace products to one card per product/offer id, then
 * one card per commercially identical blind fingerprint (keep higher stock).
 */
export function deduplicateLiveListings(products: MarketProduct[]): MarketProduct[] {
  const byProductId = new Map<string, MarketProduct>();
  for (const product of products) {
    const id = product.id?.trim();
    if (!id) continue;
    if (!byProductId.has(id)) byProductId.set(id, product);
  }

  const byOfferId = new Map<string, MarketProduct>();
  const withoutOffer: MarketProduct[] = [];
  for (const product of byProductId.values()) {
    const offerId = product.offerId?.trim();
    if (!offerId) {
      withoutOffer.push(product);
      continue;
    }
    const previous = byOfferId.get(offerId);
    if (!previous || product.stock > previous.stock) {
      byOfferId.set(offerId, product);
    }
  }

  const unique = [...byOfferId.values(), ...withoutOffer];
  const bestByCommercial = new Map<string, MarketProduct>();
  for (const product of unique) {
    const key = commercialListingKey(product);
    const previous = bestByCommercial.get(key);
    if (!previous || product.stock > previous.stock) {
      bestByCommercial.set(key, product);
    }
  }

  const keep = new Set([...bestByCommercial.values()].map((product) => product.id));
  return unique.filter((product) => keep.has(product.id));
}

/** Optional debug report — do not log in production builds. */
export function inspectMarketplaceDuplicates(
  grades: CustomerGrade[],
  products: MarketProduct[],
): MarketplaceNormalizeReport {
  const gradeIds = grades.map((grade) => grade.id).filter(Boolean);
  const productIds = products.map((product) => product.id).filter(Boolean);
  const offerIds = products
    .map((product) => product.offerId)
    .filter((id): id is string => Boolean(id?.trim()));

  const dupes = (ids: string[]): string[] => {
    const seen = new Set<string>();
    const out = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) out.add(id);
      else seen.add(id);
    }
    return [...out];
  };

  const uniqueGrades = deduplicateCatalogueGrades(grades);
  const byId = new Map<string, MarketProduct>();
  for (const product of products) {
    if (!byId.has(product.id)) byId.set(product.id, product);
  }
  const uniqueCommercial = deduplicateLiveListings(products);

  const commercialSeen = new Map<string, number>();
  const collapsed: string[] = [];
  for (const product of byId.values()) {
    const key = commercialListingKey(product);
    const count = (commercialSeen.get(key) ?? 0) + 1;
    commercialSeen.set(key, count);
    if (count === 2) collapsed.push(key);
  }

  return {
    catalogueInput: grades.length,
    catalogueUnique: uniqueGrades.length,
    liveInput: products.length,
    liveUniqueById: byId.size,
    liveUniqueCommercial: uniqueCommercial.length,
    duplicateGradeIds: dupes(gradeIds),
    duplicateProductIds: dupes(productIds),
    duplicateOfferIds: dupes(offerIds),
    collapsedCommercialKeys: collapsed,
  };
}
