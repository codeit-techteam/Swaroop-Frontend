import { getMarketProductById } from '@/constants/marketProducts';
import type { MarketProduct, ProductTechnicalSpecs } from '@/types/market';
import type { PaymentMethodId } from '@/types/payment';
import type {
  ComplianceDocument,
  LogisticsEstimate,
  PricingTier,
  ProductAvailabilityLevel,
  ProductDetails,
  ProductPaymentOption,
  ProductSpec,
  RelatedProductCard,
  SpotPriceInfo,
  TrustFeature,
} from '@/types/product';

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
    id: 'form',
    label: 'Form',
    value: 'Pellets',
    standard: 'Grade Specification',
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
  'Minimum Increment: 1 MT',
  'Payment Terms: Advance / Credit',
  'Delivery Subject to Stock',
  'Price may change daily',
  'GST Extra',
  'Freight calculated during checkout',
];

const FEATURES_BY_MATERIAL: Record<string, string[]> = {
  Polypropylene: [
    'High Flow',
    'Excellent Processability',
    'Virgin Material',
    'IS Certified',
    'Consistent MFI',
  ],
  HDPE: ['High Strength', 'UV Resistant', 'Virgin Material', 'IS Certified', 'Moisture Resistant'],
  LDPE: [
    'High Clarity',
    'Flexible Film Grade',
    'Virgin Material',
    'Food Contact Eligible',
    'IS Certified',
  ],
  LLDPE: [
    'Puncture Resistant',
    'High Toughness',
    'Virgin Material',
    'IS Certified',
    'Excellent Sealability',
  ],
  PVC: [
    'Chemical Resistant',
    'Flame Retardant Options',
    'Virgin Material',
    'IS Certified',
    'Stable Processing',
  ],
  PET: ['High Clarity', 'Food Grade', 'Virgin Material', 'IS Certified', 'Recyclable'],
};

const DEFAULT_FEATURES = [
  'Virgin Material',
  'IS Certified',
  'Quality Assured',
  'Consistent Batch Specs',
  'PetroTrade Verified',
];

const DEFAULT_PRODUCT_HIGHLIGHTS = [
  'PetroTrade Verified',
  'GST Invoice Available',
  'Fast Dispatch',
  'Credit Eligible',
  'Quality Certified',
];

const SPEC_LABELS: Record<string, string> = {
  mfi: 'Melt Flow Index (MFI)',
  density: 'Density',
  form: 'Form',
  iv: 'Intrinsic Viscosity (IV)',
  viscosity: 'Viscosity',
  purity: 'Purity',
  kValue: 'K-Value',
  bulkDensity: 'Bulk Density',
  mrs: 'MRS',
  rv: 'Relative Viscosity',
  hardness: 'Hardness',
  filler: 'Filler',
  flammability: 'Flammability',
  pigmentLoading: 'Pigment Loading',
  activeLoading: 'Active Loading',
  carrier: 'Carrier',
  chlorineContent: 'Chlorine Content',
  boilingPoint: 'Boiling Point',
  boilingRange: 'Boiling Range',
  meltingPoint: 'Melting Point',
  moisture: 'Moisture',
  color: 'Colour',
  inhibitor: 'Inhibitor',
  naoh: 'NaOH',
  particleSize: 'Particle Size',
  vi: 'Viscosity Index',
};

const SPEC_STANDARDS: Record<string, string> = {
  mfi: 'ASTM D1238',
  density: 'ASTM D792',
  iv: 'ASTM D4603',
  kValue: 'ISO 1628-2',
};

const HSN_BY_MATERIAL: Record<string, string> = {
  Polypropylene: '3902.10.00',
  HDPE: '3901.20.00',
  LDPE: '3901.10.00',
  LLDPE: '3901.10.00',
  PVC: '3904.10.00',
  PET: '3907.61.00',
  ABS: '3903.30.00',
  EVA: '3901.30.00',
  Polycarbonate: '3907.40.00',
};

const formatSpecLabel = (key: string): string =>
  SPEC_LABELS[key] ??
  key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const specsFromTechnical = (technicalSpecs?: ProductTechnicalSpecs): ProductSpec[] | null => {
  if (!technicalSpecs) {
    return null;
  }

  const rows = Object.entries(technicalSpecs)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => ({
      id: `tech-${key}`,
      label: formatSpecLabel(key),
      value: value as string,
      standard: SPEC_STANDARDS[key] ?? 'Grade Specification',
    }));

  return rows.length ? rows : null;
};

const pricePerKgFromMarket = (marketPricePerMt: number): number =>
  Math.round((marketPricePerMt / 1000) * 100) / 100;

