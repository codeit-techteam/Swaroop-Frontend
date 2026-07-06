import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { ORDER_CONFIRMATION_COPY } from '@/constants/orderTimeline';
import { InfoIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type OrderConfirmationInfoCardProps = {
  message?: string;
  className?: string;
};

export const OrderConfirmationInfoCard = memo(function OrderConfirmationInfoCard({
  message = ORDER_CONFIRMATION_COPY.infoMessage,
  className,
}: OrderConfirmationInfoCardProps) {
  return (
    <View
      className={cn(
        'flex-row items-start rounded-2xl border border-brand-primary/20 bg-brand-primary-tint px-lg py-lg',
        className,
      )}
    >
      <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-full bg-brand-primary">
        <InfoIcon size={iconSizes.sm} color={brandColors.white} />
      </View>
      <Typography
        variant="roleDescription"
        className="ml-md min-w-0 flex-1 text-[13px] leading-5 text-brand-heading"
      >
        {message}
      </Typography>
    </View>
  );
});
