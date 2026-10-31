import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { fetchGradeRequest, fetchGradeRequests } from '@/services/grade-requests';

export const gradeRequestKeys = {
  all: ['grade-requests'] as const,
  list: () => [...gradeRequestKeys.all, 'list'] as const,
  detail: (id: string) => [...gradeRequestKeys.all, 'detail', id] as const,
};

export const useGradeRequests = () =>
  useInfiniteQuery({
    queryKey: gradeRequestKeys.list(),
    queryFn: ({ pageParam }) => fetchGradeRequests(pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    staleTime: 15_000,
  });

export const useGradeRequest = (id: string | null) =>
  useQuery({
    queryKey: gradeRequestKeys.detail(id ?? ''),
    queryFn: () => fetchGradeRequest(id as string),
    enabled: Boolean(id),
    staleTime: 10_000,
  });