const breadcrumbCategoryFor = (market: MarketProduct): string => {
  if (market.categoryId === 'chemicals') {
    return 'Chemicals';
  }
  if (market.categoryId === 'additives') {
    return 'Additives';
  }
  if (market.categoryId === 'base-oils') {
    return 'Base Oils';
  }
  return 'Polymers';
};

const packagingFor = (market: MarketProduct): string => {
  const form = market.technicalSpecs?.form?.toLowerCase() ?? '';
  if (form.includes('liquid')) {
    return 'Drum / ISO Tank';
  }
  return '25 KG Bags';
};

const availabilityFromStock = (
  stock: number,
): { level: ProductAvailabilityLevel; label: string } => {
  if (stock <= 0) {
    return { level: 'out_of_stock', label: 'OUT OF STOCK' };
  }
  if (stock < 100) {
    return { level: 'limited', label: 'LIMITED STOCK' };
  }
  if (stock >= 400) {
    return { level: 'high', label: 'HIGH AVAILABILITY' };
  }
  return { level: 'medium', label: 'IN STOCK' };
};

const getFeaturesForMaterial = (materialType: string): string[] =>
  FEATURES_BY_MATERIAL[materialType] ?? DEFAULT_FEATURES;

const buildProductHighlights = (creditEligible: boolean): string[] =>
  DEFAULT_PRODUCT_HIGHLIGHTS.map((item) =>
    item === 'Credit Eligible' && !creditEligible ? 'Advance Preferred' : item,
  );

const buildProductDocuments = (productName: string): ComplianceDocument[] => {
  const safe = productName.replace(/\s+/g, '-').toLowerCase();
  return [
    {
      id: 'doc-spec',
      type: 'coa',
      title: 'Specification PDF',
      description: 'Grade specification sheet',
      fileName: `${safe}-specification.pdf`,
    },
    {
      id: 'doc-tds',
      type: 'test_certificate',
      title: 'TDS',
      description: 'Technical data sheet',
      fileName: `${safe}-tds.pdf`,
    },
    {
      id: 'doc-msds',
      type: 'msds',
      title: 'MSDS',
      description: 'Material safety data sheet',
      fileName: `${safe}-msds.pdf`,
    },
    {
      id: 'doc-iso',
      type: 'iso',
      title: 'Certificate',
      description: 'Quality / ISO certificate',
      fileName: `${safe}-certificate.pdf`,
    },
    {
      id: 'doc-qr',
      type: 'quality_report',
      title: 'Quality Report',
      description: 'Latest batch quality report',
      fileName: `${safe}-quality-report.pdf`,
    },
  ];
};

const buildSpotPrice = (pricePerMt: number): SpotPriceInfo => {
  const yesterdayDelta = Math.round(pricePerMt * 0.0045);
  return {
    pricePerMt,
    yesterdayDelta,
    trendDirection: 'up',
    note: 'Prices are exclusive of GST (18%). Final quote is generated after PetroTrade confirmation of your purchase request.',
  };
};

const buildBulkPricing = (spotPricePerMt: number): PricingTier[] => {
  const tier1 = spotPricePerMt;
  const tier2 = Math.round(spotPricePerMt * 0.987);
  const tier3 = Math.round(spotPricePerMt * 0.972);

  const formatTotal = (price: number, mt: number, suffix = ''): string => {
    const total = Math.round(price * mt);
    return `₹${total.toLocaleString('en-IN')}${suffix}`;
  };

  return [
    {
      id: 'tier-25-99',
      quantityLabel: '25 - 99 MT',
      unitPrice: pricePerKgFromMarket(tier1),
      pricePerMt: tier1,
      totalEstimate: formatTotal(tier1, 25),
      rateLabel: 'Spot Rate',
      minMt: 25,
      maxMt: 99,
    },
    {
      id: 'tier-100-199',
      quantityLabel: '100 - 199 MT',
      unitPrice: pricePerKgFromMarket(tier2),
      pricePerMt: tier2,
      totalEstimate: `${formatTotal(tier2, 100)}+`,
      rateLabel: 'Volume Discount',
      savingsLabel: 'Save 1.3%',
      minMt: 100,
      maxMt: 199,
    },
    {
      id: 'tier-200-plus',
      quantityLabel: '200+ MT',
      unitPrice: pricePerKgFromMarket(tier3),
      pricePerMt: tier3,
      totalEstimate: `${formatTotal(tier3, 200)}+`,
      rateLabel: 'Enterprise Rate',
      savingsLabel: 'Save 2.8%',
      minMt: 200,
      maxMt: null,
    },
  ];
};

