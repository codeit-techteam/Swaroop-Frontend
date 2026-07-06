import { memo } from 'react';

import Svg, { Circle } from 'react-native-svg';

type MoreVerticalIconProps = {
  size?: number;
  color?: string;
};

export const MoreVerticalIcon = memo(function MoreVerticalIcon({
  size = 20,
  color = '#6B7280',
}: MoreVerticalIconProps) {
  const center = size / 2;
  const dotRadius = 1.5;
  const spacing = 4;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={center} cy={center - spacing} r={dotRadius} fill={color} />
      <Circle cx={center} cy={center} r={dotRadius} fill={color} />
      <Circle cx={center} cy={center + spacing} r={dotRadius} fill={color} />
    </Svg>
  );
});
