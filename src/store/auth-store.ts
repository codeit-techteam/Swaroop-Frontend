import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants';
import type { AuthStore } from '@/types/store';
import { getStorageItem, removeStorageItem, setStorageItem } from '@/utils/storage';

const zustandStorage = {
  getItem: (name: string): string | null => getStorageItem(name) ?? null,
  setItem: (name: string, value: string): void => {
    setStorageItem(name, value);
  },
  removeItem: (name: string): void => {
    removeStorageItem(name);
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,
      setTokens: (accessToken, refreshToken) => {
        setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },
      clearTokens: () => {
        removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
        removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'swaroop-auth-store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export const selectIsAuthenticated = (state: AuthStore): boolean => state.isAuthenticated;

export const selectIsHydrated = (state: AuthStore): boolean => state.isHydrated;

export const selectAccessToken = (state: AuthStore): string | null => state.accessToken;
