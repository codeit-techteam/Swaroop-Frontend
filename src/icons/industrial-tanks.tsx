import { memo } from 'react';

import Svg, { Ellipse, G, Rect } from 'react-native-svg';

import { brandColors } from '@/theme/colors';

type IndustrialTanksProps = {
  width?: number;
  height?: number;
};

export const IndustrialTanks = memo(function IndustrialTanks({
  width = 360,
  height = 160,
}: IndustrialTanksProps) {
  const fill = brandColors.illustrationMid;

  return (
    <Svg width={width} height={height} viewBox="0 0 360 160" fill="none">
      <G opacity={0.22}>
        <Ellipse cx={70} cy={40} rx={28} ry={10} fill={fill} />
        <Rect x={42} y={40} width={56} height={90} fill={fill} />
        <Ellipse cx={70} cy={130} rx={28} ry={10} fill={fill} />

        <Ellipse cx={140} cy={30} rx={32} ry={11} fill={fill} />
        <Rect x={108} y={30} width={64} height={100} fill={fill} />
        <Ellipse cx={140} cy={130} rx={32} ry={11} fill={fill} />

        <Ellipse cx={220} cy={45} rx={26} ry={9} fill={fill} />
        <Rect x={194} y={45} width={52} height={85} fill={fill} />
        <Ellipse cx={220} cy={130} rx={26} ry={9} fill={fill} />

        <Ellipse cx={290} cy={35} rx={30} ry={10} fill={fill} />
        <Rect x={260} y={35} width={60} height={95} fill={fill} />
        <Ellipse cx={290} cy={130} rx={30} ry={10} fill={fill} />
      </G>
    </Svg>
  );
});
