import { memo } from 'react';

import { View } from 'react-native';

import { PrimaryButton, Typography } from '@/components/ui';
import { formatOrderNumber } from '@/constants/orderStatus';
import type { Order } from '@/types/order';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type ShipmentSummaryCardProps = {
  order: Order;
  onExpand: (order: Order) => void;
  className?: string;
};

type SummaryFieldProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

const SummaryField = memo(function SummaryField({
  label,
  value,
  valueClassName,
}: SummaryFieldProps) {
  return (
    <View className="flex-1">
      <Typography variant="fieldLabel" className="text-[10px] tracking-[0.8px] text-brand-muted">
        {label}
      </Typography>
      <Typography
        variant="roleTitle"
        className={cn('mt-xs text-[14px] text-brand-heading', valueClassName)}
        numberOfLines={2}
      >
        {value}
      </Typography>
    </View>
  );
});

export const ShipmentSummaryCard = memo(function ShipmentSummaryCard({
  order,
  onExpand,
  className,
}: ShipmentSummaryCardProps) {
  return (
    <View
      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
        Bulk {order.productName} {formatOrderNumber(order.id, order.poNumber)}
      </Typography>

      <View className="mt-lg gap-lg">
        <View className="flex-row gap-lg">
          <SummaryField label="VOLUME" value={`${order.quantityMt} MT`} />
          <SummaryField label="DESTINATION" value={order.destination} />
        </View>
        <View className="flex-row gap-lg">
          <SummaryField label="ETA" value={order.eta ?? order.transitWindow ?? '—'} />
          <SummaryField
            label="INSURANCE"
            value={order.insuranceCovered ? 'Covered' : 'Not Covered'}
            valueClassName={order.insuranceCovered ? 'text-brand-success' : undefined}
          />
        </View>
      </View>

      <PrimaryButton
        label="Expand Master Shipment View"
        onPress={() => onExpand(order)}
        className="mt-lg py-md"
      />
    </View>
  );
});
