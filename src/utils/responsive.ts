import { Dimensions, PixelRatio, ScaledSize } from 'react-native';

import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const screenDimensions: ScaledSize = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  scale: PixelRatio.get(),
  fontScale: PixelRatio.getFontScale(),
};

export const isSmallDevice = SCREEN_WIDTH < 375;

export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;

export const isLargeDevice = SCREEN_WIDTH >= 414;

export const isTablet = SCREEN_WIDTH >= 768;

export const horizontalScale = (size: number): number => scale(size);

export const verticalResponsiveScale = (size: number): number => verticalScale(size);

export const moderateResponsiveScale = (size: number, factor = 0.5): number =>
  moderateScale(size, factor);

export const wp = (percentage: number): number => (SCREEN_WIDTH * percentage) / 100;

export const hp = (percentage: number): number => (SCREEN_HEIGHT * percentage) / 100;

export const normalizeFont = (size: number): number =>
  Math.round(PixelRatio.roundToNearestPixel(moderateScale(size)));
