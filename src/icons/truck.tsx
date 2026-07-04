import { memo } from 'react';

import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type TruckIconProps = {
  size?: number;
  color?: string;
};

export const TruckIcon = memo(function TruckIcon({
  size = iconSizes.md,
  color = brandColors.primary,
}: TruckIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={2.5} y={7} width={11} height={8} rx={1.5} stroke={color} strokeWidth={1.5} />
      <Path
        d="M13.5 10H17.2L20 13V15H13.5V10Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Circle cx={7} cy={17} r={1.8} stroke={color} strokeWidth={1.5} />
      <Circle cx={17} cy={17} r={1.8} stroke={color} strokeWidth={1.5} />
    </Svg>
  );
});
