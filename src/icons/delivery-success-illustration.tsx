import { memo } from 'react';

import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';

type DeliverySuccessIllustrationProps = {
  width?: number;
  height?: number;
};

export const DeliverySuccessIllustration = memo(function DeliverySuccessIllustration({
  width = 240,
  height = 180,
}: DeliverySuccessIllustrationProps) {
  const { primary, primaryLight, heading, white, success, illustrationLight, illustrationMid } =
    brandColors;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 240 180"
      fill="none"
      accessibilityRole="image"
      accessibilityLabel="Delivery success illustration"
    >
      <Rect x={0} y={120} width={240} height={60} rx={4} fill={primaryLight} opacity={0.35} />
      <Rect x={48} y={48} width={96} height={72} rx={8} fill={white} stroke={primary} strokeWidth={1.5} />
      <Rect x={58} y={58} width={76} height={52} rx={4} fill={illustrationLight} />
      <Rect x={144} y={64} width={56} height={56} rx={8} fill={white} stroke={heading} strokeWidth={1.5} />
      <Path d="M156 88H188" stroke={illustrationMid} strokeWidth={2} strokeLinecap="round" />
      <Path d="M156 96H176" stroke={illustrationMid} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={72} cy={128} r={12} fill={heading} />
      <Circle cx={72} cy={128} r={5} fill={white} />
      <Circle cx={176} cy={128} r={12} fill={heading} />
      <Circle cx={176} cy={128} r={5} fill={white} />
      <Circle cx={196} cy={36} r={18} fill={success} opacity={0.15} />
      <Circle cx={196} cy={36} r={12} fill={success} />
      <Path
        d="M191 36L194.5 39.5L201 33"
        stroke={white}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
