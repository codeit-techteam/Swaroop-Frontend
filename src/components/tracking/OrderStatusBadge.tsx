import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { getTrackingOrderStatusBadgeConfig } from '@/constants/trackingTimeline';
import type { TrackingOrderStatus } from '@/types/tracking';
import { cn } from '@/utils/cn';

type OrderStatusBadgeProps = {
  status: TrackingOrderStatus;
  className?: string;
};

export const OrderStatusBadge = memo(function OrderStatusBadge({
  status,
  className,
}: OrderStatusBadgeProps) {
  const config = getTrackingOrderStatusBadgeConfig(status);

  return (
    <View
      className={cn('rounded-full px-sm py-xs', className)}
      style={{ backgroundColor: config.backgroundColor }}
      accessibilityRole="text"
      accessibilityLabel={`Status ${config.label}`}
    >
      <Typography
        variant="fieldLabel"
        className="text-[10px] tracking-[0.6px]"
        style={{ color: config.textColor }}
      >
        {config.label}
      </Typography>
    </View>
  );
});
