import { memo } from 'react';

import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type GalleryIconProps = {
  size?: number;
  color?: string;
};

export const GalleryIcon = memo(function GalleryIcon({
  size = iconSizes.sm,
  color = brandColors.heading,
}: GalleryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect x={3} y={5} width={14} height={11} rx={2} stroke={color} strokeWidth={1.4} />
      <Path
        d="M3 14L7.5 10L10.5 12.5L13.5 9.5L17 13"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={7} cy={8.5} r={1} fill={color} />
    </Svg>
  );
});
