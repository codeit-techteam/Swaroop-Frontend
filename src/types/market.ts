export type MarketParentCategoryId = 'polymers' | 'chemicals' | 'additives' | 'base-oils';

export type MarketCategory = string;

export type MarketAvailabilityBadge =
  | 'Fastest Delivery'
  | 'Lowest Cost'
  | 'Premium Grade'
  | 'Best Value'
  | 'High Demand'
  | 'Limited Stock';

export type ProductTechnicalSpecs = {
  mfi?: string;
  density?: string;
  form?: string;
  iv?: string;
  viscosity?: string;
  purity?: string;
  [key: string]: string | undefined;
};

export type MarketProduct = {
  id: string;
  name: string;
  grade: string;
  price: number;
  origin: string;
  stock: number;
  moq: number;
  eta: string;
  category: MarketCategory;
  badge: MarketAvailabilityBadge;
  /** Blind catalog has no product photography. */
  image?: string;
  gradeCode?: string;
  categoryId?: MarketParentCategoryId;
  materialType?: string;
  subCategory?: string;
  description?: string;
  warehouseLabel?: string;
  casNumber?: string;
  applications?: string[];
  technicalSpecs?: ProductTechnicalSpecs;
  creditEligible?: boolean;
  offerId?: string;
  /** Seller-configured bulk pricing from the active offer listing. */
  bulkPricing?: Array<{
    id: string;
    minMt: number;
    maxMt: number | null;
    pricePerMt: number;
    quantityLabel: string;
  }>;
  documents?: Array<{
    id: string;
    type: string;
    title: string;
    description?: string;
    version?: number;
    status?: string;
    fileName?: string;
  }>;
};

export type StockLevel = 'high' | 'medium' | 'low';
