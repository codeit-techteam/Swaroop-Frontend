import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type HomeTabIconProps = {
  size?: number;
  color?: string;
  filled?: boolean;
};

export const HomeTabIcon = memo(function HomeTabIcon({
  size = iconSizes.lg,
  color = brandColors.primary,
  filled = false,
}: HomeTabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 10.5L12 4L20 10.5V19C20 19.6 19.6 20 19 20H5C4.4 20 4 19.6 4 19V10.5Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
      <Path
        d="M10 20V14H14V20"
        stroke={filled ? brandColors.white : color}
        strokeWidth={1.6}
        strokeLinejoin="round"
        fill={filled ? brandColors.white : 'none'}
      />
    </Svg>
  );
});
