import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { cn } from '@/utils/cn';

import type { ShipmentLiveStatus } from '@/seller/types/shipments';

type StatusBadgeProps = {
  status: ShipmentLiveStatus;
  className?: string;
};

const statusStyles: Record<
  ShipmentLiveStatus,
  { container: string; text: string; dot: string; label: string }
> = {
  LIVE: {
    container: 'border border-brand-success/30 bg-brand-success-light',
    text: 'text-brand-success',
    dot: 'bg-brand-success',
    label: 'LIVE',
  },
  STABLE: {
    container: 'border border-brand-primary/20 bg-brand-primary-light',
    text: 'text-brand-primary-dark',
    dot: 'bg-brand-primary',
    label: 'STABLE',
  },
  DELAYED: {
    container: 'border border-brand-error/30 bg-brand-error-light',
    text: 'text-brand-error',
    dot: 'bg-brand-error',
    label: 'DELAYED',
  },
};

export const StatusBadge = memo(function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = statusStyles[status];

  return (
    <View className={cn('flex-row items-center rounded-full px-sm py-xs', styles.container, className)}>
      <View className={cn('mr-1.5 h-2 w-2 rounded-full', styles.dot)} />
      <Typography variant="badge" className={cn('text-[10px]', styles.text)}>
        {styles.label}
      </Typography>
    </View>
  );
});
