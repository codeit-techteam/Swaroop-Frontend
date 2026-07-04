import { memo, useEffect } from 'react';

import { View } from 'react-native';

import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { animationDuration } from '@/animations';
import { borderRadius } from '@/theme/border-radius';
import { brandColors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { cn } from '@/utils/cn';

type BannerIndicatorProps = {
  total: number;
  activeIndex: number;
  className?: string;
};

type DotProps = {
  isActive: boolean;
};

const Dot = memo(function Dot({ isActive }: DotProps) {
  const width = useSharedValue(isActive ? 18 : 6);
  const opacity = useSharedValue(isActive ? 1 : 0.45);

  useEffect(() => {
    width.value = withTiming(isActive ? 18 : 6, { duration: animationDuration.normal });
    opacity.value = withTiming(isActive ? 1 : 0.45, { duration: animationDuration.normal });
  }, [isActive, opacity, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
    backgroundColor: isActive ? brandColors.white : 'rgba(255,255,255,0.45)',
  }));

  return (
    <Animated.View
      className="h-1.5"
      style={[
        {
          borderRadius: borderRadius.full,
        },
        animatedStyle,
      ]}
    />
  );
});

export const BannerIndicator = memo(function BannerIndicator({
  total,
  activeIndex,
  className,
}: BannerIndicatorProps) {
  return (
    <View
      className={cn('flex-row items-center', className)}
      style={{ gap: spacing.xs }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total - 1, now: activeIndex }}
    >
      {Array.from({ length: total }).map((_, index) => (
        <Dot key={`banner-dot-${index}`} isActive={index === activeIndex} />
      ))}
    </View>
  );
});
