import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type SavingsArrowIconProps = {
  size?: number;
  color?: string;
};

export const SavingsArrowIcon = memo(function SavingsArrowIcon({
  size = iconSizes.sm,
  color = brandColors.white,
}: SavingsArrowIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 3V13M8 13L4.5 9.5M8 13L11.5 9.5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
