import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { DELIVERY_COMPLETED_COPY } from '@/constants/deliveryCompleted';
import { InfoIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type DeliveryNextStepCardProps = {
  className?: string;
};

export const DeliveryNextStepCard = memo(function DeliveryNextStepCard({
  className,
}: DeliveryNextStepCardProps) {
  return (
    <View
      className={cn(
        'flex-row items-start gap-md rounded-2xl border border-brand-primary/20 bg-brand-primary-tint p-lg',
        className,
      )}
    >
      <View className="mt-xs h-9 w-9 items-center justify-center rounded-full bg-brand-white">
        <InfoIcon size={iconSizes.md} color={brandColors.primary} />
      </View>

      <View className="min-w-0 flex-1">
        <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
          {DELIVERY_COMPLETED_COPY.nextStepTitle}
        </Typography>
        <Typography
          variant="subheadingLeft"
          className="mt-sm text-[13px] leading-[20px] text-brand-body"
        >
          {DELIVERY_COMPLETED_COPY.nextStepDescription}
        </Typography>
      </View>
    </View>
  );
});
