import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type RefreshIconProps = {
  size?: number;
  color?: string;
};

export const RefreshIcon = memo(function RefreshIcon({
  size = iconSizes.md,
  color = brandColors.white,
}: RefreshIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M16 10C16 13.3 13.3 16 10 16C6.7 16 4 13.3 4 10C4 6.7 6.7 4 10 4C12.1 4 13.9 5.1 15 6.7M15 4V7H12"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
