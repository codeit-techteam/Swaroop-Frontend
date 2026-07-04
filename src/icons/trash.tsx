import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type TrashIconProps = {
  size?: number;
  color?: string;
};

export const TrashIcon = memo(function TrashIcon({
  size = iconSizes.md,
  color = brandColors.muted,
}: TrashIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 7H19"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M9 7V5.5C9 4.67 9.67 4 10.5 4H13.5C14.33 4 15 4.67 15 5.5V7"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M18 7L17.2 18.2C17.1 19.2 16.3 20 15.3 20H8.7C7.7 20 6.9 19.2 6.8 18.2L6 7"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path d="M10 11V16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M14 11V16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
});
