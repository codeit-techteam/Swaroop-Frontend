import { memo } from 'react';

import Svg, { Circle, Path } from 'react-native-svg';

import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type CloudUploadIconProps = {
  size?: number;
  color?: string;
};

export const CloudUploadIcon = memo(function CloudUploadIcon({
  size = iconSizes.lg,
  color = brandColors.primary,
}: CloudUploadIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 17H6C4.3 17 3 15.7 3 14C3 12.6 4 11.3 5.4 11.1C5.8 8.6 8 6.7 10.7 6.7C12.4 6.7 13.9 7.5 14.8 8.7C15.2 8.6 15.6 8.5 16 8.5C18.2 8.5 20 10.3 20 12.5C20 14.4 18.7 16 16.9 16.3"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 12V19M12 12L9.5 14.5M12 12L14.5 14.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12} r={11} stroke={color} strokeWidth={0.8} strokeOpacity={0.25} />
    </Svg>
  );
});