const buildPaymentOptions = (creditEligible: boolean): ProductPaymentOption[] => [
  {
    id: 'advance' satisfies PaymentMethodId,
    title: 'Advance',
    description: 'Pay before dispatch for preferred pricing.',
    benefitLabel: 'Platform Discount Eligible',
    discountRate: 0.05,
    eligible: true,
  },
  {
    id: 'on_loading',
    title: 'On Loading',
    description: 'Pay after material loading confirmation.',
    benefitLabel: 'Standard Terms',
    eligible: true,
  },
  {
    id: 'on_delivery',
    title: 'On Delivery',
    description: 'Pay after delivery confirmation.',
    benefitLabel: 'Standard Terms',
    eligible: true,
  },
  {
    id: 'credit_15',
    title: 'PetroTrade Credit — 15 Days',
    description: 'PetroTrade managed working capital. Seller does not extend credit.',
    benefitLabel: 'Approval Required',
    eligible: creditEligible,
  },
  {
    id: 'credit_30',
    title: 'PetroTrade Credit — 30 Days',
    description: 'PetroTrade managed working capital. Seller does not extend credit.',
    benefitLabel: 'Approval Required',
    eligible: creditEligible,
  },
];

const buildLogisticsEstimate = (input: {
  warehouseLabel: string;
  eta: string;
}): LogisticsEstimate => ({
  warehouse: input.warehouseLabel,
  warehouseRegion: input.warehouseLabel,
  deliveryLocation: 'Mumbai, Maharashtra',
  estimatedDelivery: input.eta.includes('Business') ? input.eta : input.eta.replace('Days', 'Days'),
  transportMode: 'Road Freight (FTL)',
  freightLabel: 'Freight to Mumbai',
  freightPerMt: 1250,
});

const mergeCatalog = (extraProducts: MarketProduct[]): MarketProduct[] => extraProducts;

const relatedCardsFor = (market: MarketProduct, catalog: MarketProduct[]): RelatedProductCard[] => {
  const materialType = market.materialType ?? market.category;

  return catalog
    .filter(
      (item) =>
        item.id !== market.id &&
        (item.categoryId === market.categoryId ||
          item.materialType === materialType ||
          item.grade === market.grade ||
          item.category === market.category),
    )
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      name: item.name,
      categoryLabel: item.materialType ?? item.category,
      pricePerMt: item.price,
      warehouseLabel: item.warehouseLabel ?? item.origin,
      stockLabel:
        item.stock >= 400
          ? `${item.stock}+ MT Available`
          : `${item.stock.toLocaleString('en-IN')} MT Available`,
    }));
};

