import { memo } from 'react';

import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';

type ProcurementIllustrationProps = {
  width?: number;
  height?: number;
};

export const ProcurementIllustration = memo(function ProcurementIllustration({
  width = 240,
  height = 180,
}: ProcurementIllustrationProps) {
  const { primary, primaryDark, primaryLight, illustrationLight, illustrationMid, heading, white } =
    brandColors;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 240 180"
      fill="none"
      accessibilityRole="image"
      accessibilityLabel="Procurement engine matching verified suppliers"
    >
      <Rect x={20} y={16} width={200} height={148} rx={16} fill={primaryLight} opacity={0.35} />

      <G opacity={0.75}>
        <Rect x={36} y={42} width={18} height={22} rx={2} fill={illustrationLight} />
        <Rect x={38} y={36} width={6} height={8} fill={illustrationMid} />
        <Rect x={46} y={36} width={6} height={8} fill={illustrationMid} />
        <Rect x={186} y={48} width={20} height={16} rx={2} fill={illustrationLight} />
        <Rect x={188} y={42} width={16} height={6} fill={illustrationMid} />
        <Rect x={34} y={118} width={22} height={14} rx={2} fill={illustrationLight} />
        <Rect x={182} y={112} width={24} height={18} rx={2} fill={illustrationLight} />
        <Circle cx={120} cy={34} r={8} fill={illustrationLight} />
        <Rect x={116} y={28} width={8} height={10} rx={1} fill={illustrationMid} />
      </G>

      <Circle
        cx={120}
        cy={92}
        r={46}
        stroke={primary}
        strokeWidth={2.5}
        fill={white}
        opacity={0.95}
      />
      <Path
        d="M148 92C148 107.464 135.464 120 120 120C104.536 120 92 107.464 92 92"
        stroke={primaryDark}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path d="M156 78L170 64" stroke={heading} strokeWidth={3.5} strokeLinecap="round" />
      <Circle cx={120} cy={92} r={14} stroke={primary} strokeWidth={2} fill={primaryLight} />
      <Circle cx={120} cy={92} r={6} fill={primaryDark} />

      <G>
        <Circle cx={104} cy={86} r={7} stroke={primary} strokeWidth={1.5} fill={white} />
        <Circle cx={136} cy={86} r={7} stroke={primary} strokeWidth={1.5} fill={white} />
        <Path
          d="M110 98C114 102 126 102 130 98"
          stroke={primary}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </G>

      <G opacity={0.55}>
        <Path
          d="M60 92H84M156 92H180M120 56V68M120 116V132"
          stroke={illustrationLight}
          strokeWidth={1.2}
        />
        <Circle cx={60} cy={92} r={3} fill={illustrationMid} />
        <Circle cx={180} cy={92} r={3} fill={illustrationMid} />
        <Circle cx={120} cy={56} r={3} fill={illustrationMid} />
        <Circle cx={120} cy={132} r={3} fill={illustrationMid} />
      </G>
    </Svg>
  );
});
