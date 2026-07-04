export type PriceTrendDirection = 'up' | 'down';

export type ProductSpec = {
  id: string;
  label: string;
  value: string;
  standard: string;
};

export type PricingTier = {
  id: string;
  quantityLabel: string;
  unitPrice: number;
  totalEstimate: string;
  rateLabel: string;
  savingsLabel?: string;
  minMt: number;
  maxMt: number | null;
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
  name: string;
  nameLine2: string;
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
