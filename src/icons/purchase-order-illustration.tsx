import { memo } from 'react';

import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';

type PurchaseOrderIllustrationProps = {
  width?: number;
  height?: number;
};

export const PurchaseOrderIllustration = memo(function PurchaseOrderIllustration({
  width = 200,
  height = 160,
}: PurchaseOrderIllustrationProps) {
  const { primary, primaryLight, heading, white, success, illustrationLight } = brandColors;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 200 160"
      fill="none"
      accessibilityRole="image"
      accessibilityLabel="Purchase order document confirmed"
    >
      <Rect x={48} y={20} width={104} height={120} rx={8} fill={primaryLight} opacity={0.5} />
      <Rect x={40} y={28} width={104} height={120} rx={8} fill={white} stroke={primary} strokeWidth={1.5} />
      <Path d="M56 52H128M56 68H120M56 84H112M56 100H104" stroke={illustrationLight} strokeWidth={3} strokeLinecap="round" />
      <Circle cx={148} cy={36} r={22} fill={success} />
      <Path
        d="M140 36L146 42L157 30"
        stroke={white}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x={72} y={132} width={56} height={18} rx={9} fill={primaryLight} />
      <Path
        d="M84 141H116"
        stroke={heading}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.6}
      />
    </Svg>
  );
});
