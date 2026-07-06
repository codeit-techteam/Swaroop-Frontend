import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import type { OrderDisplayStatus } from '@/types/order';
import { getOrderStatusBadgeConfig } from '@/constants/orderStatus';

type OrderStatusBadgeProps = {
  status: OrderDisplayStatus;
  className?: string;
};

export const OrderStatusBadge = memo(function OrderStatusBadge({
  status,
  className,
}: OrderStatusBadgeProps) {
  const config = getOrderStatusBadgeConfig(status);

  return (
    <View
      className={className}
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
