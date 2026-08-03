import { SELLER_ANALYTICS_SEED } from '@/seller/mock/analytics';
import type { RevenueFilterPeriod, SellerAnalyticsSnapshot } from '@/seller/types/analytics';

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

let analyticsState: SellerAnalyticsSnapshot = { ...SELLER_ANALYTICS_SEED };

export const getSellerAnalytics = (): SellerAnalyticsSnapshot => analyticsState;

export const getRevenueSeries = (period: RevenueFilterPeriod): number[] =>
  analyticsState.revenue.filters[period];

export const refreshSellerAnalytics = async (): Promise<SellerAnalyticsSnapshot> => {
  await delay(900);
  analyticsState = {
    ...SELLER_ANALYTICS_SEED,
    revenue: {
      ...SELLER_ANALYTICS_SEED.revenue,
      today: `₹${(24 + Math.random() * 2).toFixed(1)}L`,
    },
  };
  return analyticsState;
};
