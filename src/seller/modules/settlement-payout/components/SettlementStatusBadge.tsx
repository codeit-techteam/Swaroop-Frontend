import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { cn } from '@/utils/cn';
import type { SettlementStatus } from '@/seller/modules/settlement-payout/types/settlement';

const statusStyles: Record<SettlementStatus, { label: string; chip: string; text: string }> = {
  pending: {
    label: 'Pending',
    chip: 'bg-[#FEF3E8]',
    text: 'text-[#B45309]',
  },
  processing: {
    label: 'Processing',
    chip: 'bg-[#DBEAFE]',
    text: 'text-[#1D4ED8]',
  },
  released: {
    label: 'Released',
    chip: 'bg-brand-success-light',
    text: 'text-brand-success',
  },
  failed: {
    label: 'Failed',
    chip: 'bg-brand-error-light',
    text: 'text-brand-error',
  },
};

export const getSettlementStatusLabel = (status: SettlementStatus): string =>
  statusStyles[status].label;

export const SettlementStatusBadge = memo(function SettlementStatusBadge({
  status,
  className,
}: {
  status: SettlementStatus;
  className?: string;
}) {
  const style = statusStyles[status];
  return (
    <View className={cn('self-start rounded-md px-sm py-xs', style.chip, className)}>
      <Typography variant="badge" className={cn('text-[10px]', style.text)}>
        {style.label}
      </Typography>
    </View>
  );
});
