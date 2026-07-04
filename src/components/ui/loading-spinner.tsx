import { memo, useEffect } from 'react';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { brandColors } from '@/theme/colors';

type LoadingSpinnerProps = {
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
};

export const LoadingSpinner = memo(function LoadingSpinner({
  size = 28,
  strokeWidth = 2.5,
  color = brandColors.navy,
  trackColor = brandColors.spinnerTrack,
}: LoadingSpinnerProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashLength = circumference * 0.25;

  return (
    <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${dashLength} ${circumference - dashLength}`}
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
});
