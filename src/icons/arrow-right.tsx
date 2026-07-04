import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type ArrowRightIconProps = {
  size?: number;
  color?: string;
};

export const ArrowRightIcon = memo(function ArrowRightIcon({
  size = iconSizes.sm,
  color = brandColors.white,
}: ArrowRightIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" accessibilityRole="image">
      <Path
        d="M3 8H13M13 8L9 4M13 8L9 12"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
