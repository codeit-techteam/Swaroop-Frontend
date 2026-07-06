import { memo } from 'react';

import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';

type PaymentVerificationIllustrationProps = {
  width?: number;
  height?: number;
};

export const PaymentVerificationIllustration = memo(function PaymentVerificationIllustration({
  width = 220,
  height = 180,
}: PaymentVerificationIllustrationProps) {
  const { primary, primaryDark, primaryLight, illustrationLight, illustrationMid, heading, white } =
    brandColors;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 220 180"
      fill="none"
      accessibilityRole="image"
      accessibilityLabel="Secure payment verification illustration"
    >
      <Circle cx={110} cy={88} r={72} stroke={primaryLight} strokeWidth={2} fill={white} />
      <Circle cx={110} cy={88} r={58} stroke={illustrationLight} strokeWidth={1.5} fill="none" />

      <G opacity={0.85}>
        <Circle cx={48} cy={52} r={10} fill={primaryLight} />
        <Path d="M44 52H52M48 48V56" stroke={primary} strokeWidth={1.4} strokeLinecap="round" />
        <Circle cx={172} cy={52} r={10} fill={primaryLight} />
        <Rect x={166} y={48} width={12} height={8} rx={1.5} fill={primary} opacity={0.5} />
        <Circle cx={42} cy={128} r={9} fill={primaryLight} />
        <Path
          d="M38 128C40 124 44 124 46 128C48 132 52 132 54 128"
          stroke={primary}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        <Circle cx={178} cy={128} r={9} fill={primaryLight} />
        <Path d="M174 132V124H182" stroke={primary} strokeWidth={1.2} strokeLinecap="round" />
      </G>

      <Path
        d="M110 38L148 54V92C148 116 132 134 110 140C88 134 72 116 72 92V54L110 38Z"
        fill={primaryDark}
      />
      <Path
        d="M110 46L140 58V92C140 112 127 126 110 131C93 126 80 112 80 92V58L110 46Z"
        fill={primary}
        opacity={0.45}
      />

      <Rect x={96} y={72} width={28} height={22} rx={2} fill={white} opacity={0.95} />
      <Path d="M96 78H124" stroke={heading} strokeWidth={1.5} />
      <Rect x={100} y={82} width={6} height={10} fill={heading} opacity={0.7} />
      <Rect x={108} y={82} width={6} height={10} fill={heading} opacity={0.7} />
      <Rect x={116} y={82} width={6} height={10} fill={heading} opacity={0.7} />
      <Path d="M94 94H126" stroke={heading} strokeWidth={1.5} strokeLinecap="round" />

      <Circle cx={110} cy={108} r={8} fill={white} />
      <Path
        d="M106 108L109 111L115 105"
        stroke={primaryDark}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <G opacity={0.6}>
        <Circle cx={110} cy={88} r={3} fill={illustrationMid} />
        <Path
          d="M110 62V74M110 102V114M84 88H96M124 88H136"
          stroke={illustrationLight}
          strokeWidth={1}
        />
      </G>
    </Svg>
  );
});
