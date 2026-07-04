import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type UploadIconProps = {
  size?: number;
  color?: string;
};

export const UploadIcon = memo(function UploadIcon({
  size = iconSizes.sm,
  color = brandColors.white,
}: UploadIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 11V3M8 3L5 6M8 3L11 6M3 13H13"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
