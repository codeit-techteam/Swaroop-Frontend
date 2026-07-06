import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import {
  formatExpectedDeliveryDate,
  formatTrackingOrderNumber,
  TRACKING_COPY,
} from '@/constants/trackingTimeline';
import type { Order } from '@/types/order';
import { elevation } from '@/theme/shadows';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/cn';

type OrderInformationCardProps = {
  order: Order;
  className?: string;
};

type InfoFieldProps = {
  label: string;
  value: string;
  className?: string;
};

const InfoField = memo(function InfoField({ label, value, className }: InfoFieldProps) {
  return (
    <View className={cn('flex-1', className)}>
      <Typography variant="fieldLabel" className="text-[10px] tracking-[0.8px] text-brand-muted">
        {label}
      </Typography>
      <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
        {value}
      </Typography>
    </View>
  );
});

export const OrderInformationCard = memo(function OrderInformationCard({
  order,
  className,
}: OrderInformationCardProps) {
  const productLabel = order.grade
    ? `${order.productName} ${order.grade}`
    : order.productName;

  return (
    <View
      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <View className="mb-md flex-row items-center justify-between border-b border-brand-border pb-md">
        <Typography
          variant="fieldLabel"
          className="text-[10px] tracking-[0.8px] text-brand-muted"
        >
          {TRACKING_COPY.orderInformationHeading}
        </Typography>
        <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
          {formatTrackingOrderNumber(order.id)}
        </Typography>
      </View>

      <View className="mb-lg">
        <Typography variant="fieldLabel" className="text-[10px] tracking-[0.8px] text-brand-muted">
          Material
        </Typography>
        <Typography variant="headingLeft" className="mt-xs text-[16px] text-brand-heading">
          {productLabel}
        </Typography>
      </View>

      <View className="mb-lg flex-row gap-md">
        <InfoField label="Quantity" value={`${order.quantityMt} MT`} />
        <InfoField label="Payment Method" value={order.paymentMethod} />
      </View>

      <View className="mb-lg flex-row gap-md">
        <InfoField label="Warehouse" value={order.warehouse} />
        <InfoField label="Destination" value={order.destination} />
      </View>

      <View className="mb-lg flex-row gap-md">
        <InfoField label="Expected Delivery" value={formatExpectedDeliveryDate(order)} />
        <InfoField label="Amount" value={formatCurrency(order.amount, { maximumFractionDigits: 0 })} />
      </View>
    </View>
  );
});
