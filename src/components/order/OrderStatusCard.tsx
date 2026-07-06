import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { ORDER_CONFIRMATION_COPY } from '@/constants/orderTimeline';
import { ClockIcon, ShieldCheckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type OrderStatusCardProps = {
  className?: string;
};

export const OrderStatusCard = memo(function OrderStatusCard({ className }: OrderStatusCardProps) {
  return (
    <View className={cn('rounded-2xl bg-brand-heading px-lg py-lg', className)}>
      <View className="flex-row items-start">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-brand-card-blue">
          <ShieldCheckIcon size={iconSizes.lg} color={brandColors.white} />
        </View>

        <View className="ml-md min-w-0 flex-1">
          <Typography
            variant="fieldLabel"
            className="text-[10px] tracking-[1px] text-brand-primary-light"
          >
            {ORDER_CONFIRMATION_COPY.statusLabel.toUpperCase()}
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[16px] text-brand-white">
            {ORDER_CONFIRMATION_COPY.statusMessage}
          </Typography>
          <View className="mt-sm flex-row items-center">
            <ClockIcon size={iconSizes.sm} color={brandColors.primaryLight} />
            <Typography
              variant="roleDescription"
              className="ml-sm text-[12px] text-brand-primary-light"
            >
              {ORDER_CONFIRMATION_COPY.statusExpected}
            </Typography>
          </View>
        </View>
      </View>
    </View>
  );
});
