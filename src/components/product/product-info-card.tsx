import { memo } from 'react';

import { View } from 'react-native';


import { Typography } from '@/components/ui/typography';
import { formatPricePerKg } from '@/constants/productDetails';
import { ClockIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { ProductDetails } from '@/types/product';
import { cn } from '@/utils/cn';

type ProductInfoCardProps = {
  product: ProductDetails;
  className?: string;
};

export const ProductInfoCard = memo(function ProductInfoCard({
  product,
  className,
}: ProductInfoCardProps) {
  const isTrendUp = product.trendDirection === 'up';

  return (
    <View

      className={cn(
        'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <View className="self-start rounded-md bg-brand-primary-light px-sm py-xs">
        <Typography variant="badge" className="text-[10px] tracking-[0.6px] text-brand-badge-text">
          Grade {product.grade}
        </Typography>
      </View>

      <Typography
        variant="headingLeft"
        className="mt-md text-[22px] leading-[28px] text-brand-heading"
      >
        {product.name}
      </Typography>
      <Typography
        variant="headingLeft"
        className="text-[22px] leading-[28px] text-brand-heading"
      >
        {product.nameLine2}
      </Typography>

      <View className="my-md h-px bg-brand-border" />

      <Typography
        variant="fieldLabel"
        className="text-[10px] tracking-[0.8px] text-brand-muted"
      >
        Base Price
      </Typography>
      <View className="mt-xs flex-row items-end">
        <Typography
          variant="headingLeft"
          className="text-[28px] leading-[32px] text-brand-heading"
        >
          {formatPricePerKg(product.basePricePerKg)}
        </Typography>
        <Typography
          variant="roleTitle"
          className="mb-0.5 ml-xs text-[14px] text-brand-heading"
        >
          / KG
        </Typography>
      </View>

      <View className="mt-sm flex-row items-center justify-between">
        <View>
          <Typography
            variant="fieldLabel"
            className="text-[10px] tracking-[0.8px] text-brand-muted"
          >
            Current Market Price
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
            {formatPricePerKg(product.marketPricePerKg)} / KG
          </Typography>
        </View>

        <View className="items-end">
          <Typography
            variant="fieldLabel"
            className="text-[10px] tracking-[0.8px] text-brand-muted"
          >
            Today&apos;s Trend
          </Typography>
          <Typography
            variant="roleTitle"
            className={cn(
              'mt-xs text-[14px]',
              isTrendUp ? 'text-brand-success' : 'text-brand-error',
            )}
          >
            {isTrendUp ? '▲' : '▼'} {isTrendUp ? '+' : '-'}
            {product.trendPercent}%
          </Typography>
        </View>
      </View>

      <View className="my-md h-px bg-brand-border" />

      <View className="flex-row">
        <View className="flex-1 pr-sm">
          <Typography
            variant="fieldLabel"
            className="text-[10px] tracking-[0.8px] text-brand-muted"
          >
            Min Order (MOQ)
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
            {product.moqLabel}
          </Typography>
        </View>
        <View className="flex-1 pl-sm">
          <Typography
            variant="fieldLabel"
            className="text-[10px] tracking-[0.8px] text-brand-muted"
          >
            Stock Status
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-primary-dark">
            {product.stockLabel}
          </Typography>
        </View>
      </View>

      <View className="mt-md flex-row items-center rounded-lg bg-brand-surface px-md py-md">
        <ClockIcon size={iconSizes.sm} color={brandColors.muted} />
        <View className="ml-sm flex-1 flex-row flex-wrap items-center">
          <Typography
            variant="fieldLabel"
            className="mr-sm text-[10px] tracking-[0.8px] text-brand-muted"
          >
            Est. Delivery
          </Typography>
          <Typography variant="roleTitle" className="text-[13px] text-brand-heading">
            {product.eta}
          </Typography>
        </View>
      </View>
    </View>
  );
});
