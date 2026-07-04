import { memo } from 'react';

import Svg, { Circle, Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type InfoIconProps = {
  size?: number;
  color?: string;
};

export const InfoIcon = memo(function InfoIcon({
  size = iconSizes.sm,
  color = brandColors.primary,
}: InfoIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Circle cx={8} cy={8} r={6} stroke={color} strokeWidth={1.3} />
      <Path d="M8 7V11" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
      <Circle cx={8} cy={5} r={0.8} fill={color} />
    </Svg>
  );
});
