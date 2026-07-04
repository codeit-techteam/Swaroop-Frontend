import { memo } from 'react';

import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';

type OtpIllustrationProps = {
  width?: number;
  height?: number;
};

export const OtpIllustration = memo(function OtpIllustration({
  width = 200,
  height = 160,
}: OtpIllustrationProps) {
  const { primary, white, otpCircuit, illustrationLight } = brandColors;

  return (
    <Svg width={width} height={height} viewBox="0 0 200 160" fill="none">
      <Rect width={200} height={160} rx={12} fill={otpCircuit} />
      <G opacity={0.45}>
        <Path d="M20 120H70V140H100" stroke={illustrationLight} strokeWidth={1.2} />
        <Path d="M180 120H130V140H100" stroke={illustrationLight} strokeWidth={1.2} />
        <Path d="M40 40H80V70" stroke={illustrationLight} strokeWidth={1.2} />
        <Path d="M160 40H120V70" stroke={illustrationLight} strokeWidth={1.2} />
        <Circle cx={20} cy={120} r={2.5} fill={primary} />
        <Circle cx={180} cy={120} r={2.5} fill={primary} />
        <Circle cx={40} cy={40} r={2.5} fill={primary} />
        <Circle cx={160} cy={40} r={2.5} fill={primary} />
        <Rect x={90} y={130} width={8} height={8} rx={1} fill={primary} />
      </G>
      <Path
        d="M100 28L145 48V88C145 112 126 132 100 140C74 132 55 112 55 88V48L100 28Z"
        fill={primary}
      />
      <Path
        d="M85 88L95 98L118 72"
        stroke={white}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
