import { memo, useCallback } from 'react';

import { View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { AppHeader } from '@/components';
import { EmptyState as MarketEmptyState } from '@/components/market';
import { MarketListSkeleton } from '@/components/ui/skeleton';
import { safeGoBack } from '@/navigation/safe-back';
import { SellerHeader } from '@/seller/components/SellerHeader';
import { EmptyState as SellerEmptyState } from '@/seller/components/utility/EmptyState';
import { SkeletonBlock, useSkeletonPulse } from '@/seller/components/utility/Skeletons';
import type { GradeRequestRole } from '@/services/grade-requests';

type HeaderProps = {
  role: GradeRequestRole;
  title: string;
  onBack?: () => void;
  fallbackHref?: Href;
};

/** Role-appropriate back header (customer `AppHeader`, seller `SellerHeader`). */
export const GradeRequestHeader = memo(function GradeRequestHeader({
  role,
  title,
  onBack,
  fallbackHref,
}: HeaderProps) {
  const router = useRouter();
  const handleBack = useCallback(() => {
    if (onBack) onBack();
    else if (fallbackHref) safeGoBack(router, fallbackHref);
    else router.back();
  }, [fallbackHref, onBack, router]);

  if (role === 'seller') {
    return <SellerHeader title={title} showBack onBack={handleBack} />;
  }
  return <AppHeader variant="back" title={title} onBack={onBack} fallbackHref={fallbackHref} />;
});

type StateProps = {
  role: GradeRequestRole;
  kind: 'empty' | 'error';
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

/** Empty / error card using the role's own design system. */
export const GradeRequestStateCard = memo(function GradeRequestStateCard({
  role,
  kind,
  title,
  description,
  actionLabel,
  onActionPress,
}: StateProps) {
  if (role === 'seller') {
    return (
      <SellerEmptyState
        className="mx-lg mt-lg"
        variant={kind === 'empty' ? 'no_purchase_requests' : 'no_search_results'}
        title={title}
        description={description}
        ctaLabel={actionLabel}
        onCtaPress={onActionPress}
      />
    );
  }
  return (
    <MarketEmptyState
      title={title}
      description={description}
      actionLabel={actionLabel}
      onActionPress={onActionPress}
    />
  );
});

const SellerListSkeleton = memo(function SellerListSkeleton() {
  const opacity = useSkeletonPulse();
  return (
    <View className="gap-md px-lg pt-md">
      {[1, 2, 3, 4].map((key) => (
        <SkeletonBlock key={key} opacity={opacity} className="h-28 w-full" />
      ))}
    </View>
  );
});

export const GradeRequestListSkeleton = memo(function GradeRequestListSkeleton({
  role,
}: {
  role: GradeRequestRole;
}) {
  return role === 'seller' ? <SellerListSkeleton /> : <MarketListSkeleton />;
});
