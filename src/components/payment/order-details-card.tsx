import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { formatPaymentCurrency } from '@/constants/payment';
import { elevation } from '@/theme/shadows';
import type { Order } from '@/types/order';
import { cn } from '@/utils/cn';

type OrderDetailsCardProps = {
  order: Order;
  className?: string;
};

export const OrderDetailsCard = memo(function OrderDetailsCard({
  order,
  className,
}: OrderDetailsCardProps) {
  return (
    <View
      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <View className="flex-row items-start justify-between">
        <Typography variant="fieldLabel" className="text-[10px] tracking-[0.8px] text-brand-muted">
          ORDER DETAILS
        </Typography>
        <View className="rounded-md bg-brand-primary-light px-sm py-xs">
          <Typography variant="roleTitle" className="text-[12px] text-brand-primary">
            {order.quantityMt} MT
          </Typography>
        </View>
      </View>

      <Typography variant="roleTitle" className="mt-md text-[18px] leading-6 text-brand-heading">
        {order.productName}
      </Typography>

      <View className="my-md border-t border-dashed border-brand-border" />

      <View className="flex-row flex-wrap" style={{ gap: 16 }}>
        <View className="min-w-[45%] flex-1">
          <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
            Warehouse
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
            {order.warehouse}
          </Typography>
        </View>

        <View className="min-w-[45%] flex-1">
          <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
            Total Amount
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[16px] text-brand-primary">
            {formatPaymentCurrency(order.amount)}
          </Typography>
        </View>

        <View className="w-full">
          <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
            Payment Method
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
            {order.paymentMethod}
          </Typography>
        </View>
      </View>
    </View>
  );
});
