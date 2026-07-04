import { memo } from 'react';

import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';

type TradingIllustrationProps = {
  width?: number;
  height?: number;
};

export const TradingIllustration = memo(function TradingIllustration({
  width = 300,
  height = 220,
}: TradingIllustrationProps) {
  const { primary, illustrationLight, illustrationMid, illustrationDark, navy } = brandColors;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 300 220"
      fill="none"
      accessibilityRole="image"
      accessibilityLabel="Industrial B2B marketplace illustration"
    >
      {/* Dotted connection lines */}
      <Path
        d="M70 70C95 55 120 70 150 95"
        stroke={illustrationLight}
        strokeWidth={1.5}
        strokeDasharray="3 4"
        fill="none"
      />
      <Path
        d="M90 150C110 130 130 120 150 110"
        stroke={illustrationLight}
        strokeWidth={1.5}
        strokeDasharray="3 4"
        fill="none"
      />
      <Path
        d="M150 110C175 95 200 70 230 60"
        stroke={illustrationLight}
        strokeWidth={1.5}
        strokeDasharray="3 4"
        fill="none"
      />
      <Path
        d="M150 120C180 130 210 145 235 160"
        stroke={illustrationLight}
        strokeWidth={1.5}
        strokeDasharray="3 4"
        fill="none"
      />
      <Path
        d="M150 125C170 150 190 165 210 175"
        stroke={illustrationLight}
        strokeWidth={1.5}
        strokeDasharray="3 4"
        fill="none"
      />

      {/* Warehouse - top left */}
      <G>
        <Path d="M40 55L70 40L100 55V85H40V55Z" fill={illustrationMid} />
        <Path d="M40 55L70 40L100 55" stroke={primary} strokeWidth={1.5} fill="none" />
        <Rect x={48} y={62} width={12} height={14} fill={brandColors.white} opacity={0.7} />
        <Rect x={70} y={62} width={12} height={14} fill={brandColors.white} opacity={0.7} />
        <Rect x={40} y={85} width={60} height={4} fill={primary} />
      </G>

      {/* Small factory - mid left */}
      <G>
        <Rect x={35} y={120} width={50} height={30} fill={illustrationMid} />
        <Path d="M35 120L50 105H70L85 120" fill={illustrationDark} />
        <Rect x={42} y={128} width={8} height={10} fill={brandColors.white} opacity={0.75} />
        <Rect x={55} y={128} width={8} height={10} fill={brandColors.white} opacity={0.75} />
        <Rect x={68} y={128} width={8} height={10} fill={brandColors.white} opacity={0.75} />
        <Rect x={72} y={95} width={8} height={18} fill={illustrationDark} />
        <Path d="M72 95H80L84 88H76L72 95Z" fill={primary} />
      </G>

      {/* Cargo ship - bottom left */}
      <G>
        <Path d="M45 185H95L105 175H55L45 185Z" fill={primary} />
        <Rect x={60} y={160} width={14} height={15} fill={illustrationMid} />
        <Rect x={78} y={165} width={12} height={10} fill={illustrationDark} />
        <Ellipse cx={75} cy={190} rx={35} ry={6} fill={illustrationLight} opacity={0.5} />
        <Path
          d="M40 190C50 186 60 194 70 190C80 186 90 194 100 190C110 186 115 192 120 190"
          stroke={illustrationMid}
          strokeWidth={1.5}
          fill="none"
        />
      </G>

      {/* Center hexagon with gear and dollar */}
      <G>
        <Path d="M150 70L185 90V130L150 150L115 130V90L150 70Z" fill={primary} />
        <Path
          d="M150 82L175 96V124L150 138L125 124V96L150 82Z"
          fill={brandColors.white}
          opacity={0.15}
        />
        <Circle cx={150} cy={110} r={22} fill={brandColors.white} opacity={0.2} />
        {/* Gear */}
        <Path
          d="M150 92C145 92 141 94 138 97L134 95L132 99L136 102C135 105 135 108 136 111L132 114L134 118L138 116C141 119 145 121 150 121C155 121 159 119 162 116L166 118L168 114L164 111C165 108 165 105 164 102L168 99L166 95L162 97C159 94 155 92 150 92ZM150 102C154 102 157 105 157 109C157 113 154 116 150 116C146 116 143 113 143 109C143 105 146 102 150 102Z"
          fill={brandColors.white}
        />
        {/* Dollar sign */}
        <Path
          d="M150 100V118M146 104H152.5C154.5 104 156 105.2 156 107C156 108.8 154.5 110 152.5 110H147.5C145.5 110 144 111.2 144 113C144 114.8 145.5 116 147.5 116H154"
          stroke={brandColors.white}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>

      {/* Storage tanks - top right */}
      <G>
        <Ellipse cx={220} cy={48} rx={12} ry={5} fill={illustrationMid} />
        <Rect x={208} y={48} width={24} height={40} fill={illustrationMid} />
        <Ellipse cx={220} cy={88} rx={12} ry={5} fill={primary} />

        <Ellipse cx={248} cy={42} rx={12} ry={5} fill={illustrationDark} />
        <Rect x={236} y={42} width={24} height={46} fill={illustrationDark} />
        <Ellipse cx={248} cy={88} rx={12} ry={5} fill={navy} />

        <Ellipse cx={276} cy={50} rx={10} ry={4} fill={illustrationMid} />
        <Rect x={266} y={50} width={20} height={38} fill={illustrationMid} />
        <Ellipse cx={276} cy={88} rx={10} ry={4} fill={primary} />
      </G>

      {/* Refinery plant - bottom right */}
      <G>
        <Rect x={210} y={145} width={55} height={35} fill={illustrationMid} />
        <Rect x={218} y={125} width={10} height={20} fill={illustrationDark} />
        <Rect x={235} y={115} width={12} height={30} fill={primary} />
        <Rect x={252} y={130} width={8} height={15} fill={illustrationDark} />
        <Path
          d="M218 125C218 125 220 115 223 115C226 115 228 125 228 125"
          fill={illustrationLight}
        />
        <Path
          d="M235 115C235 115 238 100 241 100C244 100 247 115 247 115"
          fill={illustrationLight}
        />
        <Rect x={218} y={155} width={8} height={10} fill={brandColors.white} opacity={0.7} />
        <Rect x={232} y={155} width={8} height={10} fill={brandColors.white} opacity={0.7} />
        <Rect x={246} y={155} width={8} height={10} fill={brandColors.white} opacity={0.7} />
        <Rect x={210} y={180} width={55} height={4} fill={primary} />
      </G>
    </Svg>
  );
});
