import { Platform, ViewStyle } from 'react-native';

type ShadowLevel = 'sm' | 'md' | 'lg' | 'xl';

const shadowColor = '#000000';

const iosShadows: Record<ShadowLevel, ViewStyle> = {
  sm: {
    shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  md: {
    shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  lg: {
    shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },
  xl: {
    shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
};

const androidElevations: Record<ShadowLevel, ViewStyle> = {
  sm: { elevation: 2 },
  md: { elevation: 4 },
  lg: { elevation: 8 },
  xl: { elevation: 12 },
};

export const getShadow = (level: ShadowLevel): ViewStyle =>
  Platform.select({
    ios: iosShadows[level],
    android: androidElevations[level],
    default: androidElevations[level],
  }) ?? androidElevations[level];

export const elevation = {
  sm: getShadow('sm'),
  md: getShadow('md'),
  lg: getShadow('lg'),
  xl: getShadow('xl'),
} as const;
