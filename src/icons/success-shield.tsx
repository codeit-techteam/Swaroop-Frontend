import { memo } from 'react';

import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';

type SuccessShieldProps = {
  width?: number;
  height?: number;
};

export const SuccessShield = memo(function SuccessShield({
  width = 180,
  height = 160,
}: SuccessShieldProps) {
  const { primary, white, success, illustrationLight } = brandColors;

  return (
    <Svg width={width} height={height} viewBox="0 0 180 160" fill="none">
      <Rect x={30} y={118} width={120} height={18} rx={9} fill={primary} opacity={0.2} />
      <Rect x={45} y={126} width={90} height={10} rx={5} fill={primary} opacity={0.35} />
      <G>
        <Path
          d="M90 18L138 40V82C138 110 117 132 90 142C63 132 42 110 42 82V40L90 18Z"
          fill={primary}
        />
        <Path
          d="M72 82L85 95L112 66"
          stroke={white}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Circle cx={128} cy={112} r={16} fill={success} />
      <Path
        d="M121 112L126 117L136 106"
        stroke={white}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={40} cy={50} r={3} fill={illustrationLight} />
      <Circle cx={145} cy={48} r={2.5} fill={illustrationLight} />
    </Svg>
  );
});
