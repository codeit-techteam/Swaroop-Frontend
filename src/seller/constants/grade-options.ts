export const SELLER_PACKAGING_TYPES = ['25 kg bags', 'Jumbo bags', 'Palletized bags'] as const;

export const SELLER_ORIGIN_OPTIONS = [
  'India',
  'UAE',
  'Saudi Arabia',
  'Singapore',
  'China',
  'Thailand',
  'KSA',
  'USA',
] as const;

export const SELLER_UNIT_OPTIONS = ['MT', 'kg'] as const;

export const SELLER_PAYMENT_TERM_PRICE_FIELDS = [
  { key: 'sellingPrice', label: 'Selling Price (₹/MT)' },
] as const;
