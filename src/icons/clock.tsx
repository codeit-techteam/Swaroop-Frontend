import { memo } from 'react';

import Svg, { Circle, Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type ClockIconProps = {
  size?: number;
  color?: string;
};

export const ClockIcon = memo(function ClockIcon({
  size = iconSizes.sm,
  color = brandColors.muted,
}: ClockIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Circle cx={8} cy={8} r={6} stroke={color} strokeWidth={1.3} />
      <Path d="M8 4.5V8L10.5 9.5" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
});
