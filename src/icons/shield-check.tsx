import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type ShieldCheckIconProps = {
  size?: number;
  color?: string;
};

export const ShieldCheckIcon = memo(function ShieldCheckIcon({
  size = iconSizes.md,
  color = brandColors.white,
}: ShieldCheckIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3L5 6V11.5C5 16 8.2 19.8 12 21C15.8 19.8 19 16 19 11.5V6L12 3Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path
        d="M9 12L11 14L15.5 9.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
