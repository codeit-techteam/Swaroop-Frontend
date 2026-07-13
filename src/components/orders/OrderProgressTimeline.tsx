import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { isDispatchStarted, isDeferredLoadingPaymentFlow } from '@/constants/dispatchStarted';
import {
  ORDER_LIFECYCLE_STAGES,
  ORDER_LIFECYCLE_STAGE_LABELS,
  ORDER_SHIPMENT_STAGE_LABELS,
  ORDER_SHIPMENT_STAGES,
  deriveOrderLifecycleStage,
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
  const useLifecycleStages =
    isDispatchStarted(order) ||
    (isDeferredLoadingPaymentFlow(order) &&
      (order.loadingStatus === 'scheduled' ||
        order.loadingStatus === 'completed' ||
        order.procurementCompleted));
  const currentLifecycleStage = deriveOrderLifecycleStage(order);
  const currentLifecycleIndex = ORDER_LIFECYCLE_STAGES.indexOf(currentLifecycleStage);
  const currentStage = deriveOrderShipmentStage(order);
  const currentIndex = ORDER_SHIPMENT_STAGES.indexOf(currentStage);

  const stages = useLifecycleStages ? ORDER_LIFECYCLE_STAGES : ORDER_SHIPMENT_STAGES;
  const stageLabels = useLifecycleStages ? ORDER_LIFECYCLE_STAGE_LABELS : ORDER_SHIPMENT_STAGE_LABELS;
  const activeIndex = useLifecycleStages ? currentLifecycleIndex : currentIndex;

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
        {stages.map((stage, index) => {
          const isActive = index === activeIndex;
          const isCompleted = index < activeIndex;

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
              {stageLabels[stage as keyof typeof stageLabels]}
            </Typography>
          );
        })}
      </View>

      <View className="mt-xs flex-row justify-between px-1">
        {stages.map((stage, index) => (
          <View
            key={`tick-${stage}`}
            className="h-2 w-px"
            style={{
              backgroundColor:
                index <= activeIndex ? progressColor : brandColors.border,
            }}
          />
        ))}
      </View>
    </View>
  );
});
