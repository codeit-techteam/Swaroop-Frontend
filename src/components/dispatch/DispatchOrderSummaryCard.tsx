import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { DISPATCH_STARTED_COPY } from '@/constants/dispatchStarted';
import { formatCurrency } from '@/utils/currency';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type DispatchOrderSummaryCardProps = {
  product: string;
  quantityMt: number;
  grandTotal: number;
  className?: string;
};

type SummaryRowProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

const SummaryRow = memo(function SummaryRow({ label, value, highlight }: SummaryRowProps) {
  return (
    <View className="flex-row items-center justify-between py-sm">
      <Typography variant="fieldLabel" className="text-[12px] text-brand-muted">
        {label}
      </Typography>
      <Typography
        variant="roleTitle"
        className={cn(
          'text-[13px]',
          highlight ? 'text-brand-primary' : 'text-brand-heading',
        )}
      >
        {value}
      </Typography>
    </View>
  );
});

export const DispatchOrderSummaryCard = memo(function DispatchOrderSummaryCard({
  product,
  quantityMt,
  grandTotal,
  className,
}: DispatchOrderSummaryCardProps) {
  return (
    <View
      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <Typography
        variant="fieldLabel"
        className="mb-md text-[10px] tracking-[0.8px] text-brand-primary"
      >
        {DISPATCH_STARTED_COPY.orderSummaryHeading}
      </Typography>

      <SummaryRow label="Product" value={product} />
      <View className="h-px bg-brand-border" />
      <SummaryRow label="Quantity" value={`${quantityMt} MT`} />
      <View className="h-px bg-brand-border" />
      <SummaryRow
        label="Grand Total"
        value={formatCurrency(grandTotal, { maximumFractionDigits: 0 })}
        highlight
      />
      <View className="h-px bg-brand-border" />
      <SummaryRow label="Payment Method" value={DISPATCH_STARTED_COPY.paymentMethod} />
      <View className="h-px bg-brand-border" />
      <SummaryRow
        label="Payment Status"
        value={DISPATCH_STARTED_COPY.paymentStatus}
        highlight
      />
    </View>
  );
});
