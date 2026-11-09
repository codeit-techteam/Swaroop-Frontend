import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getRevenueSeries,
  getSellerAnalytics,
  refreshSellerAnalytics,
} from '@/seller/services/analyticsService';
import type { RevenueFilterPeriod, SellerAnalyticsSnapshot } from '@/seller/types/analytics';

export function useSellerAnalytics() {
  const [data, setData] = useState<SellerAnalyticsSnapshot>(getSellerAnalytics);
  const [revenuePeriod, setRevenuePeriod] = useState<RevenueFilterPeriod>('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const next = await refreshSellerAnalytics();
        if (!cancelled) {
          setData(next);
          setIsEmpty(
            next.orders.completed === 0 &&
              next.inventory.offersLive === 0 &&
              next.products.active === 0,
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const revenueSeries = useMemo(
    () => getRevenueSeries(revenuePeriod),
    [revenuePeriod, data],
  );

  const changeRevenuePeriod = useCallback((period: RevenueFilterPeriod) => {
    setRevenuePeriod(period);
    setChartKey((key) => key + 1);
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    const next = await refreshSellerAnalytics();
    setData(next);
    setIsEmpty(
      next.orders.completed === 0 &&
        next.inventory.offersLive === 0 &&
        next.products.active === 0,
    );
    setIsRefreshing(false);
  }, []);

  return {
    data,
    revenuePeriod,
    revenueSeries,
    chartKey,
    isLoading,
    isRefreshing,
    isEmpty,
    changeRevenuePeriod,
    refresh,
  };
}

export type UseSellerAnalyticsReturn = ReturnType<typeof useSellerAnalytics>;
