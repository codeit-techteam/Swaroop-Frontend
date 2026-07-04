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

export type CartItem = {
  productId: string;
  name: string;
  grade: string;
  quantityMt: number;
  unitPricePerKg: number;
  tierId: string;
  addedAt: string;
};
