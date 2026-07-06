import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type EditIconProps = {
  size?: number;
  color?: string;
};

export const EditIcon = memo(function EditIcon({
  size = iconSizes.md,
  color = brandColors.primary,
}: EditIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 20H8L18.5 9.5C19.3284 8.67157 19.3284 7.32843 18.5 6.5L17.5 5.5C16.6716 4.67157 15.3284 4.67157 14.5 5.5L4 16V20Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M13.5 6.5L17.5 10.5" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
});
