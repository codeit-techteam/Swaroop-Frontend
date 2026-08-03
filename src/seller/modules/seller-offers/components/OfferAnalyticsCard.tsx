import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { BarChartIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { OfferAnalytics } from '@/seller/modules/seller-offers/types/offers';

export const OfferAnalyticsCard = memo(function OfferAnalyticsCard({
  analytics,
}: {
  analytics: OfferAnalytics;
}) {
  return (
    <View className="border-t border-brand-border px-md py-md">
      <View className="mb-sm flex-row items-center gap-xs">
        <BarChartIcon size={14} color={brandColors.body} />
        <Typography variant="badge" className="text-[11px] text-brand-body">
          PERFORMANCE
        </Typography>
      </View>
      <View className="flex-row flex-wrap">
        {[
          { label: 'Views', value: analytics.views.toLocaleString('en-IN') },
          { label: 'Quotes', value: analytics.quotes.toLocaleString('en-IN') },
          { label: 'Orders', value: analytics.orders.toLocaleString('en-IN') },
          {
            label: 'CVR',
            value: `${analytics.conversionRate}%`,
            highlight: true,
          },
        ].map((item) => (
          <View key={item.label} className="w-1/2 py-sm">
            <Typography variant="legal" className="text-left text-brand-body">
              {item.label}
            </Typography>
            <Typography
              variant="roleTitle"
              className={item.highlight ? 'text-brand-success' : 'text-brand-heading'}
            >
              {item.value}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
});
