export type HomeBannerLayoutVariant = 'IMAGE_OVERLAY' | 'NAVY_GRID';

export type HomeBanner = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  buttonLabel: string;
  /** Remote CMS/R2 creative URL (preferred when present). */
  imageUrl: string;
  /** Optional bundled require() asset for offline / default heroes. */
  imageSource?: number;
  targetRoute?: string | null;
  ctaAction?: string | null;
  externalUrl?: string | null;
  targetId?: string | null;
  /** NAVY_GRID = structured CMS hero; IMAGE_OVERLAY = photo creative. */
  layoutVariant?: HomeBannerLayoutVariant | null;
  secondaryButtonLabel?: string | null;
  secondaryCtaAction?: string | null;
  secondaryExternalUrl?: string | null;
  secondaryTargetId?: string | null;
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
  source?: 'saved' | 'gps' | 'pincode' | 'preset' | 'manual';
  addressId?: string | null;
  line1?: string;
  line2?: string | null;
  landmark?: string | null;
  latitude?: number | null;
  longitude?: number | null;
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
