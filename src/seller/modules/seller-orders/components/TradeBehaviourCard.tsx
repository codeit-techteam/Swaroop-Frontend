import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { BarChartIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { TradeBehaviour } from '@/seller/modules/seller-orders/types/sellerOrders';

export const TradeBehaviourCard = memo(function TradeBehaviourCard({
  behaviour,
}: {
  behaviour: TradeBehaviour;
}) {
  const rows = [
    { label: 'Order Frequency', value: behaviour.orderFrequency },
    { label: 'Return Rate', value: behaviour.returnRate },
    { label: 'Avg. Order Size', value: behaviour.averageOrderSize },
    { label: 'Dispute Status', value: behaviour.disputeStatus, highlight: true },
  ];

  return (
    <View className="rounded-[20px] border border-brand-border bg-brand-white p-lg">
      <View className="flex-row items-center justify-between">
        <Typography variant="headingLeft" className="text-[18px]">
          Trade Behavior
        </Typography>
        <BarChartIcon size={18} color={brandColors.primaryDark} />
      </View>

      <View className="mt-md">
        {rows.map((row, index) => (
          <View
            key={row.label}
            className={index < rows.length - 1 ? 'border-b border-brand-border py-md' : 'py-md'}
          >
            <View className="flex-row items-center justify-between">
              <Typography variant="roleDescription" className="text-brand-body">
                {row.label}
              </Typography>
              <Typography
                variant="roleTitle"
                className={
                  row.highlight && row.value === 'CLEAR' ? 'text-brand-success' : 'text-brand-heading'
                }
              >
                {row.value}
              </Typography>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});
