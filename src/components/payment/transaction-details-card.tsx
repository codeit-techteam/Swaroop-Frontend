import { memo } from 'react';

import { View } from 'react-native';

import { VerificationStatusBadge } from '@/components/payment/verification-status-badge';
import { Typography } from '@/components/ui/typography';
import { formatPaymentCurrency } from '@/constants/payment';
import { VERIFICATION_SCREEN_COPY } from '@/constants/verificationStatus';
import { elevation } from '@/theme/shadows';
import type { PaymentProof } from '@/types/order';
import type { VerificationBadgeStatus } from '@/types/paymentVerification';
import { cn } from '@/utils/cn';
import { formatDate, formatDateTime, isToday } from '@/utils/date';

type TransactionDetailsCardProps = {
  paymentProof: PaymentProof;
  badgeStatus: VerificationBadgeStatus;
  className?: string;
};

type DetailRowProps = {
  label: string;
  value: string;
};

const DetailRow = memo(function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View className="flex-row items-center justify-between py-sm">
      <Typography variant="roleDescription" className="text-[13px] text-brand-muted">
        {label}
      </Typography>
      <Typography
        variant="roleTitle"
        className="max-w-[58%] text-right text-[13px] text-brand-heading"
        numberOfLines={2}
      >
        {value}
      </Typography>
    </View>
  );
});

const formatSubmittedTime = (submittedAt: string): string => {
  const time = formatDateTime(submittedAt, 'hh:mm A');
  const dateLabel = isToday(submittedAt) ? 'Today' : formatDate(submittedAt, 'DD MMM YYYY');
  return `${time}, ${dateLabel}`;
};

const formatTransactionDate = (transactionDate: string): string =>
  formatDate(transactionDate, 'DD MMM YYYY');

export const TransactionDetailsCard = memo(function TransactionDetailsCard({
  paymentProof,
  badgeStatus,
  className,
}: TransactionDetailsCardProps) {
  return (
    <View
      className={cn(
        'overflow-hidden rounded-2xl border border-brand-border bg-brand-white',
        className,
      )}
      style={elevation.sm}
    >
      <View className="flex-row items-center justify-between border-b border-brand-border bg-brand-surface px-lg py-md">
        <Typography variant="fieldLabel" className="text-[10px] tracking-[0.8px] text-brand-muted">
          {VERIFICATION_SCREEN_COPY.transactionHeading.toUpperCase()}
        </Typography>
        <VerificationStatusBadge status={badgeStatus} />
      </View>

      <View className="px-lg py-sm">
        <DetailRow label="Transaction ID" value={paymentProof.transactionId} />
        <View className="border-t border-brand-border" />
        <DetailRow label="Amount" value={formatPaymentCurrency(paymentProof.amount)} />
        <View className="border-t border-brand-border" />
        <DetailRow label="Bank" value={paymentProof.bank} />
        <View className="border-t border-brand-border" />
        <DetailRow label="Payment Mode" value={paymentProof.paymentMode} />
        <View className="border-t border-brand-border" />
        <DetailRow label="Submitted Time" value={formatSubmittedTime(paymentProof.submittedAt)} />
        <View className="border-t border-brand-border" />
        <DetailRow
          label="Transaction Date"
          value={formatTransactionDate(paymentProof.transactionDate)}
        />
      </View>
    </View>
  );
});
