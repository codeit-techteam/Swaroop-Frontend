import type { CheckoutShippingAddress } from '@/types/checkout';

export const CHECKOUT_GST_RATE = 0.18;

export const CHECKOUT_PLATFORM_FEE = 0;

export const DEFAULT_CHECKOUT_ADDRESS_ID = 'jamnagar-hub';

export const CHECKOUT_ADDRESSES: CheckoutShippingAddress[] = [
  {
    id: 'jamnagar-hub',
    warehouseName: 'Jamnagar Logistics Hub',
    line1: 'Plot No. 42, GIDC Industrial Estate',
    line2: 'Jamnagar',
    state: 'Gujarat',
    pincode: '361001',
    zoneLabel: 'Primary Industrial Zone',
    cityShort: 'Jamnagar',
    freightAmount: 12400,
    etaLabel: '2–3 Business Days',
  },
  {
    id: 'mumbai-warehouse',
    warehouseName: 'Mumbai Warehouse',
    line1: 'Unit 7, Taloja Industrial Area',
    line2: 'Navi Mumbai',
    state: 'Maharashtra',
    pincode: '410208',
    zoneLabel: 'Western Logistics Corridor',
    cityShort: 'Mumbai',
    freightAmount: 14800,
    etaLabel: '2–4 Business Days',
  },
  {
    id: 'hazira-hub',
    warehouseName: 'Hazira Industrial Hub',
    line1: 'Sector 12, Hazira Industrial Estate',
    line2: 'Surat',
    state: 'Gujarat',
    pincode: '394270',
    zoneLabel: 'Gujarat Industrial Belt',
    cityShort: 'Hazira',
    freightAmount: 13600,
    etaLabel: '3–4 Business Days',
  },
  {
    id: 'mundra-port',
    warehouseName: 'Mundra Port',
    line1: 'Adani Port & SEZ, Mundra',
    line2: 'Kutch',
    state: 'Gujarat',
    pincode: '370421',
    zoneLabel: 'Coastal Export Zone',
    cityShort: 'Mundra',
    freightAmount: 16200,
    etaLabel: '4–5 Business Days',
  },
];

export const CHECKOUT_PAYMENT_PROTOCOL = {
  title: 'Payment Protocol',
  bodyPrefix:
    'A Proforma Invoice (PI) will be instantly generated upon order placement. Payment must be completed via',
  bodyMiddle: 'within',
  bodySuffix: 'to lock the quoted market price.',
  highlights: ['RTGS', 'NEFT', '24 Hours'] as const,
};

export const CHECKOUT_INDUSTRIAL_BANNER = {
  imageUrl:
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
  features: [
    'Trusted Industrial Procurement',
    'Verified Supply Network',
    'Blind Marketplace',
    'Fast Logistics',
    'Secure Transactions',
  ] as const,
};

export const getCheckoutAddressById = (id: string): CheckoutShippingAddress =>
  CHECKOUT_ADDRESSES.find((entry) => entry.id === id) ?? CHECKOUT_ADDRESSES[0];

export const formatCheckoutCurrency = (amount: number): string =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;

export const formatCheckoutProductTitle = (productType: string, grade: string): string => {
  const typeLabel = productType
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  return `${typeLabel} PP ${grade}`;
};

export const formatCheckoutProductSubtitle = (name: string): string => {
  const normalized = name.trim();
  if (/homopolymer/i.test(normalized)) {
    return 'Polypropylene Homopolymer';
  }
  const stripped = normalized.replace(/^PP\s+[A-Z0-9]+\s*/i, '').trim();
  return stripped || 'Industrial Grade Material';
};

export const formatCheckoutPackaging = (packaging: string, quantityMt: number): string => {
  if (quantityMt >= 10 && /bag/i.test(packaging)) {
    return 'Bulk Container';
  }
  return packaging;
};
