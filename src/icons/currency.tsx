import { memo } from 'react';

import Svg, { Circle, Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type CurrencyIconProps = {
  size?: number;
  color?: string;
};

export const CurrencyIcon = memo(function CurrencyIcon({
  size = iconSizes.sm,
  color = brandColors.success,
}: CurrencyIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.6} />
      <Path
        d="M12 7V17M9.5 9.5C9.5 8.4 10.6 7.5 12 7.5C13.4 7.5 14.5 8.4 14.5 9.5C14.5 10.6 13.4 11.5 12 11.5C10.6 11.5 9.5 12.4 9.5 13.5C9.5 14.6 10.6 15.5 12 15.5C13.4 15.5 14.5 14.6 14.5 13.5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
});
