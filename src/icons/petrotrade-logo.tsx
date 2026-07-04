import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type PetroTradeLogoProps = {
  size?: number;
  color?: string;
};

export const PetroTradeLogo = memo(function PetroTradeLogo({
  size = iconSizes.logo,
  color = brandColors.navy,
}: PetroTradeLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none" accessibilityRole="image">
      {/* Outer hexagon with integrated upward arrow on top-right */}
      <Path d="M40 8L62 21V36L70 31V18L58 11L40 8Z" fill={color} />
      <Path
        d="M40 8L18 21V49L40 62L54 54V46L40 54L26 46V24L40 16L54 24V32L62 27V21L40 8Z"
        stroke={color}
        strokeWidth={3.4}
        strokeLinejoin="round"
        fill="none"
      />
      {/* Inner hexagon */}
      <Path
        d="M40 22L54 30V46L40 54L26 46V30L40 22Z"
        stroke={color}
        strokeWidth={2.6}
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
});
