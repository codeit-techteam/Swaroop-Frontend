import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import type { OrderDisplayStatus, Order } from '@/types/order';
import { getOrderStatusBadgeConfig, getOrderStatusBadgeConfigFromOrder } from '@/constants/orderStatus';

type OrderStatusBadgeProps =
  | {
      status: OrderDisplayStatus;
      order?: never;
      className?: string;
    }
  | {
      order: Order;
      status?: never;
      className?: string;
    };

export const OrderStatusBadge = memo(function OrderStatusBadge(props: OrderStatusBadgeProps) {
  const config = props.order
    ? getOrderStatusBadgeConfigFromOrder(props.order)
    : getOrderStatusBadgeConfig(props.status);

  return (
    <View
      className={props.className}
      style={{ backgroundColor: config.backgroundColor }}
      accessibilityRole="text"
      accessibilityLabel={`Status ${config.label}`}
    >
      <Typography
        variant="fieldLabel"
        className="px-sm py-xs text-[10px] tracking-[0.6px]"
        style={{ color: config.textColor }}
      >
        {config.label}
      </Typography>
    </View>
  );
});
