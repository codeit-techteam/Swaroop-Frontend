import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import type { OfferStatus } from '@/seller/modules/seller-offers/types/offers';
import { cn } from '@/utils/cn';

const statusConfig: Record<
  OfferStatus,
  { label: string; chip: string; text: string; dot?: string }
> = {
  draft: {
    label: 'DRAFT',
    chip: 'bg-brand-primary-light',
    text: 'text-brand-primary-dark',
  },
  pending_review: {
    label: 'IN REVIEW',
    chip: 'bg-[#FEF3E8]',
    text: 'text-[#B45309]',
    dot: 'bg-[#F59E0B]',
  },
  approved: {
    label: 'APPROVED',
    chip: 'bg-brand-success-light',
    text: 'text-brand-success',
    dot: 'bg-brand-success',
  },
  active: {
    label: 'ACTIVE',
    chip: 'bg-brand-success-light',
    text: 'text-brand-success',
    dot: 'bg-brand-success',
  },
  paused: {
    label: 'PAUSED',
    chip: 'bg-[#FEF3E8]',
    text: 'text-[#B45309]',
    dot: 'bg-[#F59E0B]',
  },
  expired: {
    label: 'EXPIRED',
    chip: 'bg-brand-error-light',
    text: 'text-brand-error',
  },
  rejected: {
    label: 'REJECTED',
    chip: 'bg-brand-error-light',
    text: 'text-brand-error',
  },
};

export const OfferStatusBadge = memo(function OfferStatusBadge({
  status,
  compact = false,
}: {
  status: OfferStatus;
  compact?: boolean;
}) {
  const config = statusConfig[status];

  return (
    <View className={cn('flex-row items-center rounded-full px-sm py-xs', config.chip)}>
      {config.dot ? <View className={cn('mr-xs h-1.5 w-1.5 rounded-full', config.dot)} /> : null}
      <Typography
        variant="badge"
        className={cn(compact ? 'text-[10px] tracking-[0.4px]' : 'text-[11px] tracking-[0.4px]', config.text)}
      >
        {config.label}
      </Typography>
    </View>
  );
});
