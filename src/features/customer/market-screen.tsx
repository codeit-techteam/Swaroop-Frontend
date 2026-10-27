import { useCallback, useMemo, useRef, useState } from 'react';

import { FlatList, Keyboard, View, type TextInputInstance } from 'react-native';

import { type Href, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LocationBottomSheet } from '@/components/home';
import { HeroCarousel } from '@/components/home/hero-carousel';
import {
  CategoryFilter,
  EmptyState,
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
import { marketCategoryChips } from '@/constants/marketProducts';
import { useDeliveryLocation } from '@/hooks/use-delivery-location';
import { useCustomerMarketplaceCategories } from '@/hooks/use-grade-master';
import { useMarketSearch } from '@/hooks/use-market-search';
import { useMarketplaceCatalogQuery } from '@/hooks/use-marketplace-catalog';
import { openCustomerBanner, openCustomerBannerSecondary } from '@/lib/cms-banner';
import { ROUTES } from '@/navigation/routes';
import { fetchCustomerMarketplaceBanners, trackCmsBannerEvent } from '@/services/cms';
import type { HomeBanner } from '@/types/home';
import type { MarketProduct } from '@/types/market';
import {
  EMPTY_MARKET_FILTERS,
  applyMarketFilters,
  buildMarketFacets,
  countActiveMarketFilters,
  type MarketFilters,
} from '@/utils/market-filters';

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
    () => marketCategoryChips(gradeCategories ?? [], marketProducts),
    [gradeCategories, marketProducts],
  );
  const selectedCategoryLabel = useMemo(
    () => categories.find((category) => category.id === selectedCategory)?.label ?? null,
    [categories, selectedCategory],
  );
  const totalGradeCount = useMemo(
    () => (gradeCategories ?? []).reduce((sum, category) => sum + category.gradeCount, 0),
    [gradeCategories],
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

  const renderItem = useCallback(
    ({ item, index }: { item: MarketProduct; index: number }) => (
      <ProductCard product={item} index={index} onBookNow={openProduct} />
    ),
    [openProduct],
  );

  const keyExtractor = useCallback((item: MarketProduct) => item.id, []);

  const trimmedQuery = query.trim();
  const resultLabel = filteredProducts.length === 1 ? 'grade' : 'grades';
  const listBottomPadding = TAB_BAR_HEIGHT + insets.bottom + 24;

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

  if (error) {
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

  if (marketProducts.length === 0) {
    return (
      <View className="flex-1 bg-brand-white">
        <MarketHeader
          locationLabel={selectedLocation.label}
          onLocationPress={handleLocationPress}
          onCartPress={handleCartPress}
        />
        <EmptyState
          title="No live listings right now"
          description="No seller has a live offer at the moment. You can still browse every grade and check back for offers."
          actionLabel="Refresh"
          onActionPress={() => {
            void refetch();
          }}
        />
        <GradeMasterEntry onPress={openGradeBrowser} gradeCount={totalGradeCount} />
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

          {promoBanners.length > 0 ? (
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
              {trimmedQuery
                ? `${filteredProducts.length} ${resultLabel} for “${trimmedQuery}”`
                : selectedCategoryLabel
                  ? `${filteredProducts.length} ${resultLabel} in ${selectedCategoryLabel}`
                  : `${filteredProducts.length} ${resultLabel}`}
              {activeFilterCount > 0 ? ' · filtered' : ''}
            </Typography>
            {activeFilterCount > 0 ? (
              <Typography
                variant="caption"
                className="ml-sm font-sans text-[11px] normal-case tracking-normal text-brand-primary"
                onPress={handleClearFilters}
                accessibilityRole="button"
              >
                Clear filters
              </Typography>
            ) : null}
            {expandedAcrossCategories ? (
              <Typography
                variant="caption"
                className="ml-sm font-sans text-[11px] normal-case tracking-normal text-brand-primary"
              >
                All materials
              </Typography>
            ) : null}
          </View>

          <FlatList
            data={filteredProducts}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
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
              activeFilterCount > 0 ? (
                <EmptyState
                  title="No live listings match your filters"
                  description="Loosen the price, MOQ, manufacturer or origin filters to see more listings."
                  actionLabel="Clear filters"
                  onActionPress={handleClearFilters}
                />
              ) : (
                <EmptyState
                  title={
                    trimmedQuery
                      ? `No live listings match “${trimmedQuery}”`
                      : selectedCategoryLabel
                        ? `No live listings in ${selectedCategoryLabel}`
                        : 'No materials found'
                  }
                  description={
                    trimmedQuery
                      ? 'Try a grade number or manufacturer, or search all grades above.'
                      : selectedCategory
                        ? 'Switch to All or pick another category to keep browsing.'
                        : 'Try a different grade, category, or search term.'
                  }
                  actionLabel={
                    trimmedQuery
                      ? 'Clear search'
                      : selectedCategory
                        ? 'Show all materials'
                        : undefined
                  }
                  onActionPress={
                    trimmedQuery
                      ? handleClearSearch
                      : selectedCategory
                        ? handleShowAllCategories
                        : undefined
                  }
                />
              )
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: listBottomPadding,
              flexGrow: 1,
            }}
          />
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
