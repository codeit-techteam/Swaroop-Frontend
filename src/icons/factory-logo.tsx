import { memo } from 'react';

import Svg, { Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type FactoryLogoProps = {
  size?: number;
  color?: string;
};

export const FactoryLogo = memo(function FactoryLogo({
  size = iconSizes.logoSmall,
  color = brandColors.primary,
}: FactoryLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityRole="image">
      <Path
        d="M3 20V10L8 13V10L13 13V8H16V5H19V8H21V20H3Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
        fill="none"
      />
      <Rect x={5.5} y={15} width={2} height={2.5} fill={color} />
      <Rect x={9.5} y={15} width={2} height={2.5} fill={color} />
      <Rect x={14.5} y={15} width={2} height={2.5} fill={color} />
      <Path d="M16 8V5H19V8" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
});
