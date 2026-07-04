import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const invalidateQueries = async (queryKey: string[]): Promise<void> => {
  await queryClient.invalidateQueries({ queryKey });
};

export const resetQueries = (): void => {
  queryClient.clear();
};
