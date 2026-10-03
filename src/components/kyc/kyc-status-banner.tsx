import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import type { CustomerKycOverview } from '@/services/customer-kyc';
import { cn } from '@/utils/cn';

type Props = {
  overview: CustomerKycOverview | null;
  /** Also render the neutral "under review" and "approved" states. */
  showReviewStates?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

const SLOT_LABELS: Record<string, string> = {
  pan: 'PAN Card',
  gst: 'GST Certificate',
  aadhaar: 'Aadhaar Card',
  cancelledCheque: 'Cancelled Cheque',
};

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const KycStatusBanner = memo(function KycStatusBanner({
  overview,
  showReviewStates = false,
  actionLabel,
  onAction,
  className,
}: Props) {
  if (!overview) return null;

  let box: string;
  let titleClass: string;
  let buttonClass = 'bg-brand-navy';
  let title: string;
  let message: string | null;
  let meta: string | null = null;
  const needsAction = overview.status === 'CHANGES_REQUESTED' || overview.status === 'REJECTED';

  if (overview.status === 'CHANGES_REQUESTED') {
    box = 'border-amber-300 bg-amber-50';
    titleClass = 'text-amber-900';
    buttonClass = 'bg-amber-600';
    title = 'PetroTrade requested changes';
    message = overview.changeRequest?.reason ?? overview.reviewNotes;
    const labels = (overview.changeRequest?.slots ?? []).map((slot) => SLOT_LABELS[slot] ?? slot);
    const requestedOn = formatDate(overview.changeRequest?.requestedAt);
    meta =
      [
        labels.length ? `Re-upload: ${labels.join(', ')}` : null,
        requestedOn ? `Requested ${requestedOn}` : null,
      ]
        .filter(Boolean)
        .join(' · ') || null;
  } else if (overview.status === 'REJECTED') {
    box = 'border-red-300 bg-brand-error-light';
    titleClass = 'text-red-900';
    buttonClass = 'bg-brand-error';
    title = 'KYC needs correction';
    message = overview.rejectedReason
      ? `Reason: ${overview.rejectedReason}`
      : 'Fix the highlighted details and resubmit.';
  } else if (showReviewStates && overview.status === 'SUBMITTED') {
    box = 'border-brand-primary bg-brand-primary-tint';
    titleClass = 'text-brand-heading';
    title = 'Your KYC is under review';
    message = 'Our compliance team is reviewing your details. We will notify you once done.';
  } else if (showReviewStates && overview.kycVerified) {
    box = 'border-green-300 bg-brand-success-light';
    titleClass = 'text-green-900';
    title = 'KYC verified';
    message = 'Your business documents have been verified by PetroTrade.';
  } else {
    return null;
  }

  return (
    <View accessibilityRole="alert" className={cn('rounded-lg border p-lg', box, className)}>
      <Typography variant="roleTitle" className={cn('text-left', titleClass)}>
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
      {needsAction && onAction && actionLabel ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          className={cn('mt-md self-start rounded-md px-md py-sm', buttonClass)}
        >
          <Typography variant="button" className="text-[12px]">
            {actionLabel}
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
});
