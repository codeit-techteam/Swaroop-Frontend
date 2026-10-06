import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import type { KycVerification } from '@/services/customer-kyc';
import { cn } from '@/utils/cn';
import { formatDate, formatDateTime } from '@/utils/date';

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

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function displayDate(value: string | null | undefined): string | null {
  if (!value) return null;
  return ISO_DATE.test(value) ? formatDate(value) : value;
}

function detailRows(verification: KycVerification): [string, string][] {
  const d = verification.details;
  const rows: [string, string | null | undefined][] =
    verification.type === 'PAN'
      ? [
          ['Name as per PAN', d.nameOnPan],
          ['Date of birth / incorporation', displayDate(d.dateOnPan)],
          ['PAN status', d.panStatus],
        ]
      : [
          ['Legal name', d.legalName],
          ['Trade name', d.tradeName],
          ['Registration status', d.gstStatus],
          ['Registered on', displayDate(d.registrationDate)],
          ['Taxpayer type', d.taxpayerType],
          ['Constitution', d.constitution],
          ['State', d.state ? (d.stateCode ? `${d.state} (${d.stateCode})` : d.state) : null],
        ];
  return rows.filter((row): row is [string, string] => Boolean(row[1]));
}

/** Who confirmed a VERIFIED result, and when. */
function verifiedByLine(verification: KycVerification): string {
  const at = verification.reviewedAt ?? verification.verifiedAt;
  const by =
    verification.method === 'MANUAL'
      ? 'Verified by the PetroTrade compliance team'
      : verification.provider === 'surepass'
        ? 'Verified via Surepass'
        : 'Verified';
  return at ? `${by} · ${formatDateTime(at)}` : by;
}

const Row = ({
  label,
  verification,
}: {
  label: string;
  verification: KycVerification | null | undefined;
}) => {
  const style = verification ? STATUS_STYLE[verification.status] : null;
  const verified = verification?.status === 'VERIFIED';
  const rows = verification && verified ? detailRows(verification) : [];
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
      {rows.map(([term, value]) => (
        <Typography key={term} variant="legal" className="mt-xs text-left text-brand-body">
          {term}: {value}
        </Typography>
      ))}
      {verification && verified ? (
        <Typography variant="legal" className="mt-xs text-left text-green-800">
          {verifiedByLine(verification)}
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
