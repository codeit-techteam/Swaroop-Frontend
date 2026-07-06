import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { ORDER_CONFIRMATION_COPY } from '@/constants/orderTimeline';
import { CheckCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type OrderSubmittedCardProps = {
  className?: string;
};

export const OrderSubmittedCard = memo(function OrderSubmittedCard({
  className,
}: OrderSubmittedCardProps) {
  return (
    <View
      className={cn(
        'items-center rounded-2xl border border-brand-border bg-brand-white px-lg py-xl',
        className,
      )}
      style={elevation.sm}
    >
      <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-success-light">
        <CheckCircleIcon size={iconSizes.xl} color={brandColors.success} />
      </View>

      <Typography
        variant="headingLeft"
        className="mt-md text-center text-[22px] text-brand-heading"
      >
        {ORDER_CONFIRMATION_COPY.submittedTitle}
      </Typography>

      <View className="mt-md flex-row items-center rounded-full bg-brand-primary-light px-md py-sm">
        <View className="mr-sm h-2 w-2 rounded-full bg-brand-primary" />
        <Typography
          variant="badge"
          className="text-[11px] tracking-[0.8px] text-brand-primary"
        >
          {ORDER_CONFIRMATION_COPY.submittedChip.toUpperCase()}
        </Typography>
      </View>
    </View>
  );
});
