import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { PROCUREMENT_SCREEN_COPY } from '@/constants/procurementSteps';
import { ShieldCheckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type BlindMarketplaceInfoCardProps = {
  title?: string;
  message?: string;
  className?: string;
};

export const BlindMarketplaceInfoCard = memo(function BlindMarketplaceInfoCard({
  title = PROCUREMENT_SCREEN_COPY.blindMarketplaceTitle,
  message = PROCUREMENT_SCREEN_COPY.blindMarketplaceMessage,
  className,
}: BlindMarketplaceInfoCardProps) {
  return (
    <View
      className={cn(
        'rounded-2xl border border-brand-primary/20 bg-brand-primary-tint px-lg py-lg',
        className,
      )}
    >
      <View className="flex-row items-start">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-primary">
          <ShieldCheckIcon size={iconSizes.md} color={brandColors.white} />
        </View>
        <View className="ml-md min-w-0 flex-1">
          <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
            {title}
          </Typography>
          <Typography
            variant="roleDescription"
            className="mt-xs text-[13px] leading-5 text-brand-heading"
          >
            {message}
          </Typography>
        </View>
      </View>
    </View>
  );
});
