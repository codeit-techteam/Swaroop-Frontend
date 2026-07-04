import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type PhoneIconProps = {
  size?: number;
  color?: string;
};

export const PhoneIcon = memo(function PhoneIcon({
  size = iconSizes.md,
  color = brandColors.primary,
}: PhoneIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.5 4.5H7C5.9 4.5 5 5.4 5 6.5V17.5C5 18.6 5.9 19.5 7 19.5H17C18.1 19.5 19 18.6 19 17.5V6.5C19 5.4 18.1 4.5 17 4.5H15.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M9 4.5C9 3.67 9.67 3 10.5 3H13.5C14.33 3 15 3.67 15 4.5C15 5.33 14.33 6 13.5 6H10.5C9.67 6 9 5.33 9 4.5Z"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path d="M10 16.5H14" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
});
