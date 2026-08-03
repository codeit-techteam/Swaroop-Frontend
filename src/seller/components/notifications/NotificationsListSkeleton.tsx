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

export const NotificationsListSkeleton = memo(function NotificationsListSkeleton() {
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
      <SkeletonBlock opacity={opacity} className="h-10 w-full" />
      <SkeletonBlock opacity={opacity} className="h-36 w-full" />
      <SkeletonBlock opacity={opacity} className="h-36 w-full" />
      <SkeletonBlock opacity={opacity} className="h-64 w-full" />
    </View>
  );
});
