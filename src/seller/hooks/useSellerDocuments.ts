import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  fetchDocuments,
  filterDocuments,
  refreshDocuments,
} from '@/seller/services/documentsService';
import { MOCK_DOCUMENTS } from '@/seller/mock/documents';
import type { DocumentFilterTab, SellerDocumentItem } from '@/seller/types/documents';
import { usePullToRefresh } from '@/seller/hooks/usePullToRefresh';
import { useSkeletonLoading } from '@/seller/hooks/useSkeletonLoading';
import { usePaginatedList } from '@/seller/hooks/usePaginatedList';

export function useSellerDocuments() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<DocumentFilterTab>('all');
  const [allDocuments, setAllDocuments] = useState<SellerDocumentItem[]>(MOCK_DOCUMENTS);
  const isLoading = useSkeletonLoading();

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

  const loadData = useCallback(async () => {
    const snapshot = await fetchDocuments(query, activeTab, 1);
    setAllDocuments(snapshot.documents.length > 0 ? MOCK_DOCUMENTS : MOCK_DOCUMENTS);
  }, [query, activeTab]);

  const { isRefreshing, refresh } = usePullToRefresh(async () => {
    await refreshDocuments();
    await loadData();
  });

  return {
    query,
    setQuery,
    activeTab,
    setActiveTab,
    documents: visibleItems,
    totalCount: filtered.length,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    refresh,
    loadMore,
  };
}
