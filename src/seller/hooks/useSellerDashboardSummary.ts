import { useCallback, useEffect, useState } from 'react';

import {
  fetchSellerDashboardSummary,
  type SellerDashboardSummary,
} from '@/services/seller-dashboard';
import { logger } from '@/utils/logger';

const emptySummary = (): SellerDashboardSummary => ({
  products: { active: 0, inactive: 0 },
  offers: { active: 0 },
  activeOffers: 0,
  inventory: { lowStockItems: 0 },
  documents: { pending: 0, expiringSoon: 0 },
  purchaseRequests: {
    pending: 0,
    accepted: 0,
    rejected: 0,
    pendingPurchaseRequests: 0,
    expiringSoon: 0,
    acceptedToday: 0,
    rejectedToday: 0,
    counterOffersPending: 0,
  },
  pendingPurchaseRequests: 0,
  expiringSoon: 0,
  acceptedToday: 0,
  rejectedToday: 0,
  counterOffersPending: 0,
});

export function useSellerDashboardSummary() {
  const [summary, setSummary] = useState<SellerDashboardSummary>(emptySummary);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const data = await fetchSellerDashboardSummary();
      setSummary(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(message);
      logger.error('Seller dashboard summary failed', { message });
    } finally {
      setIsHydrated(true);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { summary, isHydrated, error, isRefreshing, refresh };
}
