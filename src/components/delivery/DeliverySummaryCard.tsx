import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { DELIVERY_COMPLETED_COPY } from '@/constants/deliveryCompleted';
import type { DeliverySummary } from '@/types/delivery';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type DeliverySummaryCardProps = {
  summary: DeliverySummary;
  className?: string;
};

type DetailFieldProps = {
  label: string;
  value: string;
};

const DetailField = memo(function DetailField({ label, value }: DetailFieldProps) {
  return (
    <View className="min-w-[45%] flex-1">
      <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
        {label}
      </Typography>
      <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
        {value}
      </Typography>
    </View>
  );
});

export const DeliverySummaryCard = memo(function DeliverySummaryCard({
  summary,
  className,
}: DeliverySummaryCardProps) {
  return (
    <View
      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
        {DELIVERY_COMPLETED_COPY.summaryHeading}
      </Typography>

      <View className="mt-lg flex-row flex-wrap" style={{ gap: 16 }}>
        <DetailField label="Product" value={summary.product} />
        <DetailField label="Quantity" value={`${summary.quantityMt} MT`} />
        <DetailField label="Gross Weight" value={`${summary.grossWeightMt} MT`} />
        <DetailField label="Net Weight" value={`${summary.netWeightMt.toFixed(2)} MT`} />
        <DetailField label="Delivery Condition" value={summary.deliveryCondition} />
      </View>

      <Typography variant="subheadingLeft" className="mt-md text-[13px] text-brand-success">
        {DELIVERY_COMPLETED_COPY.noDamageLabel}
      </Typography>
    </View>
  );
});
