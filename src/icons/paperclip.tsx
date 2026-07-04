import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type PaperclipIconProps = {
  size?: number;
  color?: string;
};

export const PaperclipIcon = memo(function PaperclipIcon({
  size = iconSizes.sm,
  color = brandColors.success,
}: PaperclipIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M13 7.5L8.2 12.3C6.8 13.7 4.6 13.7 3.2 12.3C1.8 10.9 1.8 8.7 3.2 7.3L8.5 2C9.4 1.1 10.9 1.1 11.8 2C12.7 2.9 12.7 4.4 11.8 5.3L6.6 10.5C6.2 10.9 5.5 10.9 5.1 10.5C4.7 10.1 4.7 9.4 5.1 9L9.5 4.6"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
