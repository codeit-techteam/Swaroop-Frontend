import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type HeadsetIconProps = {
  size?: number;
  color?: string;
};

export const HeadsetIcon = memo(function HeadsetIcon({
  size = iconSizes.md,
  color = brandColors.primary,
}: HeadsetIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 12.5V13.5C4.5 16.5 7 19 10 19H11"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M4.5 12.5C4.5 8.36 7.86 5 12 5C16.14 5 19.5 8.36 19.5 12.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M4.5 12.5C4.5 13.6 5.4 14.5 6.5 14.5H7V10.5H6.5C5.4 10.5 4.5 11.4 4.5 12.5Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path
        d="M19.5 12.5C19.5 13.6 18.6 14.5 17.5 14.5H17V10.5H17.5C18.6 10.5 19.5 11.4 19.5 12.5Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path
        d="M14 19H15C16.1 19 17 19.9 17 21"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
});
