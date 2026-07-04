import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type ChevronDownIconProps = {
  size?: number;
  color?: string;
};

export const ChevronDownIcon = memo(function ChevronDownIcon({
  size = iconSizes.sm,
  color = brandColors.primary,
}: ChevronDownIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M4 6L8 10L12 6"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
