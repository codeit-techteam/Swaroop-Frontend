export type MarketCategory =
  'Polypropylene' | 'HDPE' | 'PVC' | 'LLDPE' | 'PET' | 'Polycarbonate' | 'ABS' | 'EVA';

export type MarketAvailabilityBadge =
  | 'Fastest Delivery'
  | 'Lowest Cost'
  | 'Premium Grade'
  | 'Best Value'
  | 'High Demand'
  | 'Limited Stock';

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
  image: string;
};

export type StockLevel = 'high' | 'medium' | 'low';
