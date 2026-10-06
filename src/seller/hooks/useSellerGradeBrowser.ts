import { useMemo } from 'react';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { useDebouncedValue } from '@/hooks/use-debounce';
import { gradeMasterKeys, queryErrorMessage } from '@/hooks/use-grade-master';
import { fetchSellerGradeFacets, fetchSellerGradePage } from '@/services/grade-master';
import type { GradeBrowseFilters } from '@/types/grade-master';

/**
 * Category → Grade Group → Grade narrowing over the seller-visible Grade Master.
 * Facets and grades are filtered server-side; search is debounced.
 */
export function useSellerGradeBrowser({
  query,
  categoryId,
  gradeGroup,
}: {
  query: string;
  categoryId: string | null;
  gradeGroup: string | null;
}) {
  const search = useDebouncedValue(query.trim(), 300);

  const categoryFacets = useQuery({
    queryKey: gradeMasterKeys.sellerFacets(null),
    queryFn: () => fetchSellerGradeFacets({}),
  });

  const scopedFacets = useQuery({
    queryKey: gradeMasterKeys.sellerFacets(categoryId),
    queryFn: () => fetchSellerGradeFacets({ categoryId }),
    enabled: Boolean(categoryId),
  });

  const filters = useMemo<GradeBrowseFilters>(
    () => ({ search, categoryId, gradeGroup }),
    [categoryId, gradeGroup, search],
  );
  const browsing = Boolean(search || categoryId);

  const grades = useInfiniteQuery({
    queryKey: gradeMasterKeys.sellerGrades(filters),
    queryFn: ({ pageParam }) => fetchSellerGradePage(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    enabled: browsing,
  });

  const items = useMemo(
    () => grades.data?.pages.flatMap((page) => page.items) ?? [],
    [grades.data],
  );
  const categories = categoryFacets.data?.categories ?? [];

  return {
    categories,
    categoriesLoading: categoryFacets.isPending,
    categoriesError: categoryFacets.error
      ? queryErrorMessage(categoryFacets.error, 'Unable to load categories.')
      : null,
    totalGrades: categories.reduce((sum, category) => sum + category.gradeCount, 0),
    gradeGroups: categoryId ? (scopedFacets.data?.gradeGroups ?? []) : [],
    browsing,
    grades: items,
    gradeTotal: grades.data?.pages[0]?.total ?? 0,
    gradesLoading: browsing && (grades.isPending || query.trim() !== search),
    gradesError: grades.error ? queryErrorMessage(grades.error, 'Unable to load grades.') : null,
    hasMore: Boolean(grades.hasNextPage),
    loadingMore: grades.isFetchingNextPage,
    loadMore: () => {
      if (grades.hasNextPage && !grades.isFetchingNextPage) void grades.fetchNextPage();
    },
    retry: () => {
      void categoryFacets.refetch();
      if (browsing) void grades.refetch();
    },
  };
}
