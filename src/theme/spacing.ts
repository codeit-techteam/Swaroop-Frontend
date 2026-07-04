export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  screenHorizontal: 24,
  screenTop: 16,
  screenBottom: 24,
  logoGap: 10,
  titleGap: 8,
  sectionGap: 20,
  indicatorGap: 28,
  buttonGap: 24,
} as const;

export type Spacing = typeof spacing;

export const getSpacing = (key: keyof typeof spacing): number => spacing[key];
