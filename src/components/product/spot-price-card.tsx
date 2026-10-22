import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { formatInr, formatPricePerKg } from '@/constants/productDetails';
import { formatEstimateMoney } from '@/services/marketplace-pricing';
import type { SpotPriceInfo } from '@/types/product';
import { cn } from '@/utils/cn';

type SpotPriceCardProps = {
  spotPrice: SpotPriceInfo;
  /** When present (from pricing/estimate), prefer API unit prices over ÷1000. */
  unitPricePerMt?: string | null;
  unitPricePerKg?: string | null;
  currency?: string | null;
  className?: string;
};

export const SpotPriceCard = memo(function SpotPriceCard({
  spotPrice,
  unitPricePerMt,
  unitPricePerKg,
  currency = 'INR',
  className,
}: SpotPriceCardProps) {
  const isInr = !currency || currency.toUpperCase() === 'INR';
  const mtLabel = unitPricePerMt
    ? isInr
      ? formatEstimateMoney(unitPricePerMt)
      : `${currency} ${unitPricePerMt}`
    : formatInr(spotPrice.pricePerMt);
  const kgLabel = unitPricePerKg
    ? isInr
      ? formatEstimateMoney(unitPricePerKg)
      : `${currency} ${unitPricePerKg}`
    : formatPricePerKg(spotPrice.pricePerMt / 1000);

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
            {mtLabel}
          </Typography>
          <Typography variant="roleTitle" className="mb-0.5 ml-xs text-[14px] text-brand-white/80">
            / MT
          </Typography>
        </View>
        <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-white/85">
          {kgLabel} / kg
          {!unitPricePerKg ? (
            <Typography variant="caption" className="text-[11px] text-brand-white/55">
              {' '}
              (÷ 1,000)
            </Typography>
          ) : null}
        </Typography>
        {!isInr ? (
          <Typography
            variant="caption"
            className="mt-sm font-sans text-[11px] normal-case tracking-normal text-brand-white/70"
          >
            Offer currency is not INR — no silent foreign→INR conversion.
          </Typography>
        ) : (
          <Typography
            variant="caption"
            className="mt-sm font-sans text-[12px] normal-case tracking-normal text-brand-success-light"
          >
            ▲ +{formatInr(spotPrice.yesterdayDelta)} from yesterday
          </Typography>
        )}
      </View>
    </View>
  );
});
