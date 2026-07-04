import { memo } from 'react';

import Svg, { Circle, Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type CartIconProps = {
  size?: number;
  color?: string;
};

export const CartIcon = memo(function CartIcon({
  size = iconSizes.lg,
  color = brandColors.primary,
}: CartIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 5H6L8.5 14H17.5L20 8H8"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={10} cy={18} r={1.4} fill={color} />
      <Circle cx={17} cy={18} r={1.4} fill={color} />
    </Svg>
  );
});
