import { memo, useEffect, type ReactNode } from 'react';

import { View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/utils/cn';

type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Shared pulse block for layout-preserving loading states.
 * Drive visibility from real request/hydrate flags — never artificial delays.
 */
export const Skeleton = memo(function Skeleton({
  width,
  height,
  radius = 12,
  className,
  style,
}: SkeletonProps) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      className={cn('bg-brand-overlay', className)}
      style={[
        {
          width: width ?? '100%',
          height: height ?? 16,
          borderRadius: radius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
});

export const SkeletonText = memo(function SkeletonText({
  lines = 1,
  lastLineWidth = '60%',
  lineHeight = 14,
  gap = 8,
  className,
}: {
  lines?: number;
  lastLineWidth?: DimensionValue;
  lineHeight?: number;
  gap?: number;
  className?: string;
}) {
  return (
    <View className={cn('w-full', className)} style={{ gap }} accessible={false}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
          radius={6}
        />
      ))}
    </View>
  );
});

export const SkeletonCircle = memo(function SkeletonCircle({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return <Skeleton width={size} height={size} radius={size / 2} className={className} />;
});

export const SkeletonAvatar = memo(function SkeletonAvatar({
  size = 44,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return <SkeletonCircle size={size} className={className} />;
});

export const SkeletonButton = memo(function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton height={48} radius={14} className={cn('w-full', className)} />;
});

export const SkeletonCard = memo(function SkeletonCard({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <View
      accessible={false}
      className={cn('rounded-2xl border border-brand-border/60 bg-brand-white p-md', className)}
    >
      {children ?? (
        <>
          <Skeleton height={18} width="55%" radius={6} />
          <SkeletonText lines={2} className="mt-md" />
          <Skeleton height={36} className="mt-md" radius={10} />
        </>
      )}
    </View>
  );
});

export const SkeletonRow = memo(function SkeletonRow({ className }: { className?: string }) {
  return (
    <View
      accessible={false}
      className={cn(
        'flex-row items-center rounded-2xl border border-brand-border/50 bg-brand-white p-md',
        className,
      )}
      style={{ gap: 12 }}
    >
      <SkeletonCircle size={44} />
      <View className="flex-1" style={{ gap: 8 }}>
        <Skeleton height={14} width="70%" radius={6} />
        <Skeleton height={12} width="45%" radius={6} />
      </View>
      <Skeleton height={28} width={64} radius={8} />
    </View>
  );
});

export const SkeletonProductCard = memo(function SkeletonProductCard({
  className,
}: {
  className?: string;
}) {
  return (
    <View
      accessible={false}
      className={cn(
        'overflow-hidden rounded-2xl border border-brand-border/50 bg-brand-white p-md',
        className,
      )}
      style={{ gap: 10 }}
    >
      <Skeleton height={18} width={56} radius={6} />
      <Skeleton height={14} width="75%" radius={6} />
      <Skeleton height={12} width="45%" radius={6} />
      <Skeleton height={18} width="40%" radius={6} />
      <SkeletonButton />
    </View>
  );
});

export const SkeletonTrendingCard = memo(function SkeletonTrendingCard({
  className,
}: {
  className?: string;
}) {
  return (
    <View
      accessible={false}
      className={cn(
        'w-[168px] rounded-xl border border-brand-border/50 bg-brand-white p-md',
        className,
      )}
    >
      <Skeleton height={44} width={44} radius={8} />
      <Skeleton height={14} width="85%" radius={6} className="mt-sm" />
      <Skeleton height={12} width="55%" radius={6} className="mt-xs" />
      <Skeleton height={14} width="45%" radius={6} className="mt-xs" />
    </View>
  );
});

export const SkeletonBanner = memo(function SkeletonBanner({ className }: { className?: string }) {
  return <Skeleton height={160} radius={24} className={cn('w-full', className)} />;
});

export const HomeFeedSkeleton = memo(function HomeFeedSkeleton() {
  return (
    <View className="px-lg" style={{ gap: 16 }} accessible={false}>
      <View className="flex-row items-center justify-between">
        <View style={{ gap: 8, flex: 1 }}>
          <Skeleton height={16} width="40%" radius={6} />
          <Skeleton height={22} width="65%" radius={6} />
        </View>
        <SkeletonCircle size={40} />
      </View>
      <SkeletonBanner />
      <Skeleton height={48} radius={14} />
      <View className="flex-row" style={{ gap: 10 }}>
        <Skeleton height={72} className="flex-1" radius={16} />
        <Skeleton height={72} className="flex-1" radius={16} />
        <Skeleton height={72} className="flex-1" radius={16} />
      </View>
      <Skeleton height={18} width="45%" radius={6} />
      <View className="flex-row" style={{ gap: 12 }}>
        <SkeletonTrendingCard />
        <SkeletonTrendingCard />
      </View>
      <Skeleton height={18} width="40%" radius={6} />
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonCard>
        <Skeleton height={16} width="50%" radius={6} />
        <SkeletonText lines={2} className="mt-md" />
        <SkeletonButton className="mt-md" />
      </SkeletonCard>
    </View>
  );
});

export const MarketListSkeleton = memo(function MarketListSkeleton() {
  return (
    <View className="flex-1 px-lg pt-md" style={{ gap: 14 }} accessible={false}>
      <Skeleton height={44} radius={14} />
      <View className="flex-row" style={{ gap: 8 }}>
        {[1, 2, 3, 4].map((key) => (
          <Skeleton key={key} height={36} width={78} radius={999} />
        ))}
      </View>
      <Skeleton height={16} width="35%" radius={6} />
      {[1, 2, 3, 4].map((key) => (
        <SkeletonProductCard key={key} />
      ))}
    </View>
  );
});

export const OrdersListSkeleton = memo(function OrdersListSkeleton() {
  return (
    <View className="px-lg pt-md" style={{ gap: 12 }} accessible={false}>
      <Skeleton height={44} radius={14} />
      {[1, 2, 3, 4].map((key) => (
        <SkeletonCard key={key}>
          <View className="flex-row items-center justify-between">
            <Skeleton height={14} width="40%" radius={6} />
            <Skeleton height={22} width={72} radius={999} />
          </View>
          <SkeletonText lines={2} className="mt-md" />
          <View className="mt-md flex-row" style={{ gap: 8 }}>
            <Skeleton height={28} className="flex-1" radius={8} />
            <Skeleton height={28} className="flex-1" radius={8} />
          </View>
        </SkeletonCard>
      ))}
    </View>
  );
});

export const ProfileSkeleton = memo(function ProfileSkeleton() {
  return (
    <View className="px-lg pt-md" style={{ gap: 16 }} accessible={false}>
      <View className="items-center" style={{ gap: 12 }}>
        <SkeletonAvatar size={72} />
        <Skeleton height={18} width="45%" radius={6} />
        <Skeleton height={12} width="30%" radius={6} />
      </View>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonRow />
      <SkeletonRow />
    </View>
  );
});
