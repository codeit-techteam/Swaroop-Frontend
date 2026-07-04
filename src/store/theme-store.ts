import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants';
import type { ThemeStore } from '@/types/store';
import { getStorageItem, setStorageItem, removeStorageItem } from '@/utils/storage';

const themeStorage = {
  getItem: (name: string): string | null => getStorageItem(name) ?? null,
  setItem: (name: string, value: string): void => {
    setStorageItem(name, value);
  },
  removeItem: (name: string): void => {
    removeStorageItem(name);
  },
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'system',
      resolvedTheme: 'light',
      setMode: (mode) => set({ mode }),
      setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
    }),
    {
      name: STORAGE_KEYS.THEME_MODE,
      storage: createJSONStorage(() => themeStorage),
      partialize: (state) => ({ mode: state.mode }),
    },
  ),
);

export const selectThemeMode = (state: ThemeStore): ThemeStore['mode'] => state.mode;

export const selectResolvedTheme = (state: ThemeStore): 'light' | 'dark' => state.resolvedTheme;
