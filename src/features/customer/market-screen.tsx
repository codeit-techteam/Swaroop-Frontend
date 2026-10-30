import { useCallback, useMemo, useRef, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Keyboard,
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
} from '@/components/market';
import { MarketListSkeleton } from '@/components/ui/skeleton';
import { Typography } from '@/components/ui/typography';
import { TAB_BAR_HEIGHT } from '@/constants/dashboard';
import { allMarketCategoryChips, marketCategoryChips } from '@/constants/marketProducts';
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
import {
  EMPTY_MARKET_FILTERS,
  applyMarketFilters,
  buildMarketFacets,
  countActiveMarketFilters,
  type MarketFilters,
} from '@/utils/market-filters';
import { buildMarketSearchRows, type MarketSearchRow } from '@/utils/market-search-rows';

const SEARCH_DEBOUNCE_MS = 350;

export const CustomerMarketScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const searchInputRef = useRef<TextInputInstance>(null);
  const locationSheetRef = useRef<BottomSheetModal>(null);
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const { selectedLocation, openAddressForm } = useDeliveryLocation();
  const params = useLocalSearchParams<{ focusSearch?: string | string[] }>();
  const { products: marketProducts, loading, error, refetch } = useMarketplaceCatalogQuery();
  const [promoBanners, setPromoBanners] = useState<HomeBanner[]>([]);
  // B-07: real catalogue filters (stock, credit, price, MOQ, manufacturer, origin, sort).
  const [filters, setFilters] = useState<MarketFilters>(EMPTY_MARKET_FILTERS);
  const {
    query,
    selectedCategory,
    filteredProducts: searchedProducts,
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
  } = useMarketSearch(marketProducts);

  const trimmedQuery = query.trim();
  const debouncedSearch = useDebouncedValue(trimmedQuery, SEARCH_DEBOUNCE_MS);
  // Enter catalogue mode as soon as the user types; only fire the API after debounce.
  const wantsCatalogueSearch = trimmedQuery.length > 0;
  const isSearchPending = wantsCatalogueSearch && trimmedQuery !== debouncedSearch;

  const catalogueFilters = useMemo<GradeBrowseFilters>(
    () => ({
      search: debouncedSearch,
      categoryId: selectedCategory,
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
  const categories = useMemo(
    () =>
      wantsCatalogueSearch
        ? allMarketCategoryChips(gradeCategories ?? [])
        : marketCategoryChips(gradeCategories ?? [], marketProducts),
    [gradeCategories, marketProducts, wantsCatalogueSearch],
  );
  const selectedCategoryLabel = useMemo(
    () => categories.find((category) => category.id === selectedCategory)?.label ?? null,
    [categories, selectedCategory],
  );
  const totalGradeCount = useMemo(
    () => (gradeCategories ?? []).reduce((sum, category) => sum + category.gradeCount, 0),
    [gradeCategories],
  );

  const searchRows = useMemo(
    () =>
      debouncedSearch.length > 0
        ? buildMarketSearchRows(catalogueGrades, marketProducts, debouncedSearch)
        : [],
    [catalogueGrades, debouncedSearch, marketProducts],
  );

  const shouldAutoFocus = useMemo(() => {
    const value = params.focusSearch;
    if (typeof value === 'string') {
      return value === '1';
    }
    return Array.isArray(value) && value[0] === '1';
  }, [params.focusSearch]);

  const handleLocationPress = useCallback(() => {
    locationSheetRef.current?.present();
  }, []);

  const handleCartPress = useCallback(() => {
    router.push(ROUTES.CUSTOMER.CART as Href);
  }, [router]);

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
    filterSheetRef.current?.present();
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

  const resultCount = wantsCatalogueSearch ? catalogueTotal : filteredProducts.length;
  const resultLabel = resultCount === 1 ? 'grade' : 'grades';
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

      <View className="bg-brand-white pb-sm pt-md">
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
      </View>

      {showSuggestions ? (
        <View className="flex-1 pt-sm" style={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom }}>
          <SearchSuggestions
            query={query}
            suggestions={suggestions}
            recentSearches={recentSearches}
            popularMaterials={popularMaterials}
            onSelectMaterial={(material) => {
              Keyboard.dismiss();
              handleSelectMaterial(material);
            }}
            onSelectProduct={handleSuggestionProduct}
            onSelectRecent={(term) => {
              Keyboard.dismiss();
              handleSelectRecent(term);
            }}
            onViewAll={handleViewAllResults}
            onBrowseAll={handleBrowseCatalog}
            onClearRecent={handleClearRecent}
          />
        </View>
      ) : (
        <>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            onFilterPress={handleFilterPress}
            filterLabel={activeFilterCount > 0 ? `Filters · ${activeFilterCount}` : 'Filter'}
          />

          {!wantsCatalogueSearch && promoBanners.length > 0 ? (
            <HeroCarousel
              banners={promoBanners}
              onActionPress={handlePromoAction}
              onSecondaryPress={handlePromoSecondary}
              onImpression={handlePromoImpression}
            />
          ) : null}

          <View className="flex-row items-center justify-between px-lg pb-sm pt-md">
            <Typography
              variant="caption"
              className="flex-1 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
              numberOfLines={1}
            >
              {showCatalogueSkeleton || isSearchPending || gradesQuery.isPlaceholderData
                ? trimmedQuery
                  ? 'Searching grades…'
                  : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'grade' : 'grades'}`
                : trimmedQuery
                  ? `${resultCount.toLocaleString('en-IN')} ${resultLabel} for “${trimmedQuery}”`
                  : selectedCategoryLabel
                    ? `${resultCount} ${resultLabel} in ${selectedCategoryLabel}`
                    : `${resultCount} ${resultLabel}`}
              {!wantsCatalogueSearch && activeFilterCount > 0 ? ' · filtered' : ''}
            </Typography>
            {!wantsCatalogueSearch && activeFilterCount > 0 ? (
              <Typography
                variant="caption"
                className="ml-sm font-sans text-[11px] normal-case tracking-normal text-brand-primary"
                onPress={handleClearFilters}
                accessibilityRole="button"
              >
                Clear filters
              </Typography>
            ) : null}
            {expandedAcrossCategories && !wantsCatalogueSearch ? (
              <Typography
                variant="caption"
                className="ml-sm font-sans text-[11px] normal-case tracking-normal text-brand-primary"
              >
                All materials
              </Typography>
            ) : null}
          </View>

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
                ) : undefined
              }
              ListEmptyComponent={
                <EmptyState
                  title={`No grades found for “${trimmedQuery}”`}
                  description="Try a grade code, material, or manufacturer."
                  actionLabel="Clear search"
                  onActionPress={handleClearSearch}
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
              ListEmptyComponent={
                marketProducts.length === 0 ? (
                  <EmptyState
                    title="No live listings right now"
                    description="No seller has a live offer at the moment. You can still search every grade above, or browse the full catalogue."
                    actionLabel="Browse all grades"
                    onActionPress={openGradeBrowser}
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
