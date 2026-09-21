export type HomeBanner = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  buttonLabel: string;
  imageUrl: string;
};

export type PriceTrend = 'up' | 'down' | 'stable';

export type WatchlistItem = {
  id: string;
  initials: string;
  materialName: string;
  priceLabel: string;
  trend: PriceTrend;
  changePercent: string;
};

export type TrendingProduct = {
  id: string;
  name: string;
  grade: string;
  priceLabel: string;
};

export type MarketInsight = {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  imageUrl: string;
};

export type DeliveryLocation = {
  id: string;
  city: string;
  state: string;
  pincode: string;
  label: string;
};

export type QuickSummaryItem = {
  id: string;
  type: 'orders' | 'invoices';
  label: string;
  value: string;
  subtitle: string;
  valueTone: 'primary' | 'danger';
};

export type LowestLandedCost = {
  badge: string;
  title: string;
  description: string;
  estimatedTotal: string;
  totalSavings: string;
  ctaLabel: string;
};
