import { memo, useEffect } from 'react';

import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { VERIFICATION_BADGE_LABELS } from '@/constants/verificationStatus';
import type { VerificationBadgeStatus } from '@/types/paymentVerification';
import { cn } from '@/utils/cn';

type VerificationStatusBadgeProps = {
  status: VerificationBadgeStatus;
  className?: string;
};

const containerClasses: Record<VerificationBadgeStatus, string> = {
  pending_verification: 'bg-[#FFF4E5]',
  verified: 'bg-brand-success-light',
  rejected: 'bg-brand-error-light',
  needs_review: 'bg-[#FEF3C7]',
};

const textClasses: Record<VerificationBadgeStatus, string> = {
  pending_verification: 'text-[#E67E22]',
  verified: 'text-brand-success',
  rejected: 'text-brand-error',
  needs_review: 'text-[#D97706]',
};

export const VerificationStatusBadge = memo(function VerificationStatusBadge({
  status,
  className,
}: VerificationStatusBadgeProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 280 });
  }, [opacity, status]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={cn('rounded-md px-sm py-xs', containerClasses[status], className)}
    >
      <Typography
        variant="badge"
        className={cn('text-[10px] tracking-[0.5px]', textClasses[status])}
      >
        {VERIFICATION_BADGE_LABELS[status].toUpperCase()}
      </Typography>
    </Animated.View>
  );
});