export const buildProductDetails = (
  market: MarketProduct,
  overrides: Partial<ProductDetails> = {},
  catalog: MarketProduct[] = [],
): ProductDetails => {
  const basePricePerKg = overrides.basePricePerKg ?? pricePerKgFromMarket(market.price);
  const trendPercent = overrides.trendPercent ?? 2.4;
  const trendDirection = overrides.trendDirection ?? 'up';
  const moq = overrides.moq ?? Math.max(market.moq, 1);
  const stock = overrides.stock ?? market.stock;
  const eta = overrides.eta ?? market.eta;
  const warehouseRegion = overrides.warehouseRegion ?? market.warehouseLabel ?? market.origin;
  const originRegion = overrides.originRegion ?? market.origin;
  const packaging = overrides.packaging ?? packagingFor(market);
  const qualityGrade = overrides.qualityGrade ?? market.subCategory ?? market.category;
  const grade = overrides.grade ?? market.grade;
  const name = overrides.name ?? market.name;
  const nameLine2 = overrides.nameLine2 ?? market.subCategory ?? market.category;
  const sku = overrides.sku ?? market.gradeCode ?? grade;
  const materialType = overrides.materialType ?? market.materialType ?? market.category;
  const description =
    overrides.description ??
    market.description ??
    `${name} is offered through PetroTrade's blind marketplace with verified commercial and technical data only.`;
  const applications = overrides.applications ?? market.applications ?? DEFAULT_APPLICATIONS;
  const specs = overrides.specs ?? specsFromTechnical(market.technicalSpecs) ?? DEFAULT_SPECS;
  const breadcrumbProduct = overrides.breadcrumbProduct ?? name;
  const hsnCode = overrides.hsnCode ?? HSN_BY_MATERIAL[materialType] ?? '3902.10.00';
  const casNumber = overrides.casNumber ?? market.casNumber ?? '';
  const creditEligible = overrides.creditEligible ?? market.creditEligible ?? false;
  const availability = overrides.availability ?? availabilityFromStock(stock).level;
  const availabilityLabel = overrides.availabilityLabel ?? availabilityFromStock(stock).label;
  const categoryName = overrides.categoryName ?? breadcrumbCategoryFor(market);
  const application = overrides.application ?? applications[0] ?? qualityGrade;
  const stockLabel =
    overrides.stockLabel ??
    (stock >= 400 ? `${stock}+ MT Available` : `${stock.toLocaleString('en-IN')} MT Available`);

  return {
    id: market.id,
    marketProductId: market.id,
    breadcrumbCategory: overrides.breadcrumbCategory ?? categoryName,
    breadcrumbProduct,
    grade,
    sku,
    name,
    nameLine2,
    materialType,
    description,
    casNumber,
    hsnCode,
    basePricePerKg,
    marketPricePerKg: overrides.marketPricePerKg ?? basePricePerKg,
    trendPercent,
    trendDirection,
    moq,
    moqLabel: overrides.moqLabel ?? `${moq} MT`,
    stock,
    stockLabel,
    eta: eta.includes('Business') ? eta : eta.replace('Days', 'Business Days'),
    warehouseRegion,
    originRegion,
    packaging,
    qualityGrade,
    heroImage: '',
    infoItems: overrides.infoItems ?? [
      { id: 'origin', label: 'Origin', value: originRegion },
      { id: 'warehouse', label: 'Warehouse', value: warehouseRegion },
      { id: 'stock', label: 'Stock', value: stockLabel, accent: true },
      { id: 'moq', label: 'MOQ', value: `${moq} MT` },
      { id: 'packaging', label: 'Packaging', value: packaging },
      { id: 'eta', label: 'Delivery Time', value: eta },
      { id: 'material', label: 'Material', value: materialType },
      { id: 'application', label: 'Application', value: application },
      ...(casNumber ? [{ id: 'cas', label: 'CAS Number', value: casNumber }] : []),
      { id: 'hsn', label: 'HSN Code', value: hsnCode },
    ],
    specs,
    applications,
    applicationNote: overrides.applicationNote ?? description,
    pricingTiers: overrides.pricingTiers ?? buildBulkPricing(market.price),
    procurementTerms: overrides.procurementTerms ?? DEFAULT_PROCUREMENT_TERMS,
    trustTitle: overrides.trustTitle ?? 'Platform Assurance',
    trustDescription:
      overrides.trustDescription ??
      "This product is supplied through PetroTrade's Verified Supply Network. To maintain Blind Marketplace compliance, supplier identity is hidden until order processing is completed.",
    trustHighlight: overrides.trustHighlight ?? 'Verified Supply Network',
    trustFeatures: overrides.trustFeatures ?? DEFAULT_TRUST_FEATURES,
    quantityIncrement: overrides.quantityIncrement ?? 1,
    availability,
    availabilityLabel,
    highlights: overrides.highlights ?? buildProductHighlights(creditEligible),
    features: overrides.features ?? getFeaturesForMaterial(materialType),
    industry: overrides.industry ?? 'Petrochemicals & Packaging',
    application,
    categoryName,
    spotPrice: overrides.spotPrice ?? buildSpotPrice(market.price),
    paymentOptions: overrides.paymentOptions ?? buildPaymentOptions(creditEligible),
    logistics:
      overrides.logistics ?? buildLogisticsEstimate({ warehouseLabel: warehouseRegion, eta }),
    documents: overrides.documents ?? buildProductDocuments(name),
    relatedProducts: overrides.relatedProducts ?? relatedCardsFor(market, catalog),
    creditEligible,
    offerId: overrides.offerId ?? market.offerId,
  };
};

const resolveMarketProduct = (
  id: string,
  extraProducts: MarketProduct[] = [],
): MarketProduct | undefined =>
  extraProducts.find((product) => product.id === id) ?? getMarketProductById(id, extraProducts);

export const PRODUCT_GST_RATE = 0.18;

export const getProductDetailsById = (
  id: string,
  extraProducts: MarketProduct[] = [],
): ProductDetails | null => {
  const marketProduct = resolveMarketProduct(id, extraProducts);
  if (!marketProduct) {
    return null;
  }

  return buildProductDetails(marketProduct, {}, mergeCatalog(extraProducts));
};

export const formatPricePerKg = (price: number): string => {
  const hasDecimals = price % 1 !== 0;
  return `₹${price.toLocaleString('en-IN', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};

export const formatInr = (amount: number): string =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;

export const formatPricePerMt = (amount: number): string => `${formatInr(amount)} / MT`;

export const formatUnitPrice = (price: number): string => formatPricePerKg(price);

export const getTierForQuantity = (tiers: PricingTier[], quantityMt: number): PricingTier => {
  const match = [...tiers].reverse().find((tier) => quantityMt >= tier.minMt);
  return match ?? tiers[0];
};

export const priceForQuantity = (tiers: PricingTier[], quantityMt: number): number | undefined => {
  const match = [...tiers].reverse().find((tier) => quantityMt >= tier.minMt);
  return match?.pricePerMt;
};
