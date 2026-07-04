import { memo } from 'react';

import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type StarBadgeIconProps = {
  size?: number;
  color?: string;
};

export const StarBadgeIcon = memo(function StarBadgeIcon({
  size = iconSizes.sm,
  color = brandColors.body,
}: StarBadgeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5L14.4 9.1L20.5 9.7L15.9 13.8L17.3 19.8L12 16.7L6.7 19.8L8.1 13.8L3.5 9.7L9.6 9.1L12 3.5Z"
        fill={color}
      />
    </Svg>
  );
});
