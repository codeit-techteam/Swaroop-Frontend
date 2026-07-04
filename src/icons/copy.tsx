import { memo } from 'react';

import Svg, { Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type CopyIconProps = {
  size?: number;
  color?: string;
};

export const CopyIcon = memo(function CopyIcon({
  size = iconSizes.md,
  color = brandColors.primary,
}: CopyIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect x={7} y={7} width={10} height={10} rx={2} stroke={color} strokeWidth={1.5} />
      <Path
        d="M13 7V5C13 3.9 12.1 3 11 3H5C3.9 3 3 3.9 3 5V11C3 12.1 3.9 13 5 13H7"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
});
