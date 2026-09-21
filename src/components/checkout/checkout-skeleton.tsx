import { memo, useEffect } from 'react';

import { View } from 'react-native';

import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/utils/cn';

const SkeletonBlock = memo(function SkeletonBlock({
  className,
  opacity,
}: {
  className?: string;
  opacity: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View className={cn('rounded-xl bg-brand-overlay', className)} style={animatedStyle} />
  );
});

export const CheckoutSkeleton = memo(function CheckoutSkeleton({
  className,
}: {
  className?: string;
}) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  return (
    <View className={cn('flex-1 px-lg pt-md', className)} style={{ gap: 16 }}>
      <SkeletonBlock opacity={opacity} className="h-28 w-full rounded-2xl" />
      <SkeletonBlock opacity={opacity} className="h-36 w-full rounded-2xl" />
      <SkeletonBlock opacity={opacity} className="h-52 w-full rounded-2xl" />
      <SkeletonBlock opacity={opacity} className="h-24 w-full rounded-2xl" />
    </View>
  );
});
