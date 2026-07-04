import { getMarketProductById } from '@/constants/marketProducts';
import type { MarketProduct } from '@/types/market';
import type { PricingTier, ProductDetails, ProductSpec, TrustFeature } from '@/types/product';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=80',
] as const;

const DEFAULT_SPECS: ProductSpec[] = [
  {
    id: 'mfr',
    label: 'Melt Flow Rate (MFR)',
    value: '11.0 g/10 min',
    standard: 'ASTM D1238 (230°C/2.16kg)',
  },
  {
    id: 'density',
    label: 'Density',
    value: '0.900 g/cm³',
    standard: 'ASTM D792',
  },
  {
    id: 'tensile',
    label: 'Tensile Strength',
    value: '35 MPa',
    standard: 'At Yield (50mm/min)',
  },
  {
    id: 'flexural',
    label: 'Flexural Modulus',
    value: '1500 MPa',
    standard: 'ASTM D790',
  },
  {
    id: 'impact',
    label: 'Impact Strength',
    value: 'High',
    standard: 'ASTM D256',
  },
  {
    id: 'processing',
    label: 'Processing Method',
    value: 'Injection Moulding',
    standard: 'Recommended Process',
  },
];

const DEFAULT_APPLICATIONS = [
  'Packaging',
  'Household Items',
  'Industrial Containers',
  'Automotive Components',
];

const DEFAULT_TRUST_FEATURES: TrustFeature[] = [
  {
    id: 'quality',
    title: 'Quality Verified Material',
    description: 'Seller vetted for 99.8% fulfill rate.',
    icon: 'check',
  },
  {
    id: 'payment',
    title: 'Secure Payment Protection',
    description: 'Escrow-based payment settlement.',
    icon: 'shield',
  },
  {
    id: 'network',
    title: 'Verified Industrial Supply Network',
    description: 'Sourced via verified procurement partners.',
    icon: 'check',
  },
  {
    id: 'docs',
    title: 'Standard Quality Documentation',
    description: 'COA and grade certificates available.',
    icon: 'check',
  },
  {
    id: 'inspection',
    title: 'Quality Inspection Available',
    description: 'Optional third-party inspection on request.',
    icon: 'shield',
  },
];

const DEFAULT_PROCUREMENT_TERMS = [
  'Minimum Increment: 25 MT',
  'Payment Terms: Advance / Credit',
  'Delivery Subject to Stock',
  'Price may change daily',
  'GST Extra',
  'Freight calculated during checkout',
];

const buildPricingTiers = (basePricePerKg: number): PricingTier[] => {
  const tier1 = basePricePerKg;
  const tier2 = Math.round((basePricePerKg - 2.5) * 100) / 100;
  const tier3 = Math.round((basePricePerKg - 6) * 100) / 100;

  const formatTotal = (price: number, mt: number, suffix = ''): string => {
    const total = Math.round(price * mt * 1000);
    return `₹${total.toLocaleString('en-IN')}${suffix}`;
  };

  return [
    {
      id: 'tier-standard',
      quantityLabel: '1 - 10 MT',
      unitPrice: tier1,
      totalEstimate: formatTotal(tier1, 10),
      rateLabel: 'Standard Rate',
      minMt: 1,
      maxMt: 10,
    },
    {
      id: 'tier-volume',
      quantityLabel: '11 - 50 MT',
      unitPrice: tier2,
      totalEstimate: `${formatTotal(tier2, 11)}+`,
      rateLabel: 'Volume Discount',
      savingsLabel: 'Save ₹2.50/kg',
      minMt: 11,
      maxMt: 50,
    },
    {
      id: 'tier-enterprise',
      quantityLabel: '50+ MT',
      unitPrice: tier3,
      totalEstimate: `${formatTotal(tier3, 50)}+`,
      rateLabel: 'Enterprise Rate',
      savingsLabel: 'Save ₹6/kg',
      minMt: 50,
      maxMt: null,
    },
  ];
};

