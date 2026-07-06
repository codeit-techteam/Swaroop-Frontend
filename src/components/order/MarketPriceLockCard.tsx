import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { ORDER_CONFIRMATION_COPY } from '@/constants/orderTimeline';
import type { PriceLockStatus } from '@/types/orderConfirmation';
import { cn } from '@/utils/cn';

type MarketPriceLockCardProps = {
  formattedTime: string;
  priceLockStatus: PriceLockStatus;
  className?: string;
};

export const MarketPriceLockCard = memo(function MarketPriceLockCard({
  formattedTime,
  priceLockStatus,
  className,
}: MarketPriceLockCardProps) {
  const isExpired = priceLockStatus === 'expired';

  return (
    <View
      className={cn(
        'overflow-hidden rounded-2xl border border-brand-border bg-brand-white',
        className,
      )}
    >
      <View className="flex-row">
        <View className="w-1.5 bg-brand-primary" />
        <View className="flex-1 items-center px-lg py-xl">
          <Typography
            variant="fieldLabel"
            className="text-[11px] tracking-[1px] text-brand-primary"
          >
            {ORDER_CONFIRMATION_COPY.priceLockHeading.toUpperCase()}
          </Typography>

          <Typography
            variant="headingLeft"
            className={cn(
              'mt-sm text-[48px] leading-[56px]',
              isExpired ? 'text-brand-muted' : 'text-brand-heading',
            )}
          >
            {isExpired ? ORDER_CONFIRMATION_COPY.priceLockExpired : formattedTime}
          </Typography>

          <Typography
            variant="roleDescription"
            className="mt-sm text-center text-[13px] leading-5 text-brand-muted"
          >
            {ORDER_CONFIRMATION_COPY.priceLockSubtitle}
          </Typography>
        </View>
      </View>
    </View>
  );
});
