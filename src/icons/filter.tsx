import { memo } from 'react';

import Svg, { Circle, Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type FilterIconProps = {
  size?: number;
  color?: string;
};

export const FilterIcon = memo(function FilterIcon({
  size = iconSizes.md,
  color = brandColors.primary,
}: FilterIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7H20" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M7 12H17" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M10 17H14" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx={8} cy={7} r={1.8} fill={color} />
      <Circle cx={15} cy={12} r={1.8} fill={color} />
      <Circle cx={12} cy={17} r={1.8} fill={color} />
    </Svg>
  );
});
