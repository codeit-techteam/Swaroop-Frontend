import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { materialsFromCatalog, type SellerMaterialFamily } from '@/constants/materials-taxonomy';
import {
  addRecentMarketSearch,
  clearRecentMarketSearches,
  getRecentMarketSearches,
} from '@/services/marketSearch';
import type { MarketCategory, MarketProduct } from '@/types/market';
import { getGradeSearchSuggestions, searchProductsByGrade } from '@/utils/grade-search';

const POPULAR_MATERIAL_LIMIT = 6;
const PREFERRED_DEFAULT_CATEGORY: MarketCategory = 'Polypropylene';

const matchesCategory = (product: MarketProduct, category: MarketCategory): boolean =>
  product.category === category || product.materialType === category;

const resolveDefaultCategory = (catalog: MarketProduct[]): MarketCategory | null => {
  if (catalog.length === 0) {
    return null;
  }

  const available = new Set(
    catalog.flatMap((product) =>
      [product.category, product.materialType].filter(Boolean) as MarketCategory[],
    ),
  );

  if (available.has(PREFERRED_DEFAULT_CATEGORY)) {
    return PREFERRED_DEFAULT_CATEGORY;
  }

  return null;
};

export const useMarketSearch = (catalog: MarketProduct[]) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestionsDismissed, setSuggestionsDismissed] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentMarketSearches);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSyncedCategory = useRef(false);

  useEffect(() => {
    return () => {
      if (blurTimer.current) {
        clearTimeout(blurTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (catalog.length === 0) {
      return;
    }

    setSelectedCategory((current) => {
      const available = new Set(
        catalog.flatMap((product) =>
          [product.category, product.materialType].filter(Boolean) as MarketCategory[],
        ),
      );

      // Respect an explicit "All" selection after the first catalog sync.
      if (hasSyncedCategory.current && current === null) {
        return null;
      }

      if (current && available.has(current)) {
        hasSyncedCategory.current = true;
        return current;
      }

      hasSyncedCategory.current = true;
      return resolveDefaultCategory(catalog);
    });
  }, [catalog]);

  const taxonomy = useMemo(() => materialsFromCatalog(catalog), [catalog]);

  const popularMaterials = useMemo(
    () =>
      [...taxonomy]
        .sort((a, b) => b.gradeCount - a.gradeCount)
        .slice(0, POPULAR_MATERIAL_LIMIT),
    [taxonomy],
  );

  const suggestions = useMemo(
    () => getGradeSearchSuggestions(catalog, taxonomy, query),
    [catalog, query, taxonomy],
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

  const clearBlurTimer = useCallback(() => {
    if (blurTimer.current) {
      clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
  }, []);

  const rememberQuery = useCallback((term: string) => {
    setRecentSearches(addRecentMarketSearch(term));
  }, []);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    // Empty text while focused keeps idle suggestions (recent / popular).
    // Clear (X) uses handleClear to restore the browse list instead.
    setSuggestionsDismissed(false);
  }, []);

  const handleFocus = useCallback(() => {
    clearBlurTimer();
    setIsFocused(true);
    setSuggestionsDismissed(false);
  }, [clearBlurTimer]);

  const handleBlur = useCallback(() => {
    clearBlurTimer();
    blurTimer.current = setTimeout(() => {
      setIsFocused(false);
    }, 180);
  }, [clearBlurTimer]);

  const handleDismissSuggestions = useCallback(() => {
    clearBlurTimer();
    setIsFocused(false);
    setSuggestionsDismissed(true);
  }, [clearBlurTimer]);

  /** Clear restores the catalog browse list — never leave a blank suggestions overlay. */
  const handleClear = useCallback(() => {
    clearBlurTimer();
    setQuery('');
    setIsFocused(false);
    setSuggestionsDismissed(true);
  }, [clearBlurTimer]);

  const handleSubmit = useCallback(() => {
    rememberQuery(query);
    handleDismissSuggestions();
  }, [handleDismissSuggestions, query, rememberQuery]);

  const handleViewAll = useCallback(() => {
    rememberQuery(query);
    handleDismissSuggestions();
  }, [handleDismissSuggestions, query, rememberQuery]);

  const handleBrowseAll = useCallback(() => {
    clearBlurTimer();
    setQuery('');
    setSelectedCategory(null);
    setIsFocused(false);
    setSuggestionsDismissed(true);
  }, [clearBlurTimer]);

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
    handleBrowseAll,
    handleSelectMaterial,
    handleSelectRecent,
    handleSelectProduct,
    handleClearRecent,
    handleSelectCategory,
    handleDismissSuggestions,
  };
};
