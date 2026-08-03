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
      <Typography variant="roleTitle">{product.name}</Typography>
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
          <Typography variant="roleTitle" className="mt-xs">
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
}: {
  label: string;
  count: number;
  percentage: number;
}) {
  return (
    <View className="min-h-[88px] flex-1 rounded-2xl border border-brand-border bg-brand-white px-md py-md">
      <Typography variant="badge" className="text-[10px] uppercase text-brand-body">
        {label}
      </Typography>
      <Typography variant="headingLeft" className="mt-sm text-[24px] text-brand-heading">
        {count}
      </Typography>
      <Typography variant="legal" className="mt-xs text-left text-brand-body">
        {percentage}% of total
      </Typography>
    </View>
  );
});
