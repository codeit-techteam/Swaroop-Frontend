import { memo } from 'react';

import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import {
  BarChartIcon,
  ClipboardCheckIcon,
  DocumentFileIcon,
  OrdersTabIcon,
  StoreIcon,
  TruckIcon,
} from '@/icons';
import {
  DashboardSkeleton,
  EmptyState,
  FilterTabRow,
  SearchBar,
  SellerHeader,
} from '@/seller/components';
import { SEARCH_CATEGORY_LABELS } from '@/seller/mock/search';
import { useSellerSearch } from '@/seller/hooks/useSellerSearch';
import type { SearchCategory, SearchResult, SearchResultType } from '@/seller/types/search';
import { brandColors } from '@/theme/colors';

const CATEGORY_OPTIONS = Object.entries(SEARCH_CATEGORY_LABELS)
  .filter(([key]) => key !== 'documents')
  .map(([value, label]) => ({ value, label }));

const RESULT_ICONS: Record<SearchResultType, React.ReactNode> = {
  product: <StoreIcon size={20} color={brandColors.primaryDark} />,
  order: <OrdersTabIcon size={20} color={brandColors.primaryDark} />,
  offer: <BarChartIcon size={20} color={brandColors.primaryDark} />,
  shipment: <TruckIcon size={20} color={brandColors.primaryDark} />,
  inventory: <ClipboardCheckIcon size={20} color={brandColors.primaryDark} />,
  document: <DocumentFileIcon size={20} color={brandColors.primaryDark} />,
};

export const SellerSearchScreen = memo(function SellerSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    query,
    setQuery,
    category,
    setCategory,
    results,
    recentSearches,
    popularSearches,
    isLoading,
    isSearching,
    selectResult,
    searchRecent,
    clearRecent,
  } = useSellerSearch();

  const handleResultPress = (result: SearchResult) => {
    selectResult(result);
    router.push(result.route as Href);
  };

  const renderResult = ({ item, index }: { item: SearchResult; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(240)}>
      <Pressable
        onPress={() => handleResultPress(item)}
        className="flex-row items-center gap-md rounded-[22px] border border-brand-border bg-brand-white px-lg py-md"
        style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
      >
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-primary-light">
          {RESULT_ICONS[item.type]}
        </View>
        <View className="flex-1">
          <Typography variant="roleTitle">{item.title}</Typography>
          <Typography variant="legal" className="text-brand-body">
            {item.subtitle}
          </Typography>
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader
        title="Search"
        showBack
        onBack={() => router.back()}
      />

      <View className="flex-1 px-lg" style={{ paddingBottom: insets.bottom }}>
        <View className="mt-md">
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search products, orders, offers..."
          />
        </View>

        <View className="mt-md">
          <FilterTabRow
            options={CATEGORY_OPTIONS}
            selected={category}
            onSelect={(value) => setCategory(value as SearchCategory)}
          />
        </View>

        {isLoading ? (
          <View className="mt-lg">
            <DashboardSkeleton />
          </View>
        ) : query.trim() ? (
          <View className="mt-lg flex-1">
            {isSearching ? (
              <ActivityIndicator color={brandColors.primary} className="mt-xl" />
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={renderResult}
                contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<EmptyState variant="no_search_results" />}
              />
            )}
          </View>
        ) : (
          <View className="mt-lg">
            {recentSearches.length > 0 ? (
              <View>
                <View className="mb-sm flex-row items-center justify-between">
                  <Typography variant="badge" className="text-[11px] uppercase tracking-wide text-brand-body">
                    Recent Searches
                  </Typography>
                  <Pressable onPress={clearRecent} hitSlop={8}>
                    <Typography variant="link" className="text-[12px]">
                      Clear
                    </Typography>
                  </Pressable>
                </View>
                <View className="flex-row flex-wrap gap-sm">
                  {recentSearches.map((term) => (
                    <Pressable
                      key={term}
                      onPress={() => searchRecent(term)}
                      className="rounded-full border border-brand-border bg-brand-white px-md py-sm"
                    >
                      <Typography variant="badge" className="text-brand-body">
                        {term}
                      </Typography>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            <View className="mt-xl">
              <Typography variant="badge" className="mb-sm text-[11px] uppercase tracking-wide text-brand-body">
                Popular Searches
              </Typography>
              <View className="flex-row flex-wrap gap-sm">
                {popularSearches.map((term) => (
                  <Pressable
                    key={term}
                    onPress={() => searchRecent(term)}
                    className="rounded-full bg-brand-primary-light px-md py-sm"
                  >
                    <Typography variant="badge" className="text-brand-primary">
                      {term}
                    </Typography>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
});
