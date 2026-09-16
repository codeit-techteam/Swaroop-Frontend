import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import {
  formatSettlementAmount,
  formatSettlementDate,
} from '@/seller/modules/settlement-payout/services/settlementService';
import type { Settlement } from '@/seller/modules/settlement-payout/types/settlement';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

export const FinancialBreakdownCard = memo(function FinancialBreakdownCard({
  settlement,
}: {
  settlement: Settlement;
}) {
  const rows = [
    { label: 'Gross value', value: formatSettlementAmount(settlement.grossAmount) },
    { label: 'GST', value: formatSettlementAmount(settlement.gst) },
    { label: 'Platform fee', value: formatSettlementAmount(settlement.platformFee) },
    { label: 'TDS', value: formatSettlementAmount(settlement.tds) },
  ];

  return (
    <View className="rounded-2xl border border-brand-border bg-brand-white p-lg" style={elevation.sm}>
      <Typography variant="headingLeft" className="text-[18px]">
        Financial breakdown
      </Typography>
      <View className="mt-md">
        {rows.map((row, index) => (
          <View
            key={row.label}
            className={cn(
              'flex-row items-center justify-between py-sm',
              index < rows.length - 1 && 'border-b border-brand-border',
            )}
          >
            <Typography variant="roleDescription" className="text-brand-body">
              {row.label}
            </Typography>
            <Typography variant="roleTitle" className="text-[15px]">
              {row.value}
            </Typography>
          </View>
        ))}
        <View className="mt-sm flex-row items-center justify-between rounded-2xl bg-brand-primary-tint px-md py-md">
          <View>
            <Typography variant="fieldLabel">Net payable</Typography>
            <Typography variant="legal" className="mt-xs text-left text-brand-body">
              {settlement.releasedDate
                ? `Released ${formatSettlementDate(settlement.releasedDate)}`
                : `Due ${formatSettlementDate(settlement.expectedDate)}`}
            </Typography>
          </View>
          <Typography
            variant="headingLeft"
            numberOfLines={1}
            adjustsFontSizeToFit
            className="ml-md text-[20px] text-brand-navy"
          >
            {formatSettlementAmount(settlement.netAmount)}
          </Typography>
        </View>
      </View>
    </View>
  );
});
