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
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
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
    setIsRefreshing(false);
  }, []);

  return {
    data,
    revenuePeriod,
    revenueSeries,
    chartKey,
    isLoading,
    isRefreshing,
    changeRevenuePeriod,
    refresh,
  };
}

export type UseSellerAnalyticsReturn = ReturnType<typeof useSellerAnalytics>;
