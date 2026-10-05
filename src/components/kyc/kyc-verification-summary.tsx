import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import type { KycVerification } from '@/services/customer-kyc';
import { cn } from '@/utils/cn';

type Props = {
  pan: KycVerification | null | undefined;
  gst: KycVerification | null | undefined;
  /** Shown under the rows, e.g. a PAN / GSTIN mismatch returned by the backend. */
  warning?: string | null;
  className?: string;
};

const STATUS_STYLE: Record<KycVerification['status'], { label: string; className: string }> = {
  VERIFIED: { label: 'Verified', className: 'bg-brand-success-light text-green-800' },
  MANUAL_REVIEW: { label: 'Manual review', className: 'bg-brand-primary-tint text-brand-heading' },
  VERIFYING: { label: 'Verifying', className: 'bg-brand-primary-tint text-brand-heading' },
  FAILED: { label: 'Not verified', className: 'bg-brand-error-light text-red-800' },
};

function detailLine(verification: KycVerification): string | null {
  const d = verification.details;
  if (verification.type === 'PAN') return d.nameOnPan ?? null;
  const state = d.state ? (d.stateCode ? `${d.state} (${d.stateCode})` : d.state) : null;
  return (
    [d.legalName, d.gstStatus ? `GST ${d.gstStatus}` : null, state].filter(Boolean).join(' · ') ||
    null
  );
}

const Row = ({
  label,
  verification,
}: {
  label: string;
  verification: KycVerification | null | undefined;
}) => {
  const style = verification ? STATUS_STYLE[verification.status] : null;
  const detail = verification ? detailLine(verification) : null;
  return (
    <View className="py-sm">
      <View className="flex-row items-center justify-between gap-sm">
        <Typography variant="fieldLabel" className="flex-1 text-left">
          {label}
          {verification ? `  ${verification.identifierMasked}` : ''}
        </Typography>
        <Typography
          variant="legal"
          className={cn(
            'rounded-full px-sm py-[2px] text-[11px]',
            style?.className ?? 'bg-brand-surface text-brand-label',
          )}
        >
          {style?.label ?? 'Not verified yet'}
        </Typography>
      </View>
      {detail && verification?.status === 'VERIFIED' ? (
        <Typography variant="legal" className="mt-xs text-left text-brand-body">
          {detail}
        </Typography>
      ) : null}
      {verification && verification.status !== 'VERIFIED' ? (
        <Typography
          variant="legal"
          className={cn(
            'mt-xs text-left',
            verification.status === 'FAILED' ? 'text-brand-error' : 'text-brand-body',
          )}
        >
          {verification.message}
        </Typography>
      ) : null}
    </View>
  );
};

/** PAN and GSTIN verification results as recorded by the backend. */
export const KycVerificationSummary = memo(function KycVerificationSummary({
  pan,
  gst,
  warning,
  className,
}: Props) {
  return (
    <View
      className={cn('rounded-lg border border-brand-border bg-brand-white px-lg py-sm', className)}
    >
      <Row label="PAN" verification={pan} />
      <View className="h-px bg-brand-border" />
      <Row label="GSTIN" verification={gst} />
      {warning ? (
        <Typography variant="legal" className="pb-sm text-left text-amber-800">
          {warning}
        </Typography>
      ) : null}
    </View>
  );
});