const pricePerKgFromMarket = (marketPricePerMt: number): number =>
  Math.round((marketPricePerMt / 1000) * 100) / 100;

const buildProductDetails = (
  market: MarketProduct,
  overrides: Partial<ProductDetails> = {},
): ProductDetails => {
  const basePricePerKg = overrides.basePricePerKg ?? pricePerKgFromMarket(market.price);
  const trendPercent = overrides.trendPercent ?? 2.4;
  const trendDirection = overrides.trendDirection ?? 'up';
  const moq = overrides.moq ?? 25;
  const stock = overrides.stock ?? market.stock;
  const eta = overrides.eta ?? '3 - 5 Business Days';
  const warehouseRegion = overrides.warehouseRegion ?? market.origin;
  const originRegion = overrides.originRegion ?? 'Western India';
  const packaging = overrides.packaging ?? '25 KG Bags';
  const qualityGrade = overrides.qualityGrade ?? 'Injection Moulding';
  const grade = overrides.grade ?? market.grade;
  const name = overrides.name ?? market.name;
  const nameLine2 = overrides.nameLine2 ?? market.category;
  const breadcrumbProduct = overrides.breadcrumbProduct ?? `${name} ${grade}`;

  return {
    id: market.id,
    marketProductId: market.id,
    breadcrumbCategory: overrides.breadcrumbCategory ?? 'Polymers',
    breadcrumbProduct,
    grade,
    name,
    nameLine2,
    basePricePerKg,
    marketPricePerKg: overrides.marketPricePerKg ?? basePricePerKg,
    trendPercent,
    trendDirection,
    moq,
    moqLabel: overrides.moqLabel ?? `${moq} MT (Full Truck)`,
    stock,
    stockLabel: overrides.stockLabel ?? `${stock.toLocaleString('en-IN')} MT Available`,
    eta,
    warehouseRegion,
    originRegion,
    packaging,
    qualityGrade,
    heroImage: overrides.heroImage ?? market.image ?? HERO_IMAGES[0],
    infoItems: overrides.infoItems ?? [
      { id: 'moq', label: 'Minimum Order', value: `${moq} MT` },
      { id: 'stock', label: 'Stock Available', value: `${stock} MT`, accent: true },
      { id: 'eta', label: 'Estimated Delivery', value: eta },
      { id: 'warehouse', label: 'Warehouse Region', value: warehouseRegion },
      { id: 'origin', label: 'Origin Region', value: originRegion },
      { id: 'packaging', label: 'Packaging', value: packaging },
      { id: 'quality', label: 'Quality Grade', value: qualityGrade },
    ],
    specs: overrides.specs ?? DEFAULT_SPECS,
    applications: overrides.applications ?? DEFAULT_APPLICATIONS,
    applicationNote:
      overrides.applicationNote ??
      'Recommended for high-speed injection molding, thin-wall packaging, and household items. Offers excellent processability and high stiffness.',
    pricingTiers: overrides.pricingTiers ?? buildPricingTiers(basePricePerKg),
    procurementTerms: overrides.procurementTerms ?? DEFAULT_PROCUREMENT_TERMS,
    trustTitle: overrides.trustTitle ?? 'Platform Assurance',
    trustDescription:
      overrides.trustDescription ??
      "This product is supplied through PetroTrade's Verified Supply Network. To maintain Blind Marketplace compliance, supplier identity is hidden until order processing is completed.",
    trustHighlight: overrides.trustHighlight ?? 'Verified Supply Network',
    trustFeatures: overrides.trustFeatures ?? DEFAULT_TRUST_FEATURES,
    quantityIncrement: overrides.quantityIncrement ?? 25,
  };
};

