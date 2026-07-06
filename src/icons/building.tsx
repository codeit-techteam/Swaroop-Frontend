import { memo } from 'react';

import Svg, { Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type BuildingIconProps = {
  size?: number;
  color?: string;
};

export const BuildingIcon = memo(function BuildingIcon({
  size = iconSizes.md,
  color = brandColors.primary,
}: BuildingIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={3} width={16} height={18} rx={2} stroke={color} strokeWidth={1.6} />
      <Path d="M9 7H10" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M14 7H15" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M9 11H10" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M14 11H15" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M9 15H10" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M14 15H15" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M10 21V17H14V21" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
});
