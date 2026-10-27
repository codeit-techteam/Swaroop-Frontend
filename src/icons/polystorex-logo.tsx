import { memo } from 'react';

import { Image, type ImageStyle, type StyleProp } from 'react-native';

type PolyStoreXLogoProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
  /** @deprecated Kept for call-site compatibility; logo uses brand asset colors. */
  color?: string;
};

const logoSource = require('../../assets/logo/polystorex-logo.png');

/** PolyStoreX brand mark + wordmark (raster). */
export const PolyStoreXLogo = memo(function PolyStoreXLogo({
  size = 72,
  style,
}: PolyStoreXLogoProps) {
  return (
    <Image
      source={logoSource}
      style={[{ width: size, height: size, resizeMode: 'contain' }, style]}
      accessibilityIgnoresInvertColors
      accessibilityLabel="PolyStoreX"
    />
  );
});
