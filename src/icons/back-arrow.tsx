import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type BackArrowIconProps = {
  size?: number;
  color?: string;
};

export const BackArrowIcon = memo(function BackArrowIcon({
  size = iconSizes.lg,
  color = brandColors.primary,
}: BackArrowIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 6L9 12L15 18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
