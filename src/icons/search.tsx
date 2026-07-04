import { memo } from 'react';

import Svg, { Circle, Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type SearchIconProps = {
  size?: number;
  color?: string;
};

export const SearchIcon = memo(function SearchIcon({
  size = iconSizes.md,
  color = brandColors.muted,
}: SearchIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={6.5} stroke={color} strokeWidth={1.6} />
      <Path d="M16 16L20 20" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
});
