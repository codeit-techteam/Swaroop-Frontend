import { memo } from 'react';

import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type IdCardIconProps = {
  size?: number;
  color?: string;
};

export const IdCardIcon = memo(function IdCardIcon({
  size = iconSizes.lg,
  color = brandColors.muted,
}: IdCardIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={5} width={18} height={14} rx={2} stroke={color} strokeWidth={1.6} />
      <Circle cx={9} cy={11} r={2} stroke={color} strokeWidth={1.4} />
      <Path d="M13 10H18M13 14H17" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Path
        d="M6.5 15.5C7.2 14.3 8 13.8 9 13.8C10 13.8 10.8 14.3 11.5 15.5"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </Svg>
  );
});
