import { memo } from 'react';

import { Image, type ImageStyle, type StyleProp } from 'react-native';

type PolyStoreXLogoProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
  /** @deprecated Kept for call-site compatibility. The artwork uses its own colors. */
  color?: string;
  /** `mark` = orbital symbol. `full` = official lockup on a black plate. */
  variant?: 'mark' | 'full';
};

const logoOnLight = require('../../assets/brand/polystorex-logo-light-bg.png');
const logoMark = require('../../assets/brand/polystorex-symbol.png');

const LIGHT_ASPECT = 928 / 436;
const MARK_ASPECT = 216 / 169;

/** Official PolyStoreX artwork. */
export const PolyStoreXLogo = memo(function PolyStoreXLogo({
  size = 72,
  style,
  variant = 'mark',
}: PolyStoreXLogoProps) {
  const height = variant === 'full' ? size : size;
  const width = variant === 'full' ? size * LIGHT_ASPECT : size * MARK_ASPECT;
  return (
    <Image
      source={variant === 'full' ? logoOnLight : logoMark}
      style={[{ width, height }, style]}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
      accessibilityLabel="PolyStoreX"
    />
  );
});
