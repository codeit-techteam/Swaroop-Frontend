import { useCallback, useEffect, useState } from 'react';

import { fetchCustomerMarketplaceProducts } from '@/services/catalog';
import type { MarketProduct } from '@/types/market';

type CatalogState = {
  products: MarketProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Shared marketplace catalogue hook.
 * Multiple screens (Market, Home via service cache, PR create, PDP) coalesce
 * through `fetchCustomerMarketplaceProducts` in-flight + memory cache.
 */
export const useMarketplaceCatalogQuery = (): CatalogState => {
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchCustomerMarketplaceProducts({ force });
      setProducts(next);
    } catch (cause) {
      setProducts([]);
      setError(cause instanceof Error ? cause.message : 'Unable to load marketplace catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await load(true);
  }, [load]);

  useEffect(() => {
    void load(false);
  }, [load]);

  return { products, loading, error, refetch };
};

export const useMarketplaceCatalog = (): MarketProduct[] => {
  return useMarketplaceCatalogQuery().products;
};
