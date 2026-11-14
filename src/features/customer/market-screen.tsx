import { useCallback, useMemo, useRef, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  View,
  type ListRenderItem,
  type TextInputInstance,
} from 'react-native';

import { type Href, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LocationBottomSheet } from '@/components/home';
import { HeroCarousel } from '@/components/home/hero-carousel';
import {
  CategoryFilter,
  EmptyState,
  GradeCard,
  GradeMasterEntry,
  MarketFilterSheet,
  MarketHeader,
  ProductCard,
  SearchBar,
  SearchSuggestions,
  StickyMarketToolbar,
} from '@/components/market';
import { MarketListSkeleton } from '@/components/ui/skeleton';
import { Typography } from '@/components/ui/typography';
import { TAB_BAR_HEIGHT } from '@/constants/dashboard';
import { marketCategoryChips } from '@/constants/marketProducts';
import { materialsFromCatalog } from '@/constants/materials-taxonomy';
import { useDebouncedValue } from '@/hooks/use-debounce';
import { useDeliveryLocation } from '@/hooks/use-delivery-location';
import {
  queryErrorMessage,
  useCustomerGradeBrowse,
  useCustomerMarketplaceCategories,
} from '@/hooks/use-grade-master';
import { useMarketSearch } from '@/hooks/use-market-search';
import { useMarketplaceCatalogQuery } from '@/hooks/use-marketplace-catalog';
import { openCustomerBanner, openCustomerBannerSecondary } from '@/lib/cms-banner';
import { ROUTES } from '@/navigation/routes';
import { fetchCustomerMarketplaceBanners, trackCmsBannerEvent } from '@/services/cms';
import type { CustomerGrade, GradeBrowseFilters } from '@/types/grade-master';
import type { HomeBanner } from '@/types/home';
import type { MarketProduct } from '@/types/market';
import { SUGGESTION_GRADE_LIMIT, getGradeSearchSuggestions } from '@/utils/grade-search';
import {
  EMPTY_MARKET_FILTERS,
  MARKET_SORT_OPTIONS,
  applyMarketFilters,
  buildMarketFacets,
  countActiveMarketFilters,
  type MarketFilters,
} from '@/utils/market-filters';
import { buildMarketSearchRows, type MarketSearchRow } from '@/utils/market-search-rows';

const SEARCH_DEBOUNCE_MS = 220;

