import { memo } from 'react';

import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type WalletIconProps = {
  size?: number;
  color?: string;
};

export const WalletIcon = memo(function WalletIcon({
  size = iconSizes.md,
  color = brandColors.error,
}: WalletIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={6} width={18} height={13} rx={2.5} stroke={color} strokeWidth={1.5} />
      <Path d="M3 10H21" stroke={color} strokeWidth={1.5} />
      <Circle cx={16.5} cy={14.5} r={1.3} fill={color} />
    </Svg>
  );
});
