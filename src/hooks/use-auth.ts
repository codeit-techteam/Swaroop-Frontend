import { useCallback } from 'react';

import {
  selectIsAuthenticated,
  selectIsHydrated,
  selectIsLoggedIn,
  selectKycApproved,
  useAuthStore,
} from '@/store/auth-store';

export const useAuth = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const isHydrated = useAuthStore(selectIsHydrated);
  const kycApproved = useAuthStore(selectKycApproved);
  const setTokens = useAuthStore((state) => state.setTokens);
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const logout = useAuthStore((state) => state.logout);
  const resetDemoAccount = useAuthStore((state) => state.resetDemoAccount);

  const signOut = useCallback(async () => {
    await logout();
  }, [logout]);

  const resetDemo = useCallback(async () => {
    await resetDemoAccount();
  }, [resetDemoAccount]);

  return {
    isAuthenticated,
    isLoggedIn,
    isHydrated,
    kycApproved,
    setTokens,
    clearTokens,
    signOut,
    resetDemo,
  };
};

export const useRequireAuth = (): boolean => {
  const { isLoggedIn, isHydrated, kycApproved } = useAuth();
  return isHydrated && isLoggedIn && kycApproved;
};
