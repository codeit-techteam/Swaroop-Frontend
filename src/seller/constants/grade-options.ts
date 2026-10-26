export const SELLER_PACKAGING_TYPES = ['25 kg bags', 'Jumbo bags', 'Palletized bags'] as const;

/** Canonical origin labels — KSA maps to Saudi Arabia (S-13). */
export const SELLER_ORIGIN_OPTIONS = [
  'India',
  'UAE',
  'Saudi Arabia',
  'Singapore',
  'China',
  'Thailand',
  'USA',
] as const;

export const SELLER_UNIT_OPTIONS = ['MT', 'kg'] as const;

export const SELLER_PAYMENT_TERM_PRICE_FIELDS = [
  { key: 'sellingPrice', label: 'Selling Price (₹/MT)' },
] as const;
