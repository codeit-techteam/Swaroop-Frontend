import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { materialsTaxonomy, type SellerMaterialFamily } from '@/constants/materials-taxonomy';
import {
  addRecentMarketSearch,
  clearRecentMarketSearches,
  getRecentMarketSearches,
} from '@/services/marketSearch';
import type { MarketCategory, MarketProduct } from '@/types/market';
import { getGradeSearchSuggestions, searchProductsByGrade } from '@/utils/grade-search';

const POPULAR_MATERIAL_LIMIT = 6;

const matchesCategory = (product: MarketProduct, category: MarketCategory): boolean =>
  product.category === category || product.materialType === category;

export const useMarketSearch = (catalog: MarketProduct[]) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | null>('Polypropylene');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestionsDismissed, setSuggestionsDismissed] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentMarketSearches);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (blurTimer.current) {
        clearTimeout(blurTimer.current);
      }
    };
  }, []);

  const popularMaterials = useMemo(
    () =>
      [...materialsTaxonomy]
        .sort((a, b) => b.gradeCount - a.gradeCount)
        .slice(0, POPULAR_MATERIAL_LIMIT),
    [],
  );

  const suggestions = useMemo(
    () => getGradeSearchSuggestions(catalog, materialsTaxonomy, query),
    [catalog, query],
  );

  const rankedProducts = useMemo(() => searchProductsByGrade(catalog, query), [catalog, query]);

  const { filteredProducts, expandedAcrossCategories } = useMemo(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      const inCategory = selectedCategory
        ? catalog.filter((product) => matchesCategory(product, selectedCategory))
        : catalog;
      return { filteredProducts: inCategory, expandedAcrossCategories: false };
    }

    if (!selectedCategory) {
      return { filteredProducts: rankedProducts, expandedAcrossCategories: false };
    }

    const inCategory = rankedProducts.filter((product) =>
      matchesCategory(product, selectedCategory),
    );
    if (inCategory.length === 0 && rankedProducts.length > 0) {
      return { filteredProducts: rankedProducts, expandedAcrossCategories: true };
    }

    return { filteredProducts: inCategory, expandedAcrossCategories: false };
  }, [catalog, query, rankedProducts, selectedCategory]);

  const showSuggestions = isFocused && !suggestionsDismissed;

  const rememberQuery = useCallback((term: string) => {
    setRecentSearches(addRecentMarketSearch(term));
  }, []);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setSuggestionsDismissed(false);
  }, []);

  const handleFocus = useCallback(() => {
    if (blurTimer.current) {
      clearTimeout(blurTimer.current);
    }
    setIsFocused(true);
    setSuggestionsDismissed(false);
  }, []);

  const handleBlur = useCallback(() => {
    if (blurTimer.current) {
      clearTimeout(blurTimer.current);
    }
    blurTimer.current = setTimeout(() => {
      setIsFocused(false);
    }, 180);
  }, []);

  const handleDismissSuggestions = useCallback(() => {
    if (blurTimer.current) {
      clearTimeout(blurTimer.current);
    }
    setIsFocused(false);
    setSuggestionsDismissed(true);
  }, []);

  const handleClear = useCallback(() => {
    setQuery('');
    setSuggestionsDismissed(false);
    setIsFocused(true);
  }, []);

  const handleSubmit = useCallback(() => {
    rememberQuery(query);
    handleDismissSuggestions();
  }, [handleDismissSuggestions, query, rememberQuery]);

  const handleViewAll = useCallback(() => {
    rememberQuery(query);
    handleDismissSuggestions();
  }, [handleDismissSuggestions, query, rememberQuery]);

  const handleSelectMaterial = useCallback(
    (material: SellerMaterialFamily) => {
      setQuery(material.code);
      setSelectedCategory(material.name);
      rememberQuery(material.code);
      handleDismissSuggestions();
    },
    [handleDismissSuggestions, rememberQuery],
  );

  const handleSelectRecent = useCallback(
    (term: string) => {
      setQuery(term);
      rememberQuery(term);
      handleDismissSuggestions();
    },
    [handleDismissSuggestions, rememberQuery],
  );

  const handleSelectProduct = useCallback(
    (product: MarketProduct) => {
      rememberQuery(product.name);
      handleDismissSuggestions();
    },
    [handleDismissSuggestions, rememberQuery],
  );

  const handleClearRecent = useCallback(() => {
    clearRecentMarketSearches();
    setRecentSearches([]);
  }, []);

  const handleSelectCategory = useCallback(
    (category: MarketCategory | null) => {
      setSelectedCategory(category);
      handleDismissSuggestions();
    },
    [handleDismissSuggestions],
  );

  return {
    query,
    selectedCategory,
    filteredProducts,
    expandedAcrossCategories,
    suggestions,
    recentSearches,
    popularMaterials,
    showSuggestions,
    handleQueryChange,
    handleFocus,
    handleBlur,
    handleClear,
    handleSubmit,
    handleViewAll,
    handleSelectMaterial,
    handleSelectRecent,
    handleSelectProduct,
    handleClearRecent,
    handleSelectCategory,
    handleDismissSuggestions,
  };
};
