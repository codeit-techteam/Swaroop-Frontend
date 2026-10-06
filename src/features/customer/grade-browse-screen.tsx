import { memo, useCallback, useMemo, useRef, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CategoryFilter,
  EmptyState,
  GradeCard,
  GradeFilterSheet,
  SearchBar,
  type GradeSheetFilters,
} from '@/components/market';
import { ProductHeader } from '@/components/product';
import { MarketListSkeleton } from '@/components/ui/skeleton';
import { Typography } from '@/components/ui/typography';
import { useDebouncedValue } from '@/hooks/use-debounce';
import {
  queryErrorMessage,
  useCustomerGradeBrowse,
  useCustomerGradeFacets,
  useCustomerMarketplaceCategories,
} from '@/hooks/use-grade-master';
import { useNotificationBadge } from '@/hooks/use-notifications';
import { ROUTES } from '@/navigation/routes';
import type { CustomerGrade, GradeBrowseFilters } from '@/types/grade-master';

const SEARCH_DEBOUNCE_MS = 350;

const firstParam = (value?: string | string[]): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export const CustomerGradeBrowseScreen = memo(function CustomerGradeBrowseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const params = useLocalSearchParams<{
    search?: string | string[];
    categoryId?: string | string[];
  }>();

  const [query, setQuery] = useState(() => firstParam(params.search) ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(
    () => firstParam(params.categoryId) ?? null,
  );
  const [sheetFilters, setSheetFilters] = useState<GradeSheetFilters>({
    gradeGroup: null,
    manufacturer: null,
    hasOffers: false,
  });
  const search = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const unreadCount = useNotificationBadge();

  const categoriesQuery = useCustomerMarketplaceCategories();
  const facetsQuery = useCustomerGradeFacets(categoryId);

  const filters = useMemo<GradeBrowseFilters>(
    () => ({
      search,
      categoryId,
      gradeGroup: sheetFilters.gradeGroup,
      manufacturer: sheetFilters.manufacturer,
      hasOffers: sheetFilters.hasOffers,
    }),
    [categoryId, search, sheetFilters],
  );
  const gradesQuery = useCustomerGradeBrowse(filters);

  const grades = useMemo(
    () => gradesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [gradesQuery.data],
  );
  const total = gradesQuery.data?.pages[0]?.total ?? 0;

  const categoryOptions = useMemo(
    () =>
      (categoriesQuery.data ?? []).map((category) => ({
        id: category.id,
        label: category.displayName,
      })),
    [categoriesQuery.data],
  );
  const selectedCategoryLabel =
    categoryOptions.find((option) => option.id === categoryId)?.label ?? null;

  const gradeGroups = useMemo(() => facetsQuery.data?.gradeGroups ?? [], [facetsQuery.data]);
  const gradeGroupOptions = useMemo(
    () => gradeGroups.map((group) => ({ id: group.name, label: group.name })),
    [gradeGroups],
  );
  const activeSheetCount =
    (sheetFilters.gradeGroup ? 1 : 0) +
    (sheetFilters.manufacturer ? 1 : 0) +
    (sheetFilters.hasOffers ? 1 : 0);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.MARKET as Href);
  }, [router]);

  const handleSelectCategory = useCallback((next: string | null) => {
    setCategoryId(next);
    setSheetFilters((prev) => ({ ...prev, gradeGroup: null }));
  }, []);

  const handleSelectGradeGroup = useCallback((next: string | null) => {
    setSheetFilters((prev) => ({ ...prev, gradeGroup: next }));
  }, []);

  const handleApplySheet = useCallback((next: GradeSheetFilters) => {
    setSheetFilters(next);
    filterSheetRef.current?.dismiss();
  }, []);

  const clearAll = useCallback(() => {
    setQuery('');
    setCategoryId(null);
    setSheetFilters({ gradeGroup: null, manufacturer: null, hasOffers: false });
  }, []);

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

  const handleEndReached = useCallback(() => {
    if (gradesQuery.hasNextPage && !gradesQuery.isFetchingNextPage) {
      void gradesQuery.fetchNextPage();
    }
  }, [gradesQuery]);

  const renderItem = useCallback(
    ({ item }: { item: CustomerGrade }) => <GradeCard grade={item} onPress={openGrade} />,
    [openGrade],
  );

  const hasAnyFilter = Boolean(query.trim() || categoryId || activeSheetCount);
  const isSearching = query.trim() !== search;
  const showSkeleton = gradesQuery.isPending || (isSearching && grades.length === 0);
  const resultLabel = total === 1 ? 'grade' : 'grades';

  const summary = [
    search ? `for “${search}”` : null,
    selectedCategoryLabel ? `in ${selectedCategoryLabel}` : null,
    sheetFilters.gradeGroup,
    sheetFilters.manufacturer,
    sheetFilters.hasOffers ? 'with live offers' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View className="flex-1 bg-brand-white">
      <ProductHeader
        onBackPress={handleBack}
        onCartPress={() => router.push(ROUTES.CUSTOMER.CART as Href)}
        onNotificationPress={() => router.push(ROUTES.CUSTOMER.NOTIFICATIONS as Href)}
        hasNotification={unreadCount > 0}
      />

      <View className="px-lg pt-md">
        <Typography variant="headingLeft" className="text-[20px] leading-[26px]">
          Browse grades
        </Typography>
        <Typography variant="roleDescription" className="mt-xs text-[12px] text-brand-muted">
          Every customer-visible grade. Open a grade to see its live offers.
        </Typography>
      </View>

      <View className="pb-sm pt-md">
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          onSubmit={Keyboard.dismiss}
          placeholder="Search grade no., manufacturer, grade group…"
        />
      </View>

      <CategoryFilter
        categories={categoryOptions}
        selectedCategory={categoryId}
        onSelectCategory={handleSelectCategory}
        onFilterPress={() => filterSheetRef.current?.present()}
        filterLabel={activeSheetCount > 0 ? `Filter (${activeSheetCount})` : 'Filter'}
      />

      {categoryId && gradeGroupOptions.length > 1 ? (
        <CategoryFilter
          className="mt-sm"
          categories={gradeGroupOptions}
          selectedCategory={sheetFilters.gradeGroup}
          onSelectCategory={handleSelectGradeGroup}
        />
      ) : null}

      <View className="flex-row items-center justify-between px-lg pb-sm pt-md">
        <Typography
          variant="caption"
          className="flex-1 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
          numberOfLines={1}
        >
          {showSkeleton || isSearching || gradesQuery.isPlaceholderData
            ? 'Loading grades…'
            : `${total.toLocaleString('en-IN')} ${resultLabel}${summary ? ` ${summary}` : ''}`}
        </Typography>
        {hasAnyFilter ? (
          <Pressable onPress={clearAll} hitSlop={8} accessibilityRole="button">
            <Typography
              variant="caption"
              className="ml-sm font-sans text-[12px] normal-case tracking-normal text-brand-primary"
            >
              Clear all
            </Typography>
          </Pressable>
        ) : null}
      </View>

      {showSkeleton ? (
        <MarketListSkeleton />
      ) : gradesQuery.isError ? (
        <EmptyState
          title="Unable to load grades"
          description={queryErrorMessage(gradesQuery.error, 'Please try again.')}
          actionLabel="Retry"
          onActionPress={() => {
            void gradesQuery.refetch();
          }}
        />
      ) : (
        <FlatList
          data={grades}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={gradesQuery.isRefetching && !gradesQuery.isFetchingNextPage}
              onRefresh={() => {
                void gradesQuery.refetch();
              }}
            />
          }
          ListFooterComponent={
            gradesQuery.isFetchingNextPage ? (
              <View className="py-lg">
                <ActivityIndicator />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              title={search ? `No grades match “${search}”` : 'No grades found'}
              description="Try a different grade number, manufacturer or category."
              actionLabel={hasAnyFilter ? 'Clear filters' : undefined}
              onActionPress={hasAnyFilter ? clearAll : undefined}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24, flexGrow: 1 }}
        />
      )}

      <GradeFilterSheet
        ref={filterSheetRef}
        filters={sheetFilters}
        gradeGroups={gradeGroups}
        manufacturers={facetsQuery.data?.manufacturers ?? []}
        onApply={handleApplySheet}
      />
    </View>
  );
});