const FEATURED_PRODUCT: ProductDetails = buildProductDetails(
  {
    id: 'mkt-pp-h110ma',
    name: 'Polypropylene (PP)',
    grade: 'H110MA',
    price: 145000,
    origin: 'Hazira, Gujarat',
    stock: 450,
    moq: 25,
    eta: '3 - 5 Business Days',
    category: 'Polypropylene',
    badge: 'Fastest Delivery',
    image: HERO_IMAGES[0],
  },
  {
    breadcrumbProduct: 'Polypropylene PP-R102',
    nameLine2: 'Homopolymer',
    grade: 'H110MA',
    basePricePerKg: 145,
    marketPricePerKg: 145,
    trendPercent: 2.4,
    trendDirection: 'up',
    moqLabel: '25 MT (Full Truck)',
    stockLabel: '450 MT Available',
    warehouseRegion: 'Hazira, Gujarat',
    originRegion: 'Western India',
    packaging: '25 KG Bags',
    qualityGrade: 'Injection Moulding',
    trustTitle: 'Platform Trust',
    trustDescription:
      "This material is sourced through PetroTrade's Verified Supply Network. We maintain strict anonymity to ensure market neutrality and price stability.",
    trustHighlight: 'Verified Supply Network',
    trustFeatures: [
      {
        id: 'quality',
        title: 'Quality Assured Source',
        description: 'Seller vetted for 99.8% fulfill rate.',
        icon: 'check',
      },
      {
        id: 'payment',
        title: 'Transaction Protection',
        description: 'Escrow-based payment settlement.',
        icon: 'shield',
      },
      {
        id: 'network',
        title: 'Verified Industrial Supply Network',
        description: 'Sourced via verified procurement partners.',
        icon: 'check',
      },
      {
        id: 'docs',
        title: 'Standard Quality Documentation',
        description: 'COA and grade certificates available.',
        icon: 'check',
      },
      {
        id: 'inspection',
        title: 'Quality Inspection Available',
        description: 'Optional third-party inspection on request.',
        icon: 'shield',
      },
    ],
    procurementTerms: [
      'Incremental Quantity: 25 MT',
      'Payment Terms: LC 30 Days / Advance',
      'Subject to daily price adjustment',
      'GST Extra',
      'Delivery Subject to Stock',
      'Freight calculated during checkout',
    ],
  },
);

const PRODUCT_DETAILS_BY_ID: Record<string, ProductDetails> = {
  [FEATURED_PRODUCT.id]: FEATURED_PRODUCT,
};

export const PRODUCT_DETAILS_SKELETON_MS = 450;

export const getProductDetailsById = (id: string): ProductDetails | null => {
  if (PRODUCT_DETAILS_BY_ID[id]) {
    return PRODUCT_DETAILS_BY_ID[id];
  }

  const marketProduct = getMarketProductById(id);
  if (!marketProduct) {
    return null;
  }

  const imageIndex = Math.abs(id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) %
    HERO_IMAGES.length;

  return buildProductDetails(marketProduct, {
    heroImage: marketProduct.image || HERO_IMAGES[imageIndex],
    breadcrumbProduct: marketProduct.name,
    name: marketProduct.name,
    nameLine2: marketProduct.category,
    grade: marketProduct.grade,
    moq: Math.max(marketProduct.moq, 25),
    stock: marketProduct.stock,
    eta: marketProduct.eta.includes('Business')
      ? marketProduct.eta
      : `${marketProduct.eta.replace('Days', 'Business Days')}`,
    warehouseRegion: marketProduct.origin,
  });
};

export const formatPricePerKg = (price: number): string => {
  const hasDecimals = price % 1 !== 0;
  return `₹${price.toLocaleString('en-IN', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};

export const formatUnitPrice = (price: number): string => formatPricePerKg(price);

export const getTierForQuantity = (
  tiers: PricingTier[],
  quantityMt: number,
): PricingTier => {
  const match = tiers.find((tier) => {
    if (tier.maxMt === null) {
      return quantityMt >= tier.minMt;
    }
    return quantityMt >= tier.minMt && quantityMt <= tier.maxMt;
  });

  return match ?? tiers[0];
};
