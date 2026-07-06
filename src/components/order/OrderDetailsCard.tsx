import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { formatPaymentCurrency } from '@/constants/payment';
import { ORDER_CONFIRMATION_COPY } from '@/constants/orderTimeline';
import type { Order } from '@/types/order';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type OrderDetailsCardProps = {
  order: Order;
  destination: string;
  className?: string;
};

type DetailFieldProps = {
  label: string;
  value: string;
};

const DetailField = memo(function DetailField({ label, value }: DetailFieldProps) {
  return (
    <View className="min-w-[45%] flex-1">
      <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
        {label}
      </Typography>
      <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
        {value}
      </Typography>
    </View>
  );
});

export const OrderDetailsCard = memo(function OrderDetailsCard({
  order,
  destination,
  className,
}: OrderDetailsCardProps) {
  return (
    <View
      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <View className="flex-row items-start justify-between">
        <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
          {ORDER_CONFIRMATION_COPY.orderDetailsHeading}
        </Typography>
        <View className="rounded-md bg-brand-primary-light px-sm py-xs">
          <Typography variant="roleTitle" className="text-[11px] text-brand-primary">
            {order.id}
          </Typography>
        </View>
      </View>

      <View className="mt-lg flex-row flex-wrap" style={{ gap: 16 }}>
        <DetailField label="Product" value={order.productName} />
        <DetailField label="Quantity" value={`${order.quantityMt} MT`} />
        <DetailField label="Warehouse" value={order.warehouse} />
        <DetailField label="Destination" value={destination} />
      </View>

      <View className="my-lg border-t border-brand-border" />

      <View className="flex-row items-center justify-between">
        <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
          {ORDER_CONFIRMATION_COPY.grandTotalLabel}
        </Typography>
        <Typography variant="headingLeft" className="text-[22px] text-brand-primary">
          {formatPaymentCurrency(order.amount)}
        </Typography>
      </View>
    </View>
  );
});
