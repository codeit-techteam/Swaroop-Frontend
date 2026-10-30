import { memo } from 'react';

import { Image, type ImageStyle, type StyleProp } from 'react-native';

type PolyStoreXLogoProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
  /** @deprecated Kept for call-site compatibility; logo uses brand asset colors. */
  color?: string;
  /** `mark` = circular symbol only; `full` = mark + baked-in wordmark. */
  variant?: 'mark' | 'full';
};

const logoFullSource = require('../../assets/logo/polystorex-logo.png');
const logoMarkSource = require('../../assets/logo/polystorex-mark.png');

/** PolyStoreX brand raster logo. */
export const PolyStoreXLogo = memo(function PolyStoreXLogo({
  size = 72,
  style,
  variant = 'mark',
}: PolyStoreXLogoProps) {
  return (
    <Image
      source={variant === 'full' ? logoFullSource : logoMarkSource}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
      accessibilityLabel="PolyStoreX"
    />
  );
});
