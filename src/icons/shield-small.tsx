import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type ShieldSmallIconProps = {
  size?: number;
  color?: string;
};

export const ShieldSmallIcon = memo(function ShieldSmallIcon({
  size = iconSizes.xs,
  color = brandColors.footer,
}: ShieldSmallIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" accessibilityRole="image">
      <Path
        d="M8 1.5L13.5 4V8.2C13.5 11.1 11.2 13.7 8 14.5C4.8 13.7 2.5 11.1 2.5 8.2V4L8 1.5Z"
        stroke={color}
        strokeWidth={1.3}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M5.5 8L7.2 9.7L10.5 6.2"
        stroke={color}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
