import { memo } from 'react';

import Svg, { Circle, Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type ProfileIconProps = {
  size?: number;
  color?: string;
};

export const ProfileIcon = memo(function ProfileIcon({
  size = iconSizes.lg,
  color = brandColors.heading,
}: ProfileIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.6} />
      <Circle cx={12} cy={10} r={3} stroke={color} strokeWidth={1.6} />
      <Path
        d="M6.5 18.5C7.8 16.2 9.7 15 12 15C14.3 15 16.2 16.2 17.5 18.5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
});
