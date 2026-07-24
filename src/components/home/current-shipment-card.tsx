import { memo } from 'react';

import { View } from 'react-native';

import { PrimaryButton, Typography } from '@/components/ui';
import {
  computeExpectedDelivery,
  inferOrderStatus,
  ORDER_STATUS_BADGE_LABELS,
} from '@/constants/orderWorkflow';
import { TruckIcon } from '@/icons';
import type { Order } from '@/types/order';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type CurrentShipmentCardProps = {
  order: Order;
  onTrackPress: () => void;
  className?: string;
};

export const CurrentShipmentCard = memo(function CurrentShipmentCard({
  order,
  onTrackPress,
  className,
}: CurrentShipmentCardProps) {
  const status = inferOrderStatus(order);
  const statusLabel = ORDER_STATUS_BADGE_LABELS[status];
  const eta = computeExpectedDelivery(order);

  return (
    <View
      className={cn('mx-lg rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <View className="flex-row items-center gap-sm">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-primary-tint">
          <TruckIcon size={iconSizes.sm} color={brandColors.primary} />
        </View>
        <Typography variant="roleTitle" className="text-[13px] tracking-[0.6px] text-brand-muted">
          CURRENT SHIPMENT
        </Typography>
      </View>

      <Typography variant="headingLeft" className="mt-md text-[18px] text-brand-heading">
        {order.productName}
      </Typography>

      <View className="mt-sm flex-row items-center justify-between">
        <View>
          <Typography variant="fieldLabel" className="text-[11px] text-brand-muted">
            Current Status
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-primary">
            {statusLabel}
          </Typography>
        </View>
        <View className="items-end">
          <Typography variant="fieldLabel" className="text-[11px] text-brand-muted">
            ETA
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
            {eta}
          </Typography>
        </View>
      </View>

      <View className="mt-md h-1.5 overflow-hidden rounded-full bg-brand-border">
        <View
          className="h-full rounded-full bg-brand-primary"
          style={{ width: `${order.progress}%` }}
        />
      </View>

      <View className="mt-md">
        <PrimaryButton label="Track Shipment" onPress={onTrackPress} className="py-md" />
      </View>
    </View>
  );
});
