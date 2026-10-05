import { useEffect, useState } from 'react';

import { useDebouncedValue } from '@/hooks/use-debounce';
import { searchSellerCatalogProducts } from '@/services/catalog';
import type { MarketProduct } from '@/types/market';

type SearchState = {
  key: string;
  results: MarketProduct[];
  error: string | null;
};

/**
 * Debounced Grade Master search against the backend. Returns `results: null`
 * while the query is empty so callers can fall back to family browsing.
 */
export function useSellerGradeSearch(query: string) {
  const debounced = useDebouncedValue(query.trim(), 300);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<SearchState | null>(null);
  const requestKey = `${attempt}|${debounced}`;

  useEffect(() => {
    if (!debounced) return;
    let cancelled = false;
    searchSellerCatalogProducts(debounced)
      .then((results) => {
        if (!cancelled) setState({ key: requestKey, results, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            key: requestKey,
            results: [],
            error: error instanceof Error ? error.message : 'Unable to search Grade Master.',
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, requestKey]);

  if (!query.trim()) {
    return { results: null, loading: false, error: null, retry: () => undefined };
  }
  const settled = state?.key === requestKey && debounced === query.trim();
  return {
    results: settled ? state.results : [],
    loading: !settled,
    error: settled ? state.error : null,
    retry: () => setAttempt((value) => value + 1),
  };
}
