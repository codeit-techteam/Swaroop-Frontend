import { useCallback, useEffect, useState } from 'react';

import { fetchCustomerMarketplaceProducts } from '@/services/catalog';
import type { MarketProduct } from '@/types/market';

type CatalogState = {
  products: MarketProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useMarketplaceCatalogQuery = (): CatalogState => {
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchCustomerMarketplaceProducts();
      setProducts(next);
    } catch (cause) {
      setProducts([]);
      setError(cause instanceof Error ? cause.message : 'Unable to load marketplace catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { products, loading, error, refetch };
};

export const useMarketplaceCatalog = (): MarketProduct[] => {
  return useMarketplaceCatalogQuery().products;
};
