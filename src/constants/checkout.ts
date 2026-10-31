export const CHECKOUT_GST_RATE = 0.18;

export const CHECKOUT_PLATFORM_FEE = 0;

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
