import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { useSellerStore } from '@/seller/store/sellerStore';
import type { SellerOnboardingStatus } from '@/services/seller-onboarding';
import { cn } from '@/utils/cn';

type Tone = 'warning' | 'danger' | 'info' | 'success';

const TONE_CLASSES: Record<Tone, { box: string; title: string; button: string }> = {
  warning: {
    box: 'border-amber-300 bg-amber-50',
    title: 'text-amber-900',
    button: 'bg-amber-600',
  },
  danger: {
    box: 'border-red-300 bg-brand-error-light',
    title: 'text-red-900',
    button: 'bg-brand-error',
  },
  info: {
    box: 'border-brand-primary bg-brand-primary-tint',
    title: 'text-brand-heading',
    button: 'bg-brand-navy',
  },
  success: {
    box: 'border-green-300 bg-brand-success-light',
    title: 'text-green-900',
    button: 'bg-brand-success',
  },
};

type Props = {
  status: SellerOnboardingStatus | null;
  /** Also render the neutral "under review" and "approved" states. */
  showReviewStates?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const SellerVerificationStatusBanner = memo(function SellerVerificationStatusBanner({
  status,
  showReviewStates = false,
  actionLabel,
  onAction,
  className,
}: Props) {
  const documents = useSellerStore((state) => state.documents);
  if (!status) return null;

  const changeRequest = status.changeRequest;
  const rejected = status.status === 'REJECTED';
  const underReview = status.status === 'SUBMITTED' || status.status === 'UNDER_REVIEW';
  const approved = status.status === 'APPROVED';

  let tone: Tone;
  let title: string;
  let message: string | null;
  let meta: string | null = null;

  if (changeRequest) {
    tone = 'warning';
    title = 'PetroTrade requested changes';
    message = changeRequest.reason;
    const labels = changeRequest.slots
      .map((slot) => documents.find((doc) => doc.id === slot)?.title ?? slot)
      .filter(Boolean);
    const requestedOn = formatDate(changeRequest.requestedAt);
    meta = [
      labels.length ? `Re-upload: ${labels.join(', ')}` : null,
      requestedOn ? `Requested ${requestedOn}` : null,
    ]
      .filter(Boolean)
      .join(' · ');
  } else if (rejected) {
    tone = 'danger';
    title = 'Seller application rejected';
    message = status.rejectedReason ?? 'Review the details below, fix them and resubmit.';
  } else if (showReviewStates && underReview) {
    tone = 'info';
    title = 'Verification in progress';
    message = 'Our compliance team is reviewing your documents. We will notify you once done.';
  } else if (showReviewStates && approved) {
    tone = 'success';
    title = 'Seller account approved';
    message = 'Your documents are verified. Inventory, offers and payouts are live.';
  } else {
    return null;
  }

  const classes = TONE_CLASSES[tone];
  const showAction = Boolean(onAction && actionLabel && (changeRequest || rejected));

  return (
    <View
      accessibilityRole="alert"
      className={cn('rounded-2xl border p-lg', classes.box, className)}
    >
      <Typography variant="roleTitle" className={cn('text-left', classes.title)}>
        {title}
      </Typography>
      {message ? (
        <Typography variant="legal" className="mt-xs text-left text-brand-body">
          {message}
        </Typography>
      ) : null}
      {meta ? (
        <Typography variant="legal" className="mt-xs text-left text-brand-label">
          {meta}
        </Typography>
      ) : null}
      {showAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          className={cn('mt-md self-start rounded-xl px-md py-sm', classes.button)}
        >
          <Typography variant="button" className="text-[12px]">
            {actionLabel}
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
});
