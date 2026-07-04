import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type ChevronRightIconProps = {
  size?: number;
  color?: string;
};

export const ChevronRightIcon = memo(function ChevronRightIcon({
  size = iconSizes.sm,
  color = brandColors.muted,
}: ChevronRightIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M6 4L10 8L6 12"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
