import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type StoreIconProps = {
  size?: number;
  color?: string;
};

export const StoreIcon = memo(function StoreIcon({
  size = iconSizes.lg,
  color = brandColors.body,
}: StoreIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 9L5.5 4H18.5L20 9V11C20 12.1 19.1 13 18 13C16.9 13 16 12.1 16 11C16 12.1 15.1 13 14 13C12.9 13 12 12.1 12 11C12 12.1 11.1 13 10 13C8.9 13 8 12.1 8 11C8 12.1 7.1 13 6 13C4.9 13 4 12.1 4 11V9Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M6 13V20H18V13" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M10 20V16H14V20" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
});
