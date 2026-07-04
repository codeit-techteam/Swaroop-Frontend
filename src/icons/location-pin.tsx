import { memo } from 'react';

import Svg, { Circle, Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type LocationPinIconProps = {
  size?: number;
  color?: string;
};

export const LocationPinIcon = memo(function LocationPinIcon({
  size = iconSizes.md,
  color = brandColors.muted,
}: LocationPinIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21C12 21 5 14.8 5 10C5 6.1 8.1 3 12 3C15.9 3 19 6.1 19 10C19 14.8 12 21 12 21Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={10} r={2.5} stroke={color} strokeWidth={1.6} />
    </Svg>
  );
});
