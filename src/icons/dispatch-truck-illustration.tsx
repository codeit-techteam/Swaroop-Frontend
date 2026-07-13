import { memo } from 'react';

import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';

type DispatchTruckIllustrationProps = {
  width?: number;
  height?: number;
};

export const DispatchTruckIllustration = memo(function DispatchTruckIllustration({
  width = 240,
  height = 180,
}: DispatchTruckIllustrationProps) {
  const { primary, primaryLight, heading, white, success, illustrationLight, illustrationMid } =
    brandColors;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 240 180"
      fill="none"
      accessibilityRole="image"
      accessibilityLabel="Delivery truck on the road"
    >
      <Rect x={0} y={130} width={240} height={50} rx={4} fill={primaryLight} opacity={0.4} />
      <Path
        d="M0 145H240"
        stroke={illustrationLight}
        strokeWidth={1.5}
        strokeDasharray="8 6"
      />
      <Rect x={30} y={95} width={140} height={40} rx={6} fill={white} stroke={primary} strokeWidth={1.5} />
      <Rect x={170} y={85} width={50} height={50} rx={6} fill={white} stroke={primary} strokeWidth={1.5} />
      <Rect x={178} y={95} width={34} height={22} rx={3} fill={primaryLight} />
      <Circle cx={60} cy={140} r={14} fill={heading} />
      <Circle cx={60} cy={140} r={7} fill={white} />
      <Circle cx={190} cy={140} r={14} fill={heading} />
      <Circle cx={190} cy={140} r={7} fill={white} />
      <Path
        d="M40 95V75C40 65 50 55 65 55H120"
        stroke={primary}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Rect x={120} y={45} width={60} height={50} rx={4} fill={illustrationMid} opacity={0.3} />
      <Path d="M130 55H170M130 65H165M130 75H160" stroke={illustrationLight} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={200} cy={55} r={18} fill={success} />
      <Path
        d="M193 55L198 60L208 49"
        stroke={white}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M85 70L95 80L115 58"
        stroke={primary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.5}
      />
    </Svg>
  );
});
