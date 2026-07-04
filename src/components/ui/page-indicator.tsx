import { memo, useEffect } from 'react';

import { View } from 'react-native';

import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { animationDuration } from '@/animations';
import { borderRadius } from '@/theme/border-radius';
import { brandColors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { cn } from '@/utils/cn';

type PageIndicatorProps = {
  total: number;
  activeIndex: number;
  className?: string;
};

type DotProps = {
  isActive: boolean;
};

const Dot = memo(function Dot({ isActive }: DotProps) {
  const width = useSharedValue(isActive ? 22 : 8);
  const opacity = useSharedValue(isActive ? 1 : 0.55);

  useEffect(() => {
    width.value = withTiming(isActive ? 22 : 8, { duration: animationDuration.normal });
    opacity.value = withTiming(isActive ? 1 : 0.55, { duration: animationDuration.normal });
  }, [isActive, opacity, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
    backgroundColor: isActive ? brandColors.primary : brandColors.indicatorInactive,
  }));

  return (
    <Animated.View
      style={[
        {
          height: 8,
          borderRadius: borderRadius.full,
        },
        animatedStyle,
      ]}
    />
  );
});

export const PageIndicator = memo(function PageIndicator({
  total,
  activeIndex,
  className,
}: PageIndicatorProps) {
  return (
    <View
      className={cn('flex-row items-center justify-center', className)}
      style={{ gap: spacing.sm }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total - 1, now: activeIndex }}
    >
      {Array.from({ length: total }).map((_, index) => (
        <Dot key={`dot-${index}`} isActive={index === activeIndex} />
      ))}
    </View>
  );
});
