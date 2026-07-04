import { memo } from 'react';

import Svg, { Circle, Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type AlertCircleIconProps = {
  size?: number;
  color?: string;
};

export const AlertCircleIcon = memo(function AlertCircleIcon({
  size = iconSizes.sm,
  color = brandColors.error,
}: AlertCircleIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.5} />
      <Path d="M12 8V13" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx={12} cy={16.2} r={1} fill={color} />
    </Svg>
  );
});