export const CustomerMarketScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const searchInputRef = useRef<TextInputInstance>(null);
  const locationSheetRef = useRef<BottomSheetModal>(null);
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const { selectedLocation, openAddressForm } = useDeliveryLocation();
  const params = useLocalSearchParams<{
    focusSearch?: string | string[];
    openFilters?: string | string[];
  }>();
  const { products: marketProducts, loading, error, refetch } = useMarketplaceCatalogQuery();
  const [promoBanners, setPromoBanners] = useState<HomeBanner[]>([]);
  // B-07: real catalogue filters (stock, credit, price, MOQ, manufacturer, origin, sort).
  const [filters, setFilters] = useState<MarketFilters>(EMPTY_MARKET_FILTERS);
  const {
    query,
    selectedCategory,
    filteredProducts: searchedProducts,
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
  } = useMarketSearch(marketProducts);

  const trimmedQuery = query.trim();
  const debouncedSearch = useDebouncedValue(trimmedQuery, SEARCH_DEBOUNCE_MS);
  // Enter catalogue mode as soon as the user types; only fire the API after debounce.
  const wantsCatalogueSearch = trimmedQuery.length > 0;
  const isSearchPending = wantsCatalogueSearch && trimmedQuery !== debouncedSearch;

  // Free-text search spans the full catalogue. Category chips refine the
  // *display* of results; applying categoryId to the grades API while the
  // user is typing "PVC" incorrectly yields "0 grades" when a non-PVC chip
  // was previously selected.
  const catalogueFilters = useMemo<GradeBrowseFilters>(
    () => ({
      search: debouncedSearch,
      categoryId: debouncedSearch ? undefined : selectedCategory,
    }),
    [debouncedSearch, selectedCategory],
  );
  const gradesQuery = useCustomerGradeBrowse(catalogueFilters, {
    enabled: debouncedSearch.length > 0,
  });
  const catalogueGrades = useMemo(
    () => gradesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [gradesQuery.data],
  );
  const catalogueTotal = gradesQuery.data?.pages[0]?.total ?? 0;

  // Amazon-style typeahead: merge live listings with debounced Grade Master hits.
  const suggestions = useMemo(() => {
    const taxonomy = materialsFromCatalog(marketProducts);
    const merged = getGradeSearchSuggestions(marketProducts, taxonomy, query, {
      grades: catalogueGrades,
      gradeLimit: SUGGESTION_GRADE_LIMIT,
    });
    // Prefer server total when the debounced catalogue page has landed.
    if (debouncedSearch.length > 0 && trimmedQuery === debouncedSearch && catalogueTotal > 0) {
      return { ...merged, totalGrades: catalogueTotal };
    }
    return merged;
  }, [catalogueGrades, catalogueTotal, debouncedSearch, marketProducts, query, trimmedQuery]);

  const filteredProducts = useMemo(
    () => applyMarketFilters(searchedProducts, filters),
    [filters, searchedProducts],
  );
  const activeFilterCount = useMemo(() => countActiveMarketFilters(filters), [filters]);
  // Facets come from the whole buyable catalogue so the sheet only offers real values.
  const facets = useMemo(() => buildMarketFacets(marketProducts), [marketProducts]);
  const previewFilterCount = useCallback(
    (draft: MarketFilters) => applyMarketFilters(searchedProducts, draft).length,
    [searchedProducts],
  );
  const { data: gradeCategories } = useCustomerMarketplaceCategories();
  const searchRows = useMemo(
    () =>
      debouncedSearch.length > 0
        ? buildMarketSearchRows(catalogueGrades, marketProducts, debouncedSearch)
        : [],
    [catalogueGrades, debouncedSearch, marketProducts],
  );
  // Keep chips synchronized with search: only categories that appear in the
  // current result set (or live catalogue). Never swap to unrelated chips
  // (e.g. ACETONE / ALKYL / BOPP) while searching PVC.
  const categories = useMemo(() => {
    if (!wantsCatalogueSearch) {
      return marketCategoryChips(gradeCategories ?? [], marketProducts);
    }
    const fromSearchRows = searchRows
      .map((row) =>
        row.kind === 'product'
          ? row.product.masterCategoryId
          : row.grade.category?.id,
      )
      .filter((id): id is string => Boolean(id));
    const listed = new Set(fromSearchRows);
    if (listed.size === 0) {
      return marketCategoryChips(gradeCategories ?? [], marketProducts);
    }
    return (gradeCategories ?? [])
      .filter((category) => listed.has(category.id))
      .map((category) => ({ id: category.id, label: category.displayName }));
  }, [gradeCategories, marketProducts, searchRows, wantsCatalogueSearch]);
  const selectedCategoryLabel = useMemo(
    () => categories.find((category) => category.id === selectedCategory)?.label ?? null,
    [categories, selectedCategory],
  );
  const totalGradeCount = useMemo(
    () => (gradeCategories ?? []).reduce((sum, category) => sum + category.gradeCount, 0),
    [gradeCategories],
  );

  const paramIsSet = useCallback((value: string | string[] | undefined) => {
    if (typeof value === 'string') return value === '1';
    return Array.isArray(value) && value[0] === '1';
  }, []);

  const shouldAutoFocus = useMemo(
    () => paramIsSet(params.focusSearch),
    [paramIsSet, params.focusSearch],
  );
  const shouldOpenFilters = useMemo(
    () => paramIsSet(params.openFilters),
    [paramIsSet, params.openFilters],
  );

  // Home search taps Market with focusSearch=1. Tab screens stay mounted, so
  // autoFocus alone is unreliable — focus the input whenever the param arrives.
  useFocusEffect(
    useCallback(() => {
      if (!shouldAutoFocus) return undefined;
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
        handleFocus();
        router.setParams({ focusSearch: undefined });
      }, 120);
      return () => clearTimeout(timer);
    }, [handleFocus, router, shouldAutoFocus]),
  );

  // Home Filter icon opens Market with the filter sheet already presented.
  useFocusEffect(
    useCallback(() => {
      if (!shouldOpenFilters) return undefined;
      const timer = setTimeout(() => {
        Keyboard.dismiss();
        filterSheetRef.current?.present();
        router.setParams({ openFilters: undefined });
      }, 180);
      return () => clearTimeout(timer);
    }, [router, shouldOpenFilters]),
  );

  const handleLocationPress = useCallback(() => {
    locationSheetRef.current?.present();
  }, []);

  const handleCartPress = useCallback(() => {
    router.push(ROUTES.CUSTOMER.CART as Href);
  }, [router]);

  const openGradeRequest = useCallback(() => {
    Keyboard.dismiss();
    const term = query.trim();
    router.push(
      (term
        ? { pathname: ROUTES.CUSTOMER.GRADE_REQUEST_NEW, params: { search: term } }
        : ROUTES.CUSTOMER.GRADE_REQUEST_NEW) as unknown as Href,
    );
  }, [query, router]);

  const openGradeBrowser = useCallback(() => {
    Keyboard.dismiss();
    const search = query.trim();
    router.push({
      pathname: ROUTES.CUSTOMER.GRADES,
      params: {
        ...(search ? { search } : {}),
        ...(selectedCategory ? { categoryId: selectedCategory } : {}),
      },
    } as unknown as Href);
  }, [query, router, selectedCategory]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void fetchCustomerMarketplaceBanners()
        .then((items) => {
          if (!cancelled) setPromoBanners(items);
        })
        .catch(() => {
          if (!cancelled) setPromoBanners([]);
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const handlePromoAction = useCallback(
    (banner: HomeBanner) => {
      trackCmsBannerEvent(banner.id, 'CLICK');
      openCustomerBanner(router, banner);
    },
    [router],
  );

  const handlePromoSecondary = useCallback(
    (banner: HomeBanner) => {
      trackCmsBannerEvent(banner.id, 'CLICK');
      openCustomerBannerSecondary(router, banner);
    },
    [router],
  );

  const handlePromoImpression = useCallback((banner: HomeBanner) => {
    trackCmsBannerEvent(banner.id, 'IMPRESSION');
  }, []);

  const handleFilterPress = useCallback(() => {
    Keyboard.dismiss();
    // Defer present until after keyboard teardown — otherwise the sheet can
    // fail to attach on the first tap while the search field still has focus.
    requestAnimationFrame(() => {
      filterSheetRef.current?.present();
    });
  }, []);

  const handleSortPress = useCallback(() => {
    setFilters((prev) => {
      const idx = MARKET_SORT_OPTIONS.findIndex((opt) => opt.value === prev.sort);
      const next = MARKET_SORT_OPTIONS[(idx + 1) % MARKET_SORT_OPTIONS.length]!;
      return { ...prev, sort: next.value };
    });
  }, []);

  const handleApplyFilters = useCallback((next: MarketFilters) => {
    setFilters(next);
    filterSheetRef.current?.dismiss();
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(EMPTY_MARKET_FILTERS);
  }, []);

  const openProduct = useCallback(
    (product: MarketProduct) => {
      Keyboard.dismiss();
      router.push({
        pathname: ROUTES.CUSTOMER.PRODUCT_DETAILS,
        params: { id: product.id },
      } as unknown as Href);
    },
    [router],
  );

  const openGrade = useCallback(
    (grade: CustomerGrade) => {
      Keyboard.dismiss();
      router.push({
        pathname: ROUTES.CUSTOMER.GRADE_DETAILS,
        params: { id: grade.id },
      } as unknown as Href);
    },
    [router],
  );

  const handleSuggestionProduct = useCallback(
    (product: MarketProduct) => {
      handleSelectProduct(product);
      openProduct(product);
    },
    [handleSelectProduct, openProduct],
  );

  const handleSuggestionGrade = useCallback(
    (grade: CustomerGrade) => {
      handleDismissSuggestions();
      openGrade(grade);
    },
    [handleDismissSuggestions, openGrade],
  );

  const handleSubmitSearch = useCallback(() => {
    Keyboard.dismiss();
    handleSubmit();
  }, [handleSubmit]);

  const handleViewAllResults = useCallback(() => {
    Keyboard.dismiss();
    handleViewAll();
  }, [handleViewAll]);

  const handleBrowseCatalog = useCallback(() => {
    Keyboard.dismiss();
    handleBrowseAll();
  }, [handleBrowseAll]);

  const handleClearSearch = useCallback(() => {
    Keyboard.dismiss();
    handleClear();
  }, [handleClear]);

  const handleShowAllCategories = useCallback(() => {
    handleSelectCategory(null);
  }, [handleSelectCategory]);

  const handleDismissOverlay = useCallback(() => {
    Keyboard.dismiss();
    handleDismissSuggestions();
  }, [handleDismissSuggestions]);

  const handleEndReached = useCallback(() => {
    if (!wantsCatalogueSearch) return;
    if (gradesQuery.hasNextPage && !gradesQuery.isFetchingNextPage) {
      void gradesQuery.fetchNextPage();
    }
  }, [gradesQuery, wantsCatalogueSearch]);

  const renderLiveItem = useCallback(
    ({ item, index }: { item: MarketProduct; index: number }) => (
      <ProductCard product={item} index={index} onBookNow={openProduct} />
    ),
    [openProduct],
  );

  const renderSearchItem = useCallback<ListRenderItem<MarketSearchRow>>(
    ({ item, index }) => {
      if (item.kind === 'product') {
        return <ProductCard product={item.product} index={index} onBookNow={openProduct} />;
      }
      return <GradeCard grade={item.grade} onPress={openGrade} />;
    },
    [openGrade, openProduct],
  );

  const liveKeyExtractor = useCallback((item: MarketProduct) => item.id, []);
  const searchKeyExtractor = useCallback((item: MarketSearchRow) => item.key, []);

  const catalogueGradeHits = useMemo(
    () => searchRows.filter((row) => row.kind === 'grade').length,
    [searchRows],
  );
  const liveSearchHits = useMemo(
    () => searchRows.filter((row) => row.kind === 'product').length,
    [searchRows],
  );
  // Prefer backend Grade Master total; fall back to loaded grade rows so we
  // never show "0 Catalogue Grades" while matching cards are on screen.
  const resultCount = wantsCatalogueSearch
    ? catalogueTotal > 0
      ? catalogueTotal
      : catalogueGradeHits > 0
        ? catalogueGradeHits
        : liveSearchHits
    : filteredProducts.length;
  // Catalogue search uses Grade Master totals; default Market view shows live seller offers only.
  const resultLabel = wantsCatalogueSearch
    ? catalogueTotal > 0 || catalogueGradeHits > 0
      ? resultCount === 1
        ? 'Catalogue Grade'
        : 'Catalogue Grades'
      : resultCount === 1
        ? 'Live Listing'
        : 'Live Listings'
    : resultCount === 1
      ? 'Live Listing'
      : 'Live Listings';
  const listBottomPadding = TAB_BAR_HEIGHT + insets.bottom + 24;
  const showCatalogueSkeleton =
    wantsCatalogueSearch &&
    (isSearchPending ||
      gradesQuery.isPending ||
      (debouncedSearch.length === 0 && searchRows.length === 0)) &&
    !gradesQuery.isError;

  if (loading) {
    return (
      <View className="flex-1 bg-brand-white" accessibilityState={{ busy: true }}>
        <MarketHeader
          locationLabel={selectedLocation.label}
          onLocationPress={handleLocationPress}
          onCartPress={handleCartPress}
        />
        <MarketListSkeleton />
        <LocationBottomSheet
          ref={locationSheetRef}
          selectedId={selectedLocation.id}
          onAddAddress={openAddressForm}
        />
      </View>
    );
  }

  if (error && marketProducts.length === 0 && !trimmedQuery) {
    return (
      <View className="flex-1 bg-brand-white">
        <MarketHeader
          locationLabel={selectedLocation.label}
          onLocationPress={handleLocationPress}
          onCartPress={handleCartPress}
        />
        <EmptyState
          title="Unable to load catalog"
          description={error}
          actionLabel="Retry"
          onActionPress={() => {
            void refetch();
          }}
        />
        <LocationBottomSheet
          ref={locationSheetRef}
          selectedId={selectedLocation.id}
          onAddAddress={openAddressForm}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-white">
      <MarketHeader
        locationLabel={selectedLocation.label}
        onLocationPress={handleLocationPress}
        onCartPress={handleCartPress}
      />

      {/* Compact search row — kept outside the list so cards enter the first viewport sooner. */}
      <View className="border-b border-brand-border/60 bg-brand-white px-0 pb-sm pt-sm">
        <SearchBar
          ref={searchInputRef}
          value={query}
          onChangeText={handleQueryChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmit={handleSubmitSearch}
          onClear={handleClearSearch}
          autoFocus={shouldAutoFocus}
        />
        {!showSuggestions ? (
          <View className="mt-sm">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
            />
          </View>
        ) : null}
      </View>

      {showSuggestions ? (
        <View className="flex-1 pt-sm" style={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom }}>
          <SearchSuggestions
            query={query}
            suggestions={suggestions}
            recentSearches={recentSearches}
            popularMaterials={popularMaterials}
            isSearching={
              wantsCatalogueSearch &&
              (isSearchPending || gradesQuery.isFetching || gradesQuery.isPending)
            }
            onSelectMaterial={(material) => {
              Keyboard.dismiss();
              handleSelectMaterial(material);
            }}
            onSelectProduct={handleSuggestionProduct}
            onSelectGrade={handleSuggestionGrade}
            onSelectRecent={(term) => {
              Keyboard.dismiss();
              handleSelectRecent(term);
            }}
            onViewAll={handleViewAllResults}
            onBrowseAll={handleBrowseCatalog}
            onRequestNewGrade={openGradeRequest}
            onClearRecent={handleClearRecent}
          />
        </View>
      ) : (
        <>
          <StickyMarketToolbar
            resultLabel={
              showCatalogueSkeleton || isSearchPending || gradesQuery.isPlaceholderData
                ? trimmedQuery
                  ? 'Searching Catalogue Grades…'
                  : `${filteredProducts.length.toLocaleString('en-IN')} ${
                      filteredProducts.length === 1 ? 'Live Listing' : 'Live Listings'
                    }`
                : trimmedQuery
                  ? `${resultCount.toLocaleString('en-IN')} ${resultLabel} for “${trimmedQuery}”`
                  : selectedCategoryLabel
                    ? `${resultCount.toLocaleString('en-IN')} ${resultLabel} in ${selectedCategoryLabel}`
                    : `${resultCount.toLocaleString('en-IN')} ${resultLabel}`
            }
            filterLabel={activeFilterCount > 0 ? `Filter · ${activeFilterCount}` : 'Filter'}
            sortLabel={
              filters.sort === 'price-asc'
                ? 'Price ↑'
                : filters.sort === 'price-desc'
                  ? 'Price ↓'
                  : filters.sort === 'moq-asc'
                    ? 'MOQ'
                    : 'Sort'
            }
            onFilterPress={handleFilterPress}
            onSortPress={handleSortPress}
            onClearFilters={handleClearFilters}
            showClear={!wantsCatalogueSearch && activeFilterCount > 0}
          />

          {showCatalogueSkeleton ? (
            <MarketListSkeleton />
          ) : wantsCatalogueSearch && gradesQuery.isError ? (
            <EmptyState
              title="Search failed"
              description={queryErrorMessage(gradesQuery.error, 'Please try again.')}
              actionLabel="Retry"
              onActionPress={() => {
                void gradesQuery.refetch();
              }}
            />
          ) : wantsCatalogueSearch ? (
            <FlatList
              data={searchRows}
              keyExtractor={searchKeyExtractor}
              renderItem={renderSearchItem}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              onScrollBeginDrag={handleDismissOverlay}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              ListHeaderComponent={
                <GradeMasterEntry
                  onPress={openGradeBrowser}
                  gradeCount={totalGradeCount}
                  query={trimmedQuery}
                />
              }
              ListFooterComponent={
                gradesQuery.isFetchingNextPage ? (
                  <View className="py-lg">
                    <ActivityIndicator />
                  </View>
                ) : searchRows.length > 0 && !gradesQuery.hasNextPage ? (
                  <Pressable
                    onPress={openGradeRequest}
                    accessibilityRole="button"
                    accessibilityLabel="Request a new grade"
                    className="mx-lg mt-lg min-h-[48px] items-center justify-center rounded-xl border border-dashed border-brand-border py-md"
                  >
                    <Typography variant="roleDescription" className="text-brand-muted">
                      Can&apos;t find your grade?
                    </Typography>
                    <Typography variant="link" className="mt-xs">
                      Request a new grade
                    </Typography>
                  </Pressable>
                ) : undefined
              }
              ListEmptyComponent={
                <EmptyState
                  title={`No grades found for “${trimmedQuery}”`}
                  description="Try a grade code, material, or manufacturer — or request the grade and we will source it."
                  actionLabel="Request a new grade"
                  onActionPress={openGradeRequest}
                  secondaryActionLabel="Clear search"
                  onSecondaryActionPress={handleClearSearch}
                />
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: listBottomPadding,
                flexGrow: 1,
              }}
            />
          ) : (
            <FlatList
              data={filteredProducts}
              keyExtractor={liveKeyExtractor}
              renderItem={renderLiveItem}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              onScrollBeginDrag={handleDismissOverlay}
              ListHeaderComponent={
                <GradeMasterEntry
                  onPress={openGradeBrowser}
                  gradeCount={totalGradeCount}
                  query={trimmedQuery}
                />
              }
              ListFooterComponent={
                promoBanners.length > 0 ? (
                  <View className="mt-md mb-sm">
                    <HeroCarousel
                      banners={promoBanners}
                      onActionPress={handlePromoAction}
                      onSecondaryPress={handlePromoSecondary}
                      onImpression={handlePromoImpression}
                    />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                marketProducts.length === 0 ? (
                  <EmptyState
                    title="No live listings right now"
                    description="No seller has a live offer at the moment. You can still search every grade above, browse the full catalogue, or request a new grade."
                    actionLabel="Browse all grades"
                    onActionPress={openGradeBrowser}
                    secondaryActionLabel="Request a new grade"
                    onSecondaryActionPress={openGradeRequest}
                  />
                ) : activeFilterCount > 0 ? (
                  <EmptyState
                    title="No live listings match your filters"
                    description="Loosen the price, MOQ, manufacturer or origin filters to see more listings."
                    actionLabel="Clear filters"
                    onActionPress={handleClearFilters}
                  />
                ) : (
                  <EmptyState
                    title={
                      selectedCategoryLabel
                        ? `No live listings in ${selectedCategoryLabel}`
                        : 'No materials found'
                    }
                    description={
                      selectedCategory
                        ? 'Switch to All or pick another category to keep browsing.'
                        : 'Try a different grade, category, or search term.'
                    }
                    actionLabel={selectedCategory ? 'Show all materials' : undefined}
                    onActionPress={selectedCategory ? handleShowAllCategories : undefined}
                  />
                )
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: listBottomPadding,
                flexGrow: 1,
              }}
            />
          )}
        </>
      )}
      <MarketFilterSheet
        ref={filterSheetRef}
        filters={filters}
        facets={facets}
        previewCount={previewFilterCount}
        onApply={handleApplyFilters}
      />
      <LocationBottomSheet
        ref={locationSheetRef}
        selectedId={selectedLocation.id}
        onAddAddress={openAddressForm}
      />
    </View>
  );
};
