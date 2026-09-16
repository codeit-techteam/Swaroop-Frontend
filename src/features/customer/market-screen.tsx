import { useCallback, useMemo, useRef } from 'react';

import { FlatList, Keyboard, View, type TextInput } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {
  CategoryFilter,
  EmptyState,
  MarketHeader,
  ProductCard,
  SearchBar,
  SearchSuggestions,
} from '@/components/market';
import { Typography } from '@/components/ui/typography';
import { TAB_BAR_HEIGHT } from '@/constants/dashboard';
import { useMarketSearch } from '@/hooks/use-market-search';
import { useMarketplaceCatalog } from '@/hooks/use-marketplace-catalog';
import { ROUTES } from '@/navigation/routes';
import type { MarketProduct } from '@/types/market';

export const CustomerMarketScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const searchInputRef = useRef<TextInput>(null);
  const params = useLocalSearchParams<{ focusSearch?: string | string[] }>();
  const marketProducts = useMarketplaceCatalog();
  const {
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
  } = useMarketSearch(marketProducts);

  const shouldAutoFocus = useMemo(() => {
    const value = params.focusSearch;
    if (typeof value === 'string') {
      return value === '1';
    }
    return Array.isArray(value) && value[0] === '1';
  }, [params.focusSearch]);

  const handleLocationPress = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Delivery location',
      text2: 'Mumbai, MH is set for this session.',
      visibilityTime: 2000,
    });
  }, []);

  const handleCartPress = useCallback(() => {
    router.push(ROUTES.CUSTOMER.CART as Href);
  }, [router]);

  const handleFilterPress = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Filters',
      text2: 'Advanced filters will be available soon.',
      visibilityTime: 2000,
    });
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

  return (
    <View className="flex-1 bg-brand-white">
      <MarketHeader onLocationPress={handleLocationPress} onCartPress={handleCartPress} />

      <View className="bg-brand-white pb-sm pt-md">
        <SearchBar
          ref={searchInputRef}
          value={query}
          onChangeText={handleQueryChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmit={handleSubmitSearch}
          onClear={handleClear}
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
            onClearRecent={handleClearRecent}
          />
        </View>
      ) : (
        <>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            onFilterPress={handleFilterPress}
          />

          <View className="flex-row items-center justify-between px-lg pb-sm pt-md">
            <Typography
              variant="caption"
              className="flex-1 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
              numberOfLines={1}
            >
              {trimmedQuery
                ? `${filteredProducts.length} ${resultLabel} for “${trimmedQuery}”`
                : selectedCategory
                  ? `${filteredProducts.length} ${resultLabel} in ${selectedCategory}`
                  : `${filteredProducts.length} ${resultLabel}`}
            </Typography>
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
            ListEmptyComponent={
              <EmptyState
                title={trimmedQuery ? `No grades match “${trimmedQuery}”` : 'No materials found'}
                description={
                  trimmedQuery
                    ? 'Try a material like PP, HDPE, PVC, or a grade code.'
                    : 'Try a different grade, category, or search term.'
                }
                actionLabel={trimmedQuery ? 'Clear search' : undefined}
                onActionPress={trimmedQuery ? handleClear : undefined}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 24,
              flexGrow: 1,
            }}
          />
        </>
      )}
    </View>
  );
};
