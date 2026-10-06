import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  fetchCustomerGrade,
  fetchCustomerGradeFacets,
  fetchCustomerGradeOffers,
  fetchCustomerGradePage,
  fetchCustomerGradeProducts,
  fetchCustomerMarketplaceCategories,
} from '@/services/grade-master';
import type { GradeBrowseFilters } from '@/types/grade-master';

export const gradeMasterKeys = {
  all: ['grade-master'] as const,
  customerCategories: () => [...gradeMasterKeys.all, 'customer', 'categories'] as const,
  customerFacets: (categoryId: string | null) =>
    [...gradeMasterKeys.all, 'customer', 'facets', categoryId ?? 'all'] as const,
  customerGrades: (filters: GradeBrowseFilters) =>
    [...gradeMasterKeys.all, 'customer', 'grades', filters] as const,
  customerGrade: (id: string) => [...gradeMasterKeys.all, 'customer', 'grade', id] as const,
  customerGradeProducts: (id: string) =>
    [...gradeMasterKeys.all, 'customer', 'grade', id, 'products'] as const,
  customerGradeOffers: (id: string) =>
    [...gradeMasterKeys.all, 'customer', 'grade', id, 'offers'] as const,
  sellerFacets: (categoryId: string | null) =>
    [...gradeMasterKeys.all, 'seller', 'facets', categoryId ?? 'all'] as const,
  sellerGrades: (filters: GradeBrowseFilters) =>
    [...gradeMasterKeys.all, 'seller', 'grades', filters] as const,
};

const LIVE_STALE_MS = 60 * 1000;

export const queryErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

export const useCustomerMarketplaceCategories = () =>
  useQuery({
    queryKey: gradeMasterKeys.customerCategories(),
    queryFn: fetchCustomerMarketplaceCategories,
  });

export const useCustomerGradeFacets = (categoryId: string | null) =>
  useQuery({
    queryKey: gradeMasterKeys.customerFacets(categoryId),
    queryFn: () => fetchCustomerGradeFacets({ categoryId }),
  });

export const useCustomerGradeBrowse = (filters: GradeBrowseFilters) =>
  useInfiniteQuery({
    queryKey: gradeMasterKeys.customerGrades(filters),
    queryFn: ({ pageParam }) => fetchCustomerGradePage(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
    staleTime: LIVE_STALE_MS,
  });

export const useCustomerGrade = (id: string | null) =>
  useQuery({
    queryKey: gradeMasterKeys.customerGrade(id ?? ''),
    queryFn: () => fetchCustomerGrade(id as string),
    enabled: Boolean(id),
    staleTime: LIVE_STALE_MS,
  });

export const useCustomerGradeProducts = (id: string | null) =>
  useQuery({
    queryKey: gradeMasterKeys.customerGradeProducts(id ?? ''),
    queryFn: () => fetchCustomerGradeProducts(id as string),
    enabled: Boolean(id),
    staleTime: LIVE_STALE_MS,
  });

export const useCustomerGradeOffers = (id: string | null) =>
  useQuery({
    queryKey: gradeMasterKeys.customerGradeOffers(id ?? ''),
    queryFn: () => fetchCustomerGradeOffers(id as string),
    enabled: Boolean(id),
    staleTime: LIVE_STALE_MS,
  });
