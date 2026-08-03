import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { ORDER_STATUS_LABELS } from '@/seller/modules/seller-orders/services/sellerOrdersService';
import type { SellerOrderStatus } from '@/seller/modules/seller-orders/types/sellerOrders';
import { cn } from '@/utils/cn';

const statusStyles: Record<
  SellerOrderStatus,
  { chip: string; text: string; label: string }
> = {
  pending: {
    chip: 'bg-[#FEE2E2]',
    text: 'text-[#DC2626]',
    label: ORDER_STATUS_LABELS.pending,
  },
  accepted: {
    chip: 'bg-[#DBEAFE]',
    text: 'text-[#1D4ED8]',
    label: ORDER_STATUS_LABELS.accepted,
  },
  dispatch_pending: {
    chip: 'bg-[#FEF3C7]',
    text: 'text-[#92400E]',
    label: ORDER_STATUS_LABELS.dispatch_pending,
  },
  delivered: {
    chip: 'bg-brand-surface',
    text: 'text-brand-body',
    label: ORDER_STATUS_LABELS.delivered,
  },
  rejected: {
    chip: 'bg-brand-error-light',
    text: 'text-brand-error',
    label: ORDER_STATUS_LABELS.rejected,
  },
};

export const OrderStatusBadge = memo(function OrderStatusBadge({
  status,
  compact = false,
}: {
  status: SellerOrderStatus;
  compact?: boolean;
}) {
  const style = statusStyles[status];

  return (
    <View className={cn('rounded-full px-sm py-xs', style.chip, compact && 'px-xs py-0.5')}>
      <Typography
        variant="badge"
        className={cn('text-[10px]', style.text, compact && 'text-[9px]')}
      >
        {style.label}
      </Typography>
    </View>
  );
});
