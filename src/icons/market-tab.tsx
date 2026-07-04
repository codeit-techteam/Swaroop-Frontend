import { memo } from 'react';

import Svg, { Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type MarketTabIconProps = {
  size?: number;
  color?: string;
};

export const MarketTabIcon = memo(function MarketTabIcon({
  size = iconSizes.lg,
  color = brandColors.muted,
}: MarketTabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={13} width={3.5} height={7} rx={1} fill={color} />
      <Rect x={10.25} y={9} width={3.5} height={11} rx={1} fill={color} />
      <Rect x={16.5} y={5} width={3.5} height={15} rx={1} fill={color} />
      <Path d="M4 5H20" stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity={0.35} />
    </Svg>
  );
});
