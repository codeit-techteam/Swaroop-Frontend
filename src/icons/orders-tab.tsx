import { memo } from 'react';

import Svg, { Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type OrdersTabIconProps = {
  size?: number;
  color?: string;
};

export const OrdersTabIcon = memo(function OrdersTabIcon({
  size = iconSizes.lg,
  color = brandColors.muted,
}: OrdersTabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={3.5} width={14} height={17} rx={2} stroke={color} strokeWidth={1.6} />
      <Path d="M8.5 8H15.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M8.5 12H15.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M8.5 16H12.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
});
