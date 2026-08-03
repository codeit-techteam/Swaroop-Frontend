import { memo, useEffect, useRef } from 'react';

import { Animated, View } from 'react-native';

import { cn } from '@/utils/cn';

export const SkeletonBlock = memo(function SkeletonBlock({
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

export function useSkeletonPulse() {
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

  return opacity;
}

export const SkeletonCard = memo(function SkeletonCard({ className }: { className?: string }) {
  const opacity = useSkeletonPulse();
  return <SkeletonBlock opacity={opacity} className={cn('h-28 w-full', className)} />;
});

export const DashboardSkeleton = memo(function DashboardSkeleton() {
  const opacity = useSkeletonPulse();
  return (
    <View className="gap-md">
      <SkeletonBlock opacity={opacity} className="h-36 w-full rounded-[28px]" />
      <View className="flex-row gap-md">
        <SkeletonBlock opacity={opacity} className="h-24 flex-1" />
        <SkeletonBlock opacity={opacity} className="h-24 flex-1" />
      </View>
      <View className="flex-row gap-md">
        <SkeletonBlock opacity={opacity} className="h-24 flex-1" />
        <SkeletonBlock opacity={opacity} className="h-24 flex-1" />
      </View>
      <SkeletonBlock opacity={opacity} className="h-40 w-full" />
      <SkeletonBlock opacity={opacity} className="h-32 w-full" />
    </View>
  );
});

export const OrderCardSkeleton = memo(function OrderCardSkeleton() {
  const opacity = useSkeletonPulse();
  return (
    <View className="gap-md">
      {[1, 2, 3].map((key) => (
        <SkeletonBlock key={key} opacity={opacity} className="h-36 w-full" />
      ))}
    </View>
  );
});

export const OfferSkeleton = memo(function OfferSkeleton() {
  const opacity = useSkeletonPulse();
  return (
    <View className="gap-md">
      <SkeletonBlock opacity={opacity} className="h-10 w-full" />
      {[1, 2, 3].map((key) => (
        <SkeletonBlock key={key} opacity={opacity} className="h-44 w-full" />
      ))}
    </View>
  );
});

export const ProductSkeleton = memo(function ProductSkeleton() {
  const opacity = useSkeletonPulse();
  return (
    <View className="gap-md">
      <SkeletonBlock opacity={opacity} className="h-10 w-full" />
      <View className="flex-row flex-wrap gap-md">
        {[1, 2, 3, 4].map((key) => (
          <SkeletonBlock key={key} opacity={opacity} className="h-48 min-w-[46%] flex-1" />
        ))}
      </View>
    </View>
  );
});

export const ShipmentSkeleton = memo(function ShipmentSkeleton() {
  const opacity = useSkeletonPulse();
  return (
    <View className="gap-md">
      <SkeletonBlock opacity={opacity} className="h-10 w-full" />
      <View className="flex-row flex-wrap gap-md">
        {[1, 2, 3, 4].map((key) => (
          <SkeletonBlock key={key} opacity={opacity} className="h-20 min-w-[46%] flex-1" />
        ))}
      </View>
      {[1, 2, 3].map((key) => (
        <SkeletonBlock key={key} opacity={opacity} className="h-36 w-full" />
      ))}
    </View>
  );
});

export const InventorySkeleton = memo(function InventorySkeleton() {
  const opacity = useSkeletonPulse();
  return (
    <View className="gap-md">
      <SkeletonBlock opacity={opacity} className="h-24 w-full" />
      {[1, 2, 3, 4].map((key) => (
        <SkeletonBlock key={key} opacity={opacity} className="h-28 w-full" />
      ))}
    </View>
  );
});

export const NotificationSkeleton = memo(function NotificationSkeleton() {
  const opacity = useSkeletonPulse();
  return (
    <View className="gap-md">
      <SkeletonBlock opacity={opacity} className="h-10 w-full" />
      <SkeletonBlock opacity={opacity} className="h-36 w-full" />
      <SkeletonBlock opacity={opacity} className="h-36 w-full" />
      <SkeletonBlock opacity={opacity} className="h-64 w-full" />
    </View>
  );
});

export const AnalyticsSkeletonCard = memo(function AnalyticsSkeletonCard() {
  const opacity = useSkeletonPulse();
  return (
    <View className="gap-md">
      <View className="flex-row flex-wrap gap-md">
        {[1, 2, 3, 4].map((key) => (
          <SkeletonBlock key={key} opacity={opacity} className="h-24 min-w-[46%] flex-1" />
        ))}
      </View>
      <SkeletonBlock opacity={opacity} className="h-56 w-full" />
      <SkeletonBlock opacity={opacity} className="h-40 w-full" />
    </View>
  );
});

export const DocumentSkeleton = memo(function DocumentSkeleton() {
  const opacity = useSkeletonPulse();
  return (
    <View className="gap-md">
      <SkeletonBlock opacity={opacity} className="h-10 w-full" />
      <SkeletonBlock opacity={opacity} className="h-10 w-full" />
      {[1, 2, 3, 4, 5].map((key) => (
        <SkeletonBlock key={key} opacity={opacity} className="h-24 w-full" />
      ))}
    </View>
  );
});

export const ListFooterLoader = memo(function ListFooterLoader() {
  const opacity = useSkeletonPulse();
  return (
    <View className="py-lg">
      <SkeletonBlock opacity={opacity} className="mx-auto h-8 w-32" />
    </View>
  );
});
