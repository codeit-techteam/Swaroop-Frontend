import { memo } from 'react';

import Svg, { Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type BriefcaseIconProps = {
  size?: number;
  color?: string;
};

export const BriefcaseIcon = memo(function BriefcaseIcon({
  size = iconSizes.lg,
  color = brandColors.success,
}: BriefcaseIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={8} width={18} height={12} rx={2} stroke={color} strokeWidth={1.6} />
      <Path d="M8 8V6C8 4.9 8.9 4 10 4H14C15.1 4 16 4.9 16 6V8" stroke={color} strokeWidth={1.6} />
      <Path d="M3 13H21" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
});
