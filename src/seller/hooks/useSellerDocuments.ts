import { useEffect, useMemo, useState } from 'react';

import {
  fetchDocuments,
  filterDocuments,
  refreshDocuments,
} from '@/seller/services/documentsService';
import type { DocumentFilterTab, SellerDocumentItem } from '@/seller/types/documents';
import { usePullToRefresh } from '@/seller/hooks/usePullToRefresh';
import { usePaginatedList } from '@/seller/hooks/usePaginatedList';

export function useSellerDocuments() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<DocumentFilterTab>('all');
  const [allDocuments, setAllDocuments] = useState<SellerDocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchDocuments(query, activeTab, 1)
      .then((snapshot) => {
        if (!cancelled) {
          setAllDocuments(snapshot.documents);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAllDocuments([]);
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [query, activeTab]);

  const filtered = useMemo(
    () => filterDocuments(allDocuments, query, activeTab),
    [allDocuments, query, activeTab],
  );

  const { visibleItems, hasMore, isLoadingMore, loadMore, reset } = usePaginatedList({
    items: filtered,
  });

  useEffect(() => {
    reset();
  }, [query, activeTab, reset]);

  const { isRefreshing, refresh } = usePullToRefresh(async () => {
    await refreshDocuments();
    const snapshot = await fetchDocuments(query, activeTab, 1);
    setAllDocuments(snapshot.documents);
  });

  return {
    query,
    setQuery,
    activeTab,
    setActiveTab,
    documents: visibleItems,
    totalCount: filtered.length,
    hasMore,
    isLoadingMore,
    loadMore,
    isLoading,
    isRefreshing,
    refresh,
  };
}
