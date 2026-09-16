import { materialsTaxonomy } from '@/constants/materials-taxonomy';
import { blindGradesMock } from '@/constants/blind-grades';

export const SELLER_PRODUCT_CATEGORIES = materialsTaxonomy.map((family) => family.name);

export const SELLER_POLYMER_TYPES = Array.from(
  new Set(blindGradesMock.map((product) => product.grade).filter(Boolean)),
).sort((left, right) => left.localeCompare(right));

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
  { key: 'advance', label: 'Advance Price (₹/MT)' },
  { key: 'onLoading', label: 'On Loading' },
  { key: 'onDelivery', label: 'On Delivery' },
  { key: 'credit15Days', label: '15 Days Credit' },
  { key: 'credit30Days', label: '30 Days Credit' },
] as const;
