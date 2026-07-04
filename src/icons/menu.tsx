import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type MenuIconProps = {
  size?: number;
  color?: string;
};

export const MenuIcon = memo(function MenuIcon({
  size = iconSizes.lg,
  color = brandColors.heading,
}: MenuIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7H20M4 12H20M4 17H20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
});
