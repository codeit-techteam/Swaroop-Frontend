import { useCallback } from 'react';

import { selectIsAuthenticated, selectIsHydrated, useAuthStore } from '@/store/auth-store';

export const useAuth = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isHydrated = useAuthStore(selectIsHydrated);
  const setTokens = useAuthStore((state) => state.setTokens);
  const clearTokens = useAuthStore((state) => state.clearTokens);

  const signOut = useCallback(() => {
    clearTokens();
  }, [clearTokens]);

  return {
    isAuthenticated,
    isHydrated,
    setTokens,
    clearTokens,
    signOut,
  };
};

export const useRequireAuth = (): boolean => {
  const { isAuthenticated, isHydrated } = useAuth();
  return isHydrated && isAuthenticated;
};
