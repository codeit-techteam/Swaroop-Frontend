import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type DocumentFileIconProps = {
  size?: number;
  color?: string;
};

export const DocumentFileIcon = memo(function DocumentFileIcon({
  size = iconSizes.lg,
  color = brandColors.primary,
}: DocumentFileIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 3H14L19 8V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V5C5 3.9 5.9 3 7 3Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M14 3V8H19" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M9 13H15M9 17H13" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
});
