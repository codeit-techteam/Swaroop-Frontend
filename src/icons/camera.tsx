import { memo } from 'react';

import Svg, { Circle, Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type CameraIconProps = {
  size?: number;
  color?: string;
};

export const CameraIcon = memo(function CameraIcon({
  size = iconSizes.sm,
  color = brandColors.heading,
}: CameraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M3 7.5C3 6.7 3.7 6 4.5 6H7L8.5 4H11.5L13 6H15.5C16.3 6 17 6.7 17 7.5V15.5C17 16.3 16.3 17 15.5 17H4.5C3.7 17 3 16.3 3 15.5V7.5Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <Circle cx={10} cy={11.5} r={2.5} stroke={color} strokeWidth={1.4} />
    </Svg>
  );
});
