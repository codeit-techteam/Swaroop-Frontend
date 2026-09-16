import type { PaymentMethodId } from '@/types/payment';

export type PriceTrendDirection = 'up' | 'down';

export type ProductAvailabilityLevel = 'high' | 'medium' | 'limited' | 'out_of_stock';

export type ProductSpec = {
  id: string;
  label: string;
  value: string;
  standard: string;
};

export type PricingTier = {
  id: string;
  quantityLabel: string;
  /** ₹ per KG — kept for legacy display. Prefer `pricePerMt`. */
  unitPrice: number;
  /** ₹ per MT — matches Customer WEBAPP bulk pricing. */
  pricePerMt: number;
  totalEstimate: string;
  rateLabel: string;
  savingsLabel?: string;
  minMt: number;
  maxMt: number | null;
};

export type ProductPaymentOption = {
  id: PaymentMethodId;
  title: string;
  description: string;
  surchargeLabel?: string;
  benefitLabel?: string;
  discountRate?: number;
  eligible: boolean;
};

export type ComplianceDocumentType = 'coa' | 'msds' | 'iso' | 'test_certificate' | 'quality_report';

export type ComplianceDocument = {
  id: string;
  type: ComplianceDocumentType;
  title: string;
  description: string;
  fileName: string;
};

export type LogisticsEstimate = {
  warehouse: string;
  warehouseRegion: string;
  deliveryLocation: string;
  estimatedDelivery: string;
  transportMode: string;
  freightLabel: string;
  freightPerMt: number;
};

export type SpotPriceInfo = {
  pricePerMt: number;
  yesterdayDelta: number;
  trendDirection: PriceTrendDirection;
  note: string;
};

export type RelatedProductCard = {
  id: string;
  name: string;
  categoryLabel: string;
  pricePerMt: number;
  warehouseLabel: string;
  stockLabel: string;
};

export type TrustFeature = {
  id: string;
  title: string;
  description: string;
  icon: 'check' | 'shield';
};

export type ProductInfoItem = {
  id: string;
  label: string;
  value: string;
  accent?: boolean;
};

export type ProductDetails = {
  id: string;
  marketProductId: string;
  breadcrumbCategory: string;
  breadcrumbProduct: string;
  grade: string;
  sku: string;
  name: string;
  nameLine2: string;
  materialType: string;
  description: string;
  casNumber: string;
  hsnCode: string;
  basePricePerKg: number;
  marketPricePerKg: number;
  trendPercent: number;
  trendDirection: PriceTrendDirection;
  moq: number;
  moqLabel: string;
  stock: number;
  stockLabel: string;
  eta: string;
  warehouseRegion: string;
  originRegion: string;
  packaging: string;
  qualityGrade: string;
  /** Blind marketplace — empty; PDP uses a grade tile instead of photography. */
  heroImage: string;
  infoItems: ProductInfoItem[];
  specs: ProductSpec[];
  applications: string[];
  applicationNote: string;
  pricingTiers: PricingTier[];
  procurementTerms: string[];
  trustTitle: string;
  trustDescription: string;
  trustHighlight: string;
  trustFeatures: TrustFeature[];
  quantityIncrement: number;
  availability: ProductAvailabilityLevel;
  availabilityLabel: string;
  highlights: string[];
  features: string[];
  industry: string;
  application: string;
  categoryName: string;
  spotPrice: SpotPriceInfo;
  paymentOptions: ProductPaymentOption[];
  logistics: LogisticsEstimate;
  documents: ComplianceDocument[];
  relatedProducts: RelatedProductCard[];
  creditEligible: boolean;
};

/** Blind-marketplace cart line — no supplier / manufacturer fields. */
export type CartItem = {
  id: string;
  productId: string;
  /** Display name, e.g. "PP H110MA Homopolymer" */
  name: string;
  /** Grade badge label, e.g. "POLYPROPYLENE" */
  productType: string;
  grade: string;
  quantityMt: number;
  /** Unit price in ₹ per MT */
  unitPricePerMt: number;
  tierId: string;
  imageUrl: string;
  moq: number;
  quantityIncrement: number;
  packaging: string;
  warehouseRegion: string;
  eta: string;
  addedAt: string;
};

export type CartDeliveryLocation = {
  city: string;
  state: string;
  label: string;
  etaLabel: string;
};

export type CartOrderSummary = {
  baseSubtotal: number;
  freight: number;
  gst: number;
  platformFee: number;
  insuranceIncluded: boolean;
  totalLandedCost: number;
  totalQuantityMt: number;
  meetsMoq: boolean;
};
