import {
  fetchSellerDashboardSummary,
  type SellerDashboardSummary,
} from '@/services/seller-dashboard';
import { fetchSellerOrderSummary } from '@/services/seller-orders-api';
import { fetchSellerSettlementSummary } from '@/services/seller-settlements';
import { fetchSellerOffersSummary } from '@/seller/modules/seller-offers/services/sellerOffersApi';
import type { RevenueFilterPeriod, SellerAnalyticsSnapshot } from '@/seller/types/analytics';

const zeroSeries = (period: RevenueFilterPeriod): number[] => {
  const lengths: Record<RevenueFilterPeriod, number> = {
    '7d': 7,
    '30d': 30,
    '3m': 12,
    '1y': 12,
  };
  return Array.from({ length: lengths[period] }, () => 0);
};

export function emptySellerAnalyticsSnapshot(): SellerAnalyticsSnapshot {
  return {
    revenue: {
      today: '₹0',
      monthly: '₹0',
      filters: {
        '7d': zeroSeries('7d'),
        '30d': zeroSeries('30d'),
        '3m': zeroSeries('3m'),
        '1y': zeroSeries('1y'),
      },
    },
    orders: { completed: 0, breakdown: [] },
    products: { active: 0, topSelling: [] },
    inventory: {
      value: '₹0',
      offersLive: 0,
      conversionRate: '0%',
      customerRating: '—',
    },
    settlement: {
      pending: '₹0',
      released: '₹0',
      tds: '₹0',
      platformFees: '₹0',
      netEarnings: '₹0',
    },
    warehouses: [],
    shipments: {
      live: 0,
      delayed: 0,
      delivered: 0,
      averageEta: '—',
      averageTransitTime: '—',
    },
    activities: [],
  };
}

const inr = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) return '₹0';
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2)}Cr`;
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(1)}L`;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
};

const num = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

function snapshotFromApi(input: {
  dashboard: SellerDashboardSummary | null;
  orders: Awaited<ReturnType<typeof fetchSellerOrderSummary>> | null;
  offers: Awaited<ReturnType<typeof fetchSellerOffersSummary>> | null;
  settlement: Awaited<ReturnType<typeof fetchSellerSettlementSummary>> | null;
}): { snapshot: SellerAnalyticsSnapshot; isEmpty: boolean } {
  const base = emptySellerAnalyticsSnapshot();
  const delivered = input.orders?.delivered ?? 0;
  const activeProducts = input.dashboard?.products.active ?? 0;
  const offersLive =
    input.dashboard?.activeOffers ??
    input.dashboard?.offers.active ??
    input.offers?.active ??
    0;
  const totalSales = num(input.settlement?.totalSales);
  const settled = num(input.settlement?.settledAmount);
  const pending = num(input.settlement?.pendingSettlementAmount);

  const snapshot: SellerAnalyticsSnapshot = {
    ...base,
    orders: {
      completed: delivered,
      breakdown:
        delivered > 0
          ? [
              {
                id: 'delivered',
                label: 'Delivered',
                count: delivered,
                percentage: input.orders?.total
                  ? Math.round((delivered / input.orders.total) * 100)
                  : 100,
              },
            ]
          : [],
    },
    products: { ...base.products, active: activeProducts },
    inventory: { ...base.inventory, offersLive },
    settlement: {
      pending: inr(pending),
      released: inr(settled),
      tds: '₹0',
      platformFees: '₹0',
      netEarnings: inr(Math.max(0, settled - pending)),
    },
    revenue: {
      today: '₹0',
      monthly: inr(totalSales),
      filters: base.revenue.filters,
    },
  };

  const isEmpty =
    delivered === 0 &&
    totalSales <= 0 &&
    settled <= 0 &&
    pending <= 0 &&
    offersLive === 0 &&
    activeProducts === 0;

  return { snapshot, isEmpty };
}

let analyticsState: SellerAnalyticsSnapshot = emptySellerAnalyticsSnapshot();
let analyticsEmpty = true;

export const getSellerAnalytics = (): SellerAnalyticsSnapshot => analyticsState;

export const sellerAnalyticsIsEmpty = (): boolean => analyticsEmpty;

export const getRevenueSeries = (period: RevenueFilterPeriod): number[] =>
  analyticsState.revenue.filters[period];

export async function refreshSellerAnalytics(): Promise<SellerAnalyticsSnapshot> {
  const [dashboard, orders, offers, settlement] = await Promise.all([
    fetchSellerDashboardSummary().catch(() => null),
    fetchSellerOrderSummary().catch(() => null),
    fetchSellerOffersSummary().catch(() => null),
    fetchSellerSettlementSummary().catch(() => null),
  ]);

  const built = snapshotFromApi({ dashboard, orders, offers, settlement });
  analyticsState = built.snapshot;
  analyticsEmpty = built.isEmpty;
  return analyticsState;
}
