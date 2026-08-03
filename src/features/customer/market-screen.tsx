import { useCallback, useMemo, useState } from 'react';

import { FlatList, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {
  CategoryFilter,
  EmptyState,
  MarketHeader,
  ProductCard,
  SearchBar,
} from '@/components/market';
import { TAB_BAR_HEIGHT } from '@/constants/dashboard';
import { useMarketplaceCatalog } from '@/hooks/use-marketplace-catalog';
import { ROUTES } from '@/navigation/routes';
import type { MarketCategory, MarketProduct } from '@/types/market';

export const CustomerMarketScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const marketProducts = useMarketplaceCatalog();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | null>('Polypropylene');

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return marketProducts.filter((product) => {
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;

      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        product.name.toLowerCase().includes(query) ||
        product.grade.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.origin.toLowerCase().includes(query) ||
        product.badge.toLowerCase().includes(query)
      );
    });
  }, [marketProducts, searchQuery, selectedCategory]);

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

  const handleBookNow = useCallback(
    (product: MarketProduct) => {
      router.push({
        pathname: ROUTES.CUSTOMER.PRODUCT_DETAILS,
        params: { id: product.id },
      } as unknown as Href);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: MarketProduct; index: number }) => (
      <ProductCard product={item} index={index} onBookNow={handleBookNow} />
    ),
    [handleBookNow],
  );

  const keyExtractor = useCallback((item: MarketProduct) => item.id, []);

  const listHeader = useMemo(
    () => (
      <View className="pb-md pt-md">
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onFilterPress={handleFilterPress}
          className="mt-md"
        />
      </View>
    ),
    [handleFilterPress, searchQuery, selectedCategory],
  );

  return (
    <View className="flex-1 bg-brand-white">
      <MarketHeader onLocationPress={handleLocationPress} onCartPress={handleCartPress} />

      <FlatList
        data={filteredProducts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 24,
          flexGrow: 1,
        }}
      />
    </View>
  );
};
