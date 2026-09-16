import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { BarChartIcon } from '@/icons';
import type { OfferAnalytics } from '@/seller/modules/seller-offers/types/offers';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

const formatCompactCount = (value: number): string => {
  if (value >= 1000) {
    const compact = value / 1000;
    return `${compact % 1 === 0 ? compact.toFixed(0) : compact.toFixed(1)}k`;
  }
  return value.toLocaleString('en-IN');
};

const METRICS = (
  analytics: OfferAnalytics,
  compact: boolean,
): Array<{ label: string; value: string; highlight?: boolean; tint: string }> => [
  {
    label: 'Views',
    value: compact ? formatCompactCount(analytics.views) : analytics.views.toLocaleString('en-IN'),
    tint: 'bg-brand-primary-tint',
  },
  {
    label: 'Quotes',
    value: compact ? formatCompactCount(analytics.quotes) : analytics.quotes.toLocaleString('en-IN'),
    tint: 'bg-brand-primary-light',
  },
  {
    label: 'Orders',
    value: compact ? formatCompactCount(analytics.orders) : analytics.orders.toLocaleString('en-IN'),
    tint: 'bg-brand-success-light',
  },
  {
    label: 'CVR',
    value: `${analytics.conversionRate}%`,
    highlight: true,
    tint: 'bg-brand-success-light',
  },
];

export const OfferAnalyticsCard = memo(function OfferAnalyticsCard({
  analytics,
  compact = false,
}: {
  analytics: OfferAnalytics;
  compact?: boolean;
}) {
  const metrics = METRICS(analytics, compact);

  if (compact) {
    return (
      <View className="flex-row gap-xs">
        {metrics.map((item) => (
          <View key={item.label} className={cn('flex-1 items-center rounded-2xl px-xs py-sm', item.tint)}>
            <Typography
              variant="roleTitle"
              className={cn(
                'text-[14px] leading-[18px]',
                item.highlight ? 'text-brand-success' : 'text-brand-heading',
              )}
            >
              {item.value}
            </Typography>
            <Typography variant="legal" className="mt-[2px] text-center text-[10px] text-brand-body">
              {item.label}
            </Typography>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="px-md py-md">
      <View className="mb-sm flex-row items-center gap-xs">
        <BarChartIcon size={14} color={brandColors.body} />
        <Typography variant="badge" className="text-[11px] tracking-[0.8px] text-brand-body">
          PERFORMANCE
        </Typography>
      </View>
      <View className="flex-row gap-xs">
        {metrics.map((item) => (
          <View key={item.label} className={cn('flex-1 rounded-2xl px-sm py-md', item.tint)}>
            <Typography variant="legal" className="text-left text-[10px] text-brand-body">
              {item.label}
            </Typography>
            <Typography
              variant="roleTitle"
              className={cn(
                'mt-xs text-[16px]',
                item.highlight ? 'text-brand-success' : 'text-brand-heading',
              )}
            >
              {item.value}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
});
