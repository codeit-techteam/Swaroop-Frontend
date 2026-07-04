import { memo } from 'react';

import Svg, { Circle, Rect } from 'react-native-svg';

type IndiaFlagIconProps = {
  width?: number;
  height?: number;
};

export const IndiaFlagIcon = memo(function IndiaFlagIcon({
  width = 22,
  height = 15,
}: IndiaFlagIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 22 15" fill="none">
      <Rect width={22} height={5} fill="#FF9933" />
      <Rect y={5} width={22} height={5} fill="#FFFFFF" />
      <Rect y={10} width={22} height={5} fill="#138808" />
      <Circle cx={11} cy={7.5} r={2} stroke="#000080" strokeWidth={0.8} fill="none" />
      <Circle cx={11} cy={7.5} r={0.5} fill="#000080" />
    </Svg>
  );
});
