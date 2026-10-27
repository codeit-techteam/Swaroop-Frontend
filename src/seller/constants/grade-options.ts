export const SELLER_PACKAGING_TYPES = ['25 kg bags', 'Jumbo bags', 'Palletized bags'] as const;

/** Canonical origin labels — aliases like KSA map to Saudi Arabia (S-13). */
export const SELLER_ORIGIN_OPTIONS = [
  'India',
  'UAE',
  'Saudi Arabia',
  'Singapore',
  'China',
  'Thailand',
  'USA',
] as const;

export type SellerOriginOption = (typeof SELLER_ORIGIN_OPTIONS)[number];

const ORIGIN_ALIASES: Record<string, SellerOriginOption> = {
  india: 'India',
  uae: 'UAE',
  'united arab emirates': 'UAE',
  'saudi arabia': 'Saudi Arabia',
  saudi: 'Saudi Arabia',
  ksa: 'Saudi Arabia',
  'kingdom of saudi arabia': 'Saudi Arabia',
  singapore: 'Singapore',
  china: 'China',
  thailand: 'Thailand',
  usa: 'USA',
  'united states': 'USA',
  'united states of america': 'USA',
};

/** Map free-text / alias origins onto the single Select-origin label. */
export function normalizeSellerOrigin(origin: string | null | undefined): SellerOriginOption {
  const trimmed = (origin ?? '').trim();
  if (!trimmed) return 'India';

  const key = trimmed.toLowerCase();
  const alias = ORIGIN_ALIASES[key];
  if (alias) return alias;

  const exact = SELLER_ORIGIN_OPTIONS.find((option) => option.toLowerCase() === key);
  if (exact) return exact;

  const fuzzy = Object.entries(ORIGIN_ALIASES).find(([match]) => key.includes(match));
  return fuzzy?.[1] ?? 'India';
}

export const SELLER_UNIT_OPTIONS = ['MT', 'kg'] as const;

export const SELLER_PAYMENT_TERM_PRICE_FIELDS = [
  { key: 'sellingPrice', label: 'Selling Price (₹/MT)' },
] as const;
