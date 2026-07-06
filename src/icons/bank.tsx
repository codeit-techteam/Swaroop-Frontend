import { memo } from 'react';

import Svg, { Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type BankIconProps = {
  size?: number;
  color?: string;
};

export const BankIcon = memo(function BankIcon({
  size = iconSizes.md,
  color = brandColors.heading,
}: BankIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M2 8L10 3L18 8"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x={4} y={8} width={2.5} height={7} fill={color} />
      <Rect x={8.75} y={8} width={2.5} height={7} fill={color} />
      <Rect x={13.5} y={8} width={2.5} height={7} fill={color} />
      <Path d="M2 15H18" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M2 17H18" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
});
