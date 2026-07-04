import { useCallback, useEffect } from 'react';

import { useColorScheme as useSystemColorScheme } from 'react-native';

import { selectResolvedTheme, selectThemeMode, useThemeStore } from '@/store/theme-store';

export const useTheme = () => {
  const systemColorScheme = useSystemColorScheme();
  const mode = useThemeStore(selectThemeMode);
  const resolvedTheme = useThemeStore(selectResolvedTheme);
  const setMode = useThemeStore((state) => state.setMode);
  const setResolvedTheme = useThemeStore((state) => state.setResolvedTheme);

  useEffect(() => {
    const theme = mode === 'system' ? (systemColorScheme === 'dark' ? 'dark' : 'light') : mode;
    setResolvedTheme(theme);
  }, [mode, systemColorScheme, setResolvedTheme]);

  return {
    mode,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    setMode,
  };
};

export const useIsDarkMode = (): boolean => {
  const { isDark } = useTheme();
  return isDark;
};

export const useThemeToggle = () => {
  const { mode, setMode, isDark } = useTheme();

  const toggleTheme = useCallback(() => {
    if (mode === 'system') {
      setMode(isDark ? 'light' : 'dark');
      return;
    }
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, isDark, setMode]);

  return { toggleTheme, mode, isDark };
};
