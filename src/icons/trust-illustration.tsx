import { memo } from 'react';

import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';

type TrustIllustrationProps = {
  width?: number;
  height?: number;
};

export const TrustIllustration = memo(function TrustIllustration({
  width = 260,
  height = 240,
}: TrustIllustrationProps) {
  const { primary, illustrationLight, illustrationMid, shield, verified, white } = brandColors;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 260 240"
      fill="none"
      accessibilityRole="image"
      accessibilityLabel="KYC verification illustration"
    >
      {/* Circuit board lines */}
      <G opacity={0.7}>
        <Path d="M40 175H90V195H120" stroke={illustrationLight} strokeWidth={1.5} fill="none" />
        <Path d="M220 175H170V195H140" stroke={illustrationLight} strokeWidth={1.5} fill="none" />
        <Path d="M100 200H160" stroke={illustrationLight} strokeWidth={1.5} fill="none" />
        <Path d="M80 185H50V210H90" stroke={illustrationMid} strokeWidth={1.2} fill="none" />
        <Path d="M180 185H210V210H170" stroke={illustrationMid} strokeWidth={1.2} fill="none" />
        <Circle cx={40} cy={175} r={3} fill={illustrationMid} />
        <Circle cx={220} cy={175} r={3} fill={illustrationMid} />
        <Circle cx={50} cy={210} r={2.5} fill={illustrationLight} />
        <Circle cx={210} cy={210} r={2.5} fill={illustrationLight} />
        <Circle cx={90} cy={210} r={2.5} fill={illustrationLight} />
        <Circle cx={170} cy={210} r={2.5} fill={illustrationLight} />
        <Rect x={115} y={198} width={8} height={8} rx={1} fill={illustrationMid} />
        <Rect x={137} y={198} width={8} height={8} rx={1} fill={illustrationMid} />
      </G>

      {/* Shield */}
      <Path
        d="M130 20L195 48V110C195 150 168 180 130 192C92 180 65 150 65 110V48L130 20Z"
        fill={shield}
      />
      <Path
        d="M130 32L182 55V110C182 144 160 170 130 180C100 170 78 144 78 110V55L130 32Z"
        fill={primary}
        opacity={0.35}
      />

      {/* Checklist items */}
      <G>
        <Rect x={95} y={70} width={14} height={14} rx={2} fill={white} opacity={0.9} />
        <Path
          d="M98 77L101 80L106 74"
          stroke={shield}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Rect x={116} y={73} width={40} height={6} rx={2} fill={white} opacity={0.85} />

        <Rect x={95} y={96} width={14} height={14} rx={2} fill={white} opacity={0.9} />
        <Path
          d="M98 103L101 106L106 100"
          stroke={shield}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Rect x={116} y={99} width={48} height={6} rx={2} fill={white} opacity={0.85} />

        <Rect x={95} y={122} width={14} height={14} rx={2} fill={white} opacity={0.9} />
        <Path
          d="M98 129L101 132L106 126"
          stroke={shield}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Rect x={116} y={125} width={36} height={6} rx={2} fill={white} opacity={0.85} />
      </G>

      {/* Verified badge */}
      <G>
        <Circle cx={185} cy={130} r={28} fill={verified} />
        <Circle cx={185} cy={130} r={24} fill={white} opacity={0.12} />
        <Path
          d="M173 130L181 138L199 118"
          stroke={white}
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
});
