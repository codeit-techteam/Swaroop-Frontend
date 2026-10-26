import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import type { TopSellingProduct } from '@/seller/types/analytics';
import { cn } from '@/utils/cn';

export const ProductPerformanceCard = memo(function ProductPerformanceCard({
  product,
}: {
  product: TopSellingProduct;
}) {
  const growthPositive = product.growthPercent >= 0;

  return (
    <View className="mb-md rounded-2xl border border-brand-border bg-brand-white px-md py-md">
      <Typography variant="roleTitle" numberOfLines={1}>
        {product.name}
      </Typography>
      <View className="mt-md flex-row flex-wrap">
        <View className="mb-sm w-1/2 pr-sm">
          <Typography variant="legal" className="text-left text-brand-body">
            Orders
          </Typography>
          <Typography variant="roleTitle" className="mt-xs">
            {product.orders}
          </Typography>
        </View>
        <View className="mb-sm w-1/2 pr-sm">
          <Typography variant="legal" className="text-left text-brand-body">
            Revenue
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-brand-navy">
            {product.revenue}
          </Typography>
        </View>
        <View className="w-1/2 pr-sm">
          <Typography variant="legal" className="text-left text-brand-body">
            Growth
          </Typography>
          <Typography
            variant="roleTitle"
            className={cn('mt-xs', growthPositive ? 'text-brand-success' : 'text-brand-error')}
          >
            {growthPositive ? '+' : ''}
            {product.growthPercent}%
          </Typography>
        </View>
      </View>
    </View>
  );
});

export const OrderAnalyticsCard = memo(function OrderAnalyticsCard({
  label,
  count,
  percentage,
  className,
}: {
  label: string;
  count: number;
  percentage: number;
  className?: string;
}) {
  return (
    <View
      className={cn(
        'min-h-[104px] w-[112px] rounded-2xl border border-brand-border bg-brand-white px-md py-md',
        className,
      )}
    >
      <Typography
        variant="badge"
        numberOfLines={1}
        className="text-[10px] tracking-[0.4px] text-brand-body"
      >
        {label}
      </Typography>
      <Typography
        variant="headingLeft"
        numberOfLines={1}
        className="mt-sm text-[24px] leading-[30px] text-brand-heading"
      >
        {count}
      </Typography>
      <Typography variant="legal" className="mt-xs text-left text-brand-body">
        {percentage}% of total
      </Typography>
    </View>
  );
});
