import { memo, useEffect, useRef } from 'react';

import { Animated, View } from 'react-native';

import { cn } from '@/utils/cn';

const SkeletonBlock = memo(function SkeletonBlock({
  className,
  opacity,
}: {
  className?: string;
  opacity: Animated.Value;
}) {
  return (
    <Animated.View
      className={cn('rounded-2xl bg-brand-border/70', className)}
      style={{ opacity }}
    />
  );
});

export const SettlementListSkeleton = memo(function SettlementListSkeleton() {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.85, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View className="gap-md">
      <SkeletonBlock opacity={opacity} className="h-8 w-36" />
      <SkeletonBlock opacity={opacity} className="h-44 w-full rounded-3xl" />
      <View className="flex-row gap-sm">
        <SkeletonBlock opacity={opacity} className="h-24 flex-1" />
        <SkeletonBlock opacity={opacity} className="h-24 flex-1" />
      </View>
      <SkeletonBlock opacity={opacity} className="h-12 w-full" />
      <SkeletonBlock opacity={opacity} className="h-52 w-full" />
      <SkeletonBlock opacity={opacity} className="h-52 w-full" />
    </View>
  );
});
