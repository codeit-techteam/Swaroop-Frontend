import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { customerGradeRequestApi, type GradeRequestRole } from '@/services/grade-requests';
import { sellerGradeRequestApi } from '@/services/seller-grade-requests';

export const gradeRequestKeys = {
  /** Root key — invalidating it refreshes every role's cache. */
  all: ['grade-requests'] as const,
  list: (role: GradeRequestRole = 'customer') => [...gradeRequestKeys.all, role, 'list'] as const,
  detail: (id: string, role: GradeRequestRole = 'customer') =>
    [...gradeRequestKeys.all, role, 'detail', id] as const,
};

export const gradeRequestApiFor = (role: GradeRequestRole) =>
  role === 'seller' ? sellerGradeRequestApi : customerGradeRequestApi;

export const useGradeRequests = (role: GradeRequestRole = 'customer') => {
  const api = gradeRequestApiFor(role);
  return useInfiniteQuery({
    queryKey: gradeRequestKeys.list(role),
    queryFn: ({ pageParam }) => api.fetchList(pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    staleTime: 15_000,
  });
};

export const useGradeRequest = (id: string | null, role: GradeRequestRole = 'customer') => {
  const api = gradeRequestApiFor(role);
  return useQuery({
    queryKey: gradeRequestKeys.detail(id ?? '', role),
    queryFn: () => api.fetchOne(id as string),
    enabled: Boolean(id),
    staleTime: 10_000,
  });
};
