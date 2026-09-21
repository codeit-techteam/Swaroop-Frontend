import { useCallback, useEffect, useState } from 'react';

import { DEBOUNCE_DELAY } from '@/constants';
import {
  addRecentSearch,
  clearRecentSearches,
  getSearchSnapshot,
  searchSellerData,
} from '@/seller/services/searchService';
import type { SearchCategory, SearchResult } from '@/seller/types/search';

export function useSellerSearch() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSnapshot, setRecentSnapshot] = useState(getSearchSnapshot);
  const [isSearching, setIsSearching] = useState(false);
  const isLoading = false;

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const found = await searchSellerData(query, category);
      setResults(found);
      setIsSearching(false);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [query, category]);

  const selectResult = useCallback((result: SearchResult) => {
    addRecentSearch(result.title);
    setRecentSnapshot(getSearchSnapshot());
  }, []);

  const searchRecent = useCallback((term: string) => {
    setQuery(term);
  }, []);

  const clearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSnapshot(getSearchSnapshot());
  }, []);

  return {
    query,
    setQuery,
    category,
    setCategory,
    results,
    recentSearches: recentSnapshot.recentSearches,
    popularSearches: recentSnapshot.popularSearches,
    isLoading,
    isSearching,
    selectResult,
    searchRecent,
    clearRecent,
  };
}
