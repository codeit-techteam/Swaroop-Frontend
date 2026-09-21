import { memo, useEffect } from 'react';

import { View } from 'react-native';

import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';

import { Typography } from '@/components/ui/typography';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type CountdownRingProps = {
  /** MM:SS */
  label: string;
  /** 0–1 remaining fraction */
  progress: number;
  size?: number;
  strokeWidth?: number;
  isUrgent?: boolean;
  isExpired?: boolean;
  caption?: string;
  className?: string;
};

export const CountdownRing = memo(function CountdownRing({
  label,
  progress,
  size = 148,
  strokeWidth = 10,
  isUrgent = false,
  isExpired = false,
  caption = 'Seller response window',
  className,
}: CountdownRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(progress);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.max(0, Math.min(1, progress)), {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
  }, [animatedProgress, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const activeColor = isExpired
    ? brandColors.error
    : isUrgent
      ? '#F59E0B'
      : brandColors.primary;

  return (
    <View className={cn('items-center', className)}>
      <View style={{ width: size, height: size }} className="items-center justify-center">
        <Svg width={size} height={size}>
          <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={brandColors.primaryLight}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={activeColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
              animatedProps={animatedProps}
            />
          </G>
        </Svg>
        <View className="absolute items-center justify-center">
          <Typography
            variant="headingLeft"
            className="text-[28px] tracking-[1px]"
            style={{ color: activeColor }}
          >
            {isExpired ? '00:00' : label}
          </Typography>
          <Typography
            variant="fieldLabel"
            className="mt-xs text-[10px] tracking-[0.8px] text-brand-muted"
          >
            {isExpired ? 'EXPIRED' : 'MINUTES LEFT'}
          </Typography>
        </View>
      </View>
      {caption ? (
        <Typography
          variant="caption"
          className="mt-md px-md text-center text-[12px] leading-[18px] normal-case text-brand-body"
        >
          {caption}
        </Typography>
      ) : null}
    </View>
  );
});
