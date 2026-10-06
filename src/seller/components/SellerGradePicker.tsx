import { memo, useEffect, useMemo, useRef, useState } from 'react';

import { ActivityIndicator, Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { BackArrowIcon } from '@/icons';
import {
  SellerCatalogGradeRow,
  SellerCategoryTile,
} from '@/seller/components/SellerCatalogComponents';
import { FilterChipRow, SearchField } from '@/seller/components/SellerOperationsComponents';
import { EmptyState } from '@/seller/components/utility/EmptyState';
import { ProductSkeleton } from '@/seller/components/utility/Skeletons';
import { useSellerGradeBrowser } from '@/seller/hooks/useSellerGradeBrowser';
import type { SellerProduct } from '@/seller/types';
import { findSellerListingForCatalog } from '@/seller/utils/catalog';
import { brandColors } from '@/theme/colors';
import type { GradeFacetCategory } from '@/types/grade-master';
import type { MarketProduct } from '@/types/market';

const ALL_GROUPS = 'All';

type SellerGradePickerProps = {
  onSelectGrade: (grade: MarketProduct) => void;
  /** Seller listings, used to badge grades that are already listed. */
  listings?: SellerProduct[];
  /** Preselect a category by code or name once facets load. */
  initialCategory?: string;
  onCategoryChange?: (category: GradeFacetCategory | null) => void;
};

export const SellerGradePicker = memo(function SellerGradePicker({
  onSelectGrade,
  listings,
  initialCategory,
  onCategoryChange,
}: SellerGradePickerProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<GradeFacetCategory | null>(null);
  const [gradeGroup, setGradeGroup] = useState<string | null>(null);
  const appliedInitialRef = useRef(false);

  const browser = useSellerGradeBrowser({
    query,
    categoryId: category?.id ?? null,
    gradeGroup,
  });

  const selectCategory = (next: GradeFacetCategory | null) => {
    setCategory(next);
    setGradeGroup(null);
    onCategoryChange?.(next);
  };

  useEffect(() => {
    if (appliedInitialRef.current || !initialCategory || browser.categories.length === 0) return;
    appliedInitialRef.current = true;
    const needle = initialCategory.trim().toLowerCase();
    const match = browser.categories.find((item) =>
      [item.code, item.name, item.displayName].some((value) => value.toLowerCase() === needle),
    );
    if (match) {
      setCategory(match);
      onCategoryChange?.(match);
    }
  }, [browser.categories, initialCategory, onCategoryChange]);

  const listedByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    (listings ?? []).forEach((listing) => {
      const key = listing.form.category.trim().toLowerCase();
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }, [listings]);

  const groupOptions = useMemo(
    () => [ALL_GROUPS, ...browser.gradeGroups.map((group) => group.name)],
    [browser.gradeGroups],
  );

  const trimmedQuery = query.trim();

  return (
    <View>
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder={
          category
            ? `Search ${category.displayName} grades, grade no. or manufacturer`
            : 'Search grade, grade no. or manufacturer'
        }
      />

      {category ? (
        <View className="mt-lg">
          <Pressable
            onPress={() => selectCategory(null)}
            className="flex-row items-center"
            accessibilityRole="button"
            accessibilityLabel="Back to all categories"
          >
            <BackArrowIcon size={16} color={brandColors.navy} />
            <Typography variant="roleTitle" className="ml-sm text-[14px] text-brand-navy">
              All categories
            </Typography>
          </Pressable>
          <Typography variant="headingLeft" className="mt-sm text-[22px]">
            {category.displayName}
          </Typography>
          <Typography variant="legal" className="mt-xs text-left text-brand-body">
            {category.gradeCount.toLocaleString('en-IN')} grades
            {gradeGroup ? ` · ${gradeGroup}` : ''}
          </Typography>
          {browser.gradeGroups.length > 1 ? (
            <View className="mt-md">
              <FilterChipRow
                options={groupOptions}
                selected={gradeGroup ?? ALL_GROUPS}
                onSelect={(value) => setGradeGroup(value === ALL_GROUPS ? null : value)}
              />
            </View>
          ) : null}
        </View>
      ) : null}

      {!browser.browsing ? (
        browser.categoriesLoading ? (
          <View className="mt-lg">
            <ProductSkeleton />
          </View>
        ) : browser.categoriesError ? (
          <EmptyState
            className="mt-lg"
            variant="no_search_results"
            title="Unable to load the Grade Master"
            description={browser.categoriesError}
            ctaLabel="Retry"
            onCtaPress={browser.retry}
          />
        ) : (
          <View className="mt-lg">
            <Typography variant="legal" className="mb-md text-left text-brand-body">
              {browser.totalGrades.toLocaleString('en-IN')} grades across{' '}
              {browser.categories.length} categories. Pick a category or search.
            </Typography>
            <View className="flex-row flex-wrap justify-between">
              {browser.categories.map((item) => (
                <View key={item.id} className="mb-md" style={{ width: '48.5%' }}>
                  <SellerCategoryTile
                    label={item.displayName}
                    gradeCount={item.gradeCount}
                    listedCount={
                      listedByCategory.get(item.name.toLowerCase()) ??
                      listedByCategory.get(item.displayName.toLowerCase()) ??
                      0
                    }
                    onPress={() => selectCategory(item)}
                  />
                </View>
              ))}
            </View>
          </View>
        )
      ) : (
        <View className="mt-lg gap-md">
          {browser.gradesLoading ? (
            <ProductSkeleton />
          ) : browser.gradesError ? (
            <EmptyState
              variant="no_search_results"
              title="Search failed"
              description={browser.gradesError}
              ctaLabel="Retry"
              onCtaPress={browser.retry}
            />
          ) : browser.grades.length === 0 ? (
            <EmptyState
              variant="no_search_results"
              title="No matching grades"
              description={
                trimmedQuery
                  ? 'Try another grade, grade number, or manufacturer.'
                  : 'No seller-visible grades in this selection yet.'
              }
              ctaLabel={trimmedQuery ? 'Clear search' : 'All categories'}
              onCtaPress={() => (trimmedQuery ? setQuery('') : selectCategory(null))}
            />
          ) : (
            <>
              <Typography variant="legal" className="text-left text-brand-body">
                {browser.gradeTotal.toLocaleString('en-IN')} grade
                {browser.gradeTotal === 1 ? '' : 's'}
                {trimmedQuery ? ` for “${trimmedQuery}”` : ''}
              </Typography>
              {browser.grades.map((grade) => (
                <SellerCatalogGradeRow
                  key={grade.id}
                  product={grade}
                  listing={
                    listings
                      ? findSellerListingForCatalog(listings, grade.id, grade.gradeCode)
                      : undefined
                  }
                  onPress={() => onSelectGrade(grade)}
                />
              ))}
              {browser.hasMore ? (
                <Pressable
                  onPress={browser.loadMore}
                  disabled={browser.loadingMore}
                  accessibilityRole="button"
                  className="items-center rounded-2xl border border-brand-border bg-brand-white py-md"
                >
                  {browser.loadingMore ? (
                    <ActivityIndicator color={brandColors.navy} />
                  ) : (
                    <Typography variant="roleTitle" className="text-[14px] text-brand-navy">
                      Load more grades
                    </Typography>
                  )}
                </Pressable>
              ) : null}
            </>
          )}
        </View>
      )}
    </View>
  );
});
