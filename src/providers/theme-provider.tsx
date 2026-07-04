import { type ReactNode, useEffect } from 'react';

import { useColorScheme } from 'react-native';

import * as SystemUI from 'expo-system-ui';

import { useTheme } from '@/hooks/use-theme';
import { getThemeColors } from '@/theme/colors';

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { resolvedTheme } = useTheme();
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    const theme = resolvedTheme ?? (systemColorScheme === 'dark' ? 'dark' : 'light');
    const colors = getThemeColors(theme);

    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [resolvedTheme, systemColorScheme]);

  return children;
};
