import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { TRACKING_COPY } from '@/constants/trackingTimeline';
import { ShieldCheckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type BlindMarketplaceNoticeProps = {
  message?: string;
  className?: string;
};

export const BlindMarketplaceNotice = memo(function BlindMarketplaceNotice({
  message = TRACKING_COPY.blindMarketplaceMessage,
  className,
}: BlindMarketplaceNoticeProps) {
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
        <Typography
          variant="roleDescription"
          className="ml-md min-w-0 flex-1 text-[13px] leading-5 text-brand-heading"
        >
          {message}
        </Typography>
      </View>
    </View>
  );
});
