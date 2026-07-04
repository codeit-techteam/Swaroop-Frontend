import { normalizeFont } from '@/utils/responsive';

export const typography = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  fontSize: {
    xs: normalizeFont(11),
    sm: normalizeFont(12),
    md: normalizeFont(14),
    base: normalizeFont(16),
    lg: normalizeFont(18),
    xl: normalizeFont(20),
    '2xl': normalizeFont(22),
    '3xl': normalizeFont(28),
    '4xl': normalizeFont(36),
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.65,
  },
  letterSpacing: {
    tight: -0.2,
    normal: 0,
    wide: 1.2,
    wider: 2,
    widest: 2.4,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export type Typography = typeof typography;
