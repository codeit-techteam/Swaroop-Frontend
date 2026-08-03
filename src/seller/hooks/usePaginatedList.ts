import { useCallback, useMemo, useState } from 'react';

import { PAGINATION } from '@/constants';

type UsePaginatedListOptions<T> = {
  items: T[];
  pageSize?: number;
};

export function usePaginatedList<T>({ items, pageSize = PAGINATION.DEFAULT_LIMIT }: UsePaginatedListOptions<T>) {
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const visibleItems = useMemo(() => items.slice(0, page * pageSize), [items, page, pageSize]);
  const hasMore = visibleItems.length < items.length;

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    setPage((current) => current + 1);
    setIsLoadingMore(false);
  }, [hasMore, isLoadingMore]);

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  return {
    visibleItems,
    hasMore,
    isLoadingMore,
    loadMore,
    reset,
    page,
  };
}
