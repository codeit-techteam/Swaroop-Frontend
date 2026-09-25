import { memo } from 'react';

import { View } from 'react-native';

import { StatusBadge } from '@/components/ui/status-badge';
import { Typography } from '@/components/ui/typography';
import type { CreditAccount } from '@/types/customer-credit';
import { creditStatusLabel, creditStatusVariant } from '@/types/customer-credit';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/cn';

type CreditSummaryCardProps = {
  /** Display status resolved by the backend — never inferred on the client. */
  status: string;
  approvedLimit: string;
  availableLimit: string;
  utilizedAmount: string;
  outstandingAmount: string;
  account?: CreditAccount | null;
  className?: string;
};

const toAmount = (value: string | null | undefined): string =>
  formatCurrency(Number(value ?? 0), { minimumFractionDigits: 0, maximumFractionDigits: 0 });

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View className="min-w-[45%] flex-1">
      <Typography variant="fieldLabel" className="text-brand-muted">
        {label}
      </Typography>
      <Typography
        variant="roleTitle"
        className={cn('mt-xs text-[18px]', accent && 'text-brand-primary')}
      >
        {value}
      </Typography>
    </View>
  );
}

export const CreditSummaryCard = memo(function CreditSummaryCard({
  status,
  approvedLimit,
  availableLimit,
  utilizedAmount,
  outstandingAmount,
  account,
  className,
}: CreditSummaryCardProps) {
  const paymentTerms = account?.creditTermDays
    ? `Net-${account.creditTermDays} days`
    : 'Set on approval';

  return (
    <View
      className={cn(
        'rounded-2xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <View className="flex-row items-start justify-between gap-sm">
        <View className="flex-1">
          <Typography variant="fieldLabel" className="text-brand-muted">
            Trading Credit
          </Typography>
          <Typography variant="headingLeft" className="mt-xs text-[20px]">
            {toAmount(approvedLimit)}
          </Typography>
          <Typography variant="legal" className="mt-xs text-left text-brand-body">
            Approved limit
          </Typography>
        </View>
        <StatusBadge label={creditStatusLabel(status)} variant={creditStatusVariant(status)} />
      </View>

      <View className="mt-lg flex-row flex-wrap gap-lg border-t border-brand-border pt-lg">
        <Metric label="Available" value={toAmount(availableLimit)} accent />
        <Metric label="Used" value={toAmount(utilizedAmount)} />
        <Metric label="Outstanding" value={toAmount(outstandingAmount)} />
        <Metric label="Payment Terms" value={paymentTerms} />
      </View>

      {account?.accountNumber ? (
        <Typography variant="legal" className="mt-lg text-left text-brand-muted">
          Account {account.accountNumber}
        </Typography>
      ) : null}
    </View>
  );
});
