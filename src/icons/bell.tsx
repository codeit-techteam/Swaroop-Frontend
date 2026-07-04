import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type BellIconProps = {
  size?: number;
  color?: string;
};

export const BellIcon = memo(function BellIcon({
  size = iconSizes.lg,
  color = brandColors.primary,
}: BellIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5C9.5 3.5 7.5 5.5 7.5 8V11.2C7.5 11.7 7.3 12.2 7 12.6L5.8 14.1C5.2 14.9 5.7 16 6.7 16H17.3C18.3 16 18.8 14.9 18.2 14.1L17 12.6C16.7 12.2 16.5 11.7 16.5 11.2V8C16.5 5.5 14.5 3.5 12 3.5Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path
        d="M10 16.5C10.3 17.6 11.1 18.5 12 18.5C12.9 18.5 13.7 17.6 14 16.5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
});
