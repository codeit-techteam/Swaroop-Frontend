import { memo } from 'react';

import { View } from 'react-native';

import { Skeleton, SkeletonCard, SkeletonRow } from '@/components/ui/skeleton';

export const NotificationsSkeleton = memo(function NotificationsSkeleton() {
  return (
    <View style={{ gap: 12 }} accessible={false}>
      <View className="flex-row" style={{ gap: 8 }}>
        {[1, 2, 3, 4].map((key) => (
          <Skeleton key={key} height={36} width={78} radius={999} />
        ))}
      </View>
      <Skeleton height={16} width="30%" radius={6} />
      {[1, 2, 3].map((key) => (
        <SkeletonCard key={key}>
          <SkeletonRow />
        </SkeletonCard>
      ))}
    </View>
  );
});
