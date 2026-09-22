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
  const dark = brandColors.illustrationDark;

  return (
    <Svg width={width} height={height} viewBox="0 0 360 160" fill="none">
      <Ellipse cx={180} cy={142} rx={150} ry={14} fill={fill} opacity={0.12} />

      <G opacity={0.2}>
        <Ellipse cx={70} cy={42} rx={28} ry={10} fill={fill} />
        <Rect x={42} y={42} width={56} height={88} fill={fill} />
        <Ellipse cx={70} cy={130} rx={28} ry={10} fill={fill} />
        <Rect x={66} y={28} width={8} height={16} rx={2} fill={fill} />

        <Ellipse cx={140} cy={32} rx={32} ry={11} fill={dark} />
        <Rect x={108} y={32} width={64} height={98} fill={dark} />
        <Ellipse cx={140} cy={130} rx={32} ry={11} fill={dark} />
        <Rect x={136} y={16} width={8} height={18} rx={2} fill={dark} />

        <Ellipse cx={220} cy={48} rx={26} ry={9} fill={fill} />
        <Rect x={194} y={48} width={52} height={82} fill={fill} />
        <Ellipse cx={220} cy={130} rx={26} ry={9} fill={fill} />

        <Ellipse cx={290} cy={36} rx={30} ry={10} fill={fill} />
        <Rect x={260} y={36} width={60} height={94} fill={fill} />
        <Ellipse cx={290} cy={130} rx={30} ry={10} fill={fill} />
        <Rect x={286} y={22} width={8} height={16} rx={2} fill={fill} />
      </G>
    </Svg>
  );
});
