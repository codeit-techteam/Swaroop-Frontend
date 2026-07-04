import { memo } from 'react';

import Svg, { Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type LockIconProps = {
  size?: number;
  color?: string;
};

export const LockIcon = memo(function LockIcon({
  size = iconSizes.sm,
  color = brandColors.success,
}: LockIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Rect x={3} y={7} width={10} height={7} rx={1.5} stroke={color} strokeWidth={1.3} />
      <Path
        d="M5 7V5C5 3.3 6.3 2 8 2C9.7 2 11 3.3 11 5V7"
        stroke={color}
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </Svg>
  );
});
