import { memo } from 'react';

import Svg, { Circle, Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type HelpIconProps = {
  size?: number;
  color?: string;
};

export const HelpIcon = memo(function HelpIcon({
  size = iconSizes.lg,
  color = brandColors.primary,
}: HelpIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.6} />
      <Path
        d="M9.5 9.5C9.5 8.1 10.6 7 12 7C13.4 7 14.5 8.1 14.5 9.5C14.5 10.6 13.8 11.3 12.9 11.7C12.4 11.9 12 12.3 12 12.8V13.5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={16.5} r={1} fill={color} />
    </Svg>
  );
});
