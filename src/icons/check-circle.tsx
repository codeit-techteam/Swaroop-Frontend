import { memo } from 'react';

import Svg, { Circle, Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type CheckCircleIconProps = {
  size?: number;
  color?: string;
};

export const CheckCircleIcon = memo(function CheckCircleIcon({
  size = iconSizes.md,
  color = brandColors.primary,
}: CheckCircleIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill={color} />
      <Path
        d="M8 12.5L10.5 15L16 9.5"
        stroke={brandColors.white}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
