import type { CartDeliveryLocation, CartItem } from '@/types/product';

export const CART_SKELETON_MS = 400;

export const CART_GST_RATE = 0.18;

export const CART_PLATFORM_FEE = 0;

export const CART_FREIGHT_TIERS = [
  { minMt: 1, maxMt: 25, amount: 12400 },
  { minMt: 26, maxMt: 50, amount: 18000 },
  { minMt: 51, maxMt: 100, amount: 25000 },
  { minMt: 101, maxMt: null, amount: 32000 },
] as const;

export const DEFAULT_CART_DELIVERY: CartDeliveryLocation = {
  city: 'Mumbai',
  state: 'Maharashtra',
  label: 'Mumbai, Maharashtra',
  etaLabel: '2–3 Business Days',
};

export const CART_TRUST_FEATURES = [
  {
    id: 'secure-pay',
    title: 'SECURE PAY',
    icon: 'shield' as const,
  },
  {
    id: 'quality-insured',
    title: 'QUALITY INSURED',
    icon: 'clipboard' as const,
  },
  {
    id: 'support',
    title: '24/7 DESK',
    icon: 'headset' as const,
  },
] as const;

/** Sample cart line for design reference / empty-state demos (not auto-seeded). */
export const SAMPLE_CART_ITEM: Omit<CartItem, 'addedAt'> = {
  id: 'sample-pp-h110ma',
  productId: 'mkt-pp-h110ma',
  name: 'PP H110MA Homopolymer',
  productType: 'POLYPROPYLENE',
  grade: 'H110MA',
  quantityMt: 10,
  unitPricePerMt: 94500,
  tierId: 'tier-standard',
  imageUrl: '',
  moq: 12,
  quantityIncrement: 1,
  packaging: '25 KG Bags',
  warehouseRegion: 'Western India',
  eta: '2–3 Business Days',
};

export const formatCartCurrency = (amount: number): string =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;

export const formatPricePerMt = (amount: number): string => `${formatCartCurrency(amount)} / MT`;

export const calculateFreightForQuantity = (quantityMt: number): number => {
  if (quantityMt <= 0) {
    return 0;
  }

  const tier = CART_FREIGHT_TIERS.find((entry) => {
    if (entry.maxMt === null) {
      return quantityMt >= entry.minMt;
    }
    return quantityMt >= entry.minMt && quantityMt <= entry.maxMt;
  });

  return tier?.amount ?? CART_FREIGHT_TIERS[CART_FREIGHT_TIERS.length - 1].amount;
};

export const buildBlindProductName = (grade: string, nameLine2: string): string => {
  const gradePart = grade.trim();
  const typePart = nameLine2.trim();
  if (!typePart || typePart.toLowerCase() === gradePart.toLowerCase()) {
    return gradePart;
  }
  if (typePart.toUpperCase().startsWith(gradePart.toUpperCase())) {
    return typePart;
  }
  return `${gradePart} ${typePart}`;
};

export const buildProductTypeBadge = (categoryOrType: string): string =>
  categoryOrType.replace(/[()]/g, '').trim().toUpperCase();
