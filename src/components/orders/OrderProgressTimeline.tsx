import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import {
  ORDER_SHIPMENT_STAGE_LABELS,
  ORDER_SHIPMENT_STAGES,
  deriveOrderShipmentStage,
} from '@/constants/orderStatus';
import type { Order } from '@/types/order';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type OrderProgressTimelineProps = {
  order: Order;
  progressColor: string;
  className?: string;
};

export const OrderProgressTimeline = memo(function OrderProgressTimeline({
  order,
  progressColor,
  className,
}: OrderProgressTimelineProps) {
  const currentStage = deriveOrderShipmentStage(order);
  const currentIndex = ORDER_SHIPMENT_STAGES.indexOf(currentStage);

  return (
    <View className={cn('w-full', className)}>
      <View className="h-1.5 w-full overflow-hidden rounded-full bg-brand-border">
        <View
          className="h-full rounded-full"
          style={{
            width: `${order.progress}%`,
            backgroundColor: progressColor,
          }}
        />
      </View>

      <View className="mt-sm flex-row justify-between">
        {ORDER_SHIPMENT_STAGES.map((stage, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <Typography
              key={stage}
              variant="fieldLabel"
              className={cn(
                'text-[9px] tracking-[0.5px]',
                isActive
                  ? 'font-bold'
                  : isCompleted
                    ? 'text-brand-body'
                    : 'text-brand-muted',
              )}
              style={isActive ? { color: progressColor } : undefined}
            >
              {ORDER_SHIPMENT_STAGE_LABELS[stage]}
            </Typography>
          );
        })}
      </View>

      <View className="mt-xs flex-row justify-between px-1">
        {ORDER_SHIPMENT_STAGES.map((stage, index) => (
          <View
            key={`tick-${stage}`}
            className="h-2 w-px"
            style={{
              backgroundColor:
                index <= currentIndex ? progressColor : brandColors.border,
            }}
          />
        ))}
      </View>
    </View>
  );
});
