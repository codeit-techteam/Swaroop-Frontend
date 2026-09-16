import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { formatInr } from '@/constants/productDetails';
import type { SpotPriceInfo } from '@/types/product';
import { cn } from '@/utils/cn';

type SpotPriceCardProps = {
  spotPrice: SpotPriceInfo;
  className?: string;
};

export const SpotPriceCard = memo(function SpotPriceCard({
  spotPrice,
  className,
}: SpotPriceCardProps) {
  return (
    <View className={cn('mx-lg overflow-hidden rounded-xl shadow-sm', className)}>
      <View className="bg-brand-heading px-lg py-lg">
        <Typography
          variant="fieldLabel"
          className="text-[10px] tracking-[1.4px] text-brand-white/70"
        >
          Current Spot Price
        </Typography>
        <View className="mt-xs flex-row items-end">
          <Typography variant="headingLeft" className="text-[28px] leading-[32px] text-brand-white">
            {formatInr(spotPrice.pricePerMt)}
          </Typography>
          <Typography variant="roleTitle" className="mb-0.5 ml-xs text-[14px] text-brand-white/80">
            / MT
          </Typography>
        </View>
        <Typography
          variant="caption"
          className="mt-sm font-sans text-[12px] normal-case tracking-normal text-brand-success-light"
        >
          ▲ +{formatInr(spotPrice.yesterdayDelta)} from yesterday
        </Typography>
      </View>
    </View>
  );
});
