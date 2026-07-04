import { memo } from 'react';

import Svg, { Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type BarChartIconProps = {
  size?: number;
  color?: string;
};

export const BarChartIcon = memo(function BarChartIcon({
  size = iconSizes.md,
  color = brandColors.heading,
}: BarChartIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect x={3} y={10} width={3.5} height={7} rx={0.8} fill={color} />
      <Rect x={8.25} y={6} width={3.5} height={11} rx={0.8} fill={color} />
      <Rect x={13.5} y={3} width={3.5} height={14} rx={0.8} fill={color} />
    </Svg>
  );
});
