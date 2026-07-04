export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
  logo: 72,
  logoSmall: 22,
  illustration: 280,
} as const;

export type IconSize = keyof typeof iconSizes;
