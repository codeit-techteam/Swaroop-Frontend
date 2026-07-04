import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type HourglassIconProps = {
  size?: number;
  color?: string;
};

export const HourglassIcon = memo(function HourglassIcon({
  size = iconSizes.md,
  color = brandColors.primary,
}: HourglassIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M5 3H15M5 17H15M6 3C6 7 9 8 10 10C11 8 14 7 14 3M6 17C6 13 9 12 10 10C11 12 14 13 14 17"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
