export const brandColors = {
  navy: '#103460',
  primary: '#5B84B1',
  title: '#4E7CB0',
  tagline: '#7C99B8',
  muted: '#8E8E8E',
  body: '#4B5563',
  skip: '#666666',
  footer: '#999999',
  background: '#F9F9F9',
  white: '#FFFFFF',
  indicatorInactive: '#D1D5DB',
  spinnerTrack: '#E5E7EB',
  illustrationLight: '#A8C4DE',
  illustrationMid: '#7BA3C9',
  illustrationDark: '#3D6A94',
  shield: '#2F5F8A',
  verified: '#3D7AB0',
} as const;

export const colors = {
  light: {
    primary: brandColors.primary,
    primaryForeground: brandColors.white,
    secondary: '#F1F5F9',
    secondaryForeground: brandColors.navy,
    background: brandColors.white,
    foreground: brandColors.navy,
    muted: brandColors.background,
    mutedForeground: brandColors.muted,
    border: '#E2E8F0',
    destructive: '#EF4444',
    destructiveForeground: brandColors.white,
    success: '#22C55E',
    successForeground: brandColors.white,
    warning: '#F59E0B',
    warningForeground: brandColors.white,
    brand: brandColors,
  },
  dark: {
    primary: brandColors.primary,
    primaryForeground: brandColors.white,
    secondary: '#1E293B',
    secondaryForeground: '#F8FAFC',
    background: '#0F172A',
    foreground: '#F8FAFC',
    muted: '#1E293B',
    mutedForeground: '#94A3B8',
    border: '#334155',
    destructive: '#F87171',
    destructiveForeground: brandColors.white,
    success: '#4ADE80',
    successForeground: '#0F172A',
    warning: '#FBBF24',
    warningForeground: '#0F172A',
    brand: brandColors,
  },
} as const;

export type ThemeColorScheme = keyof typeof colors;

export type ThemeColors = (typeof colors)[ThemeColorScheme];

export type BrandColors = typeof brandColors;

export const getThemeColors = (scheme: ThemeColorScheme): ThemeColors => colors[scheme];
