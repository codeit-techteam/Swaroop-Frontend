import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type LightningIconProps = {
  size?: number;
  color?: string;
};

export const LightningIcon = memo(function LightningIcon({
  size = iconSizes.sm,
  color = brandColors.primaryDark,
}: LightningIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 2L4 14H11L10 22L20 10H13L13 2Z"
        fill={color}
        stroke={color}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    </Svg>
  );
});
