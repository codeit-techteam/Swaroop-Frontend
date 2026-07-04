import { memo, useEffect } from 'react';

import { View } from 'react-native';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/utils/cn';

type ProductSkeletonProps = {
  className?: string;
};

const SkeletonBlock = memo(function SkeletonBlock({
  className,
  style,
}: {
  className?: string;
  style?: object;
}) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={cn('rounded-lg bg-brand-overlay', className)}
      style={[animatedStyle, style]}
    />
  );
});

export const ProductSkeleton = memo(function ProductSkeleton({ className }: ProductSkeletonProps) {
  return (
    <View className={cn('flex-1 bg-brand-background px-lg pt-md', className)}>
      <SkeletonBlock className="w-full rounded-xl" style={{ aspectRatio: 16 / 9 }} />
      <SkeletonBlock className="mt-lg h-48 w-full rounded-xl" />
      <SkeletonBlock className="mt-md h-36 w-full rounded-xl" />
      <SkeletonBlock className="mt-md h-56 w-full rounded-xl" />
    </View>
  );
});
