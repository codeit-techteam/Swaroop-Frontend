import { memo } from 'react';

import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';

type SettlementReleasedIllustrationProps = {
  width?: number;
  height?: number;
};

export const SettlementReleasedIllustration = memo(function SettlementReleasedIllustration({
  width = 240,
  height = 180,
}: SettlementReleasedIllustrationProps) {
  const { primary, primaryLight, heading, white, success, illustrationLight } = brandColors;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 240 180"
      fill="none"
      accessibilityRole="image"
      accessibilityLabel="Settlement released illustration"
    >
      <Rect x={0} y={120} width={240} height={60} rx={4} fill={primaryLight} opacity={0.35} />
      <Rect x={56} y={52} width={128} height={80} rx={12} fill={white} stroke={primary} strokeWidth={1.5} />
      <Rect x={72} y={68} width={96} height={12} rx={4} fill={illustrationLight} />
      <Rect x={72} y={88} width={72} height={8} rx={4} fill={illustrationLight} />
      <Rect x={72} y={104} width={56} height={8} rx={4} fill={illustrationLight} />
      <Circle cx={120} cy={40} r={22} fill={success} opacity={0.15} />
      <Circle cx={120} cy={40} r={14} fill={success} />
      <Path
        d="M114 40L118 44L126 34"
        stroke={white}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M168 96C176 88 184 84 192 88"
        stroke={heading}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx={196} cy={90} r={6} fill={primary} />
      <Path d="M48 96C40 88 32 84 24 88" stroke={heading} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={20} cy={90} r={6} fill={primary} />
    </Svg>
  );
});
