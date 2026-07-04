import { memo } from 'react';

import Svg, { Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type ClipboardCheckIconProps = {
  size?: number;
  color?: string;
};

export const ClipboardCheckIcon = memo(function ClipboardCheckIcon({
  size = iconSizes.md,
  color = brandColors.primary,
}: ClipboardCheckIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={6}
        y={4.5}
        width={12}
        height={16}
        rx={2}
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M9 4.5H15V6.5C15 7.05 14.55 7.5 14 7.5H10C9.45 7.5 9 7.05 9 6.5V4.5Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path
        d="M9.5 13L11.2 14.7L14.5 11"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
