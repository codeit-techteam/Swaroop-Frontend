import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { cn } from '@/utils/cn';
import type { DispatchStage } from '@/seller/modules/dispatch/types/dispatch';

const stageStyles: Record<DispatchStage, { label: string; chip: string; text: string }> = {
  ready_to_dispatch: {
    label: 'Ready To Dispatch',
    chip: 'bg-[#DBEAFE]',
    text: 'text-[#1D4ED8]',
  },
  invoice_generated: {
    label: 'Invoice Generated',
    chip: 'bg-brand-success-light',
    text: 'text-brand-success',
  },
  vehicle_assigned: {
    label: 'Vehicle Assigned',
    chip: 'bg-brand-primary-light',
    text: 'text-brand-primary-dark',
  },
  loading: {
    label: 'Loading',
    chip: 'bg-[#FEF3C7]',
    text: 'text-[#B45309]',
  },
  dispatch_ready: {
    label: 'Dispatch Ready',
    chip: 'bg-[#E0F2FE]',
    text: 'text-[#0369A1]',
  },
  dispatched: {
    label: 'Dispatched',
    chip: 'bg-[#DBEAFE]',
    text: 'text-[#1D4ED8]',
  },
  in_transit: {
    label: 'In Transit',
    chip: 'bg-[#EEF4FF]',
    text: 'text-brand-primary-dark',
  },
  delivered: {
    label: 'Delivered',
    chip: 'bg-brand-success-light',
    text: 'text-brand-success',
  },
  delayed: {
    label: 'Delayed',
    chip: 'bg-brand-error-light',
    text: 'text-brand-error',
  },
};

export const getDispatchStageLabel = (stage: DispatchStage): string => stageStyles[stage].label;

export const DispatchStatusBadge = memo(function DispatchStatusBadge({
  stage,
  className,
}: {
  stage: DispatchStage;
  className?: string;
}) {
  const style = stageStyles[stage];
  return (
    <View className={cn('self-start rounded-md px-sm py-xs', style.chip, className)}>
      <Typography variant="badge" className={cn('text-[10px]', style.text)}>
        {style.label}
      </Typography>
    </View>
  );
});
