import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import {
  formatSettlementAmount,
  formatSettlementDate,
} from '@/seller/modules/settlement-payout/services/settlementService';
import type { Settlement } from '@/seller/modules/settlement-payout/types/settlement';

export const FinancialBreakdownCard = memo(function FinancialBreakdownCard({
  settlement,
}: {
  settlement: Settlement;
}) {
  const rows = [
    { label: 'Gross Value', value: formatSettlementAmount(settlement.grossAmount) },
    { label: 'GST', value: formatSettlementAmount(settlement.gst) },
    { label: 'Platform Fee', value: formatSettlementAmount(settlement.platformFee) },
    { label: 'TDS', value: formatSettlementAmount(settlement.tds) },
    { label: 'Net Payable', value: formatSettlementAmount(settlement.netAmount), emphasized: true },
    {
      label: 'Settlement Date',
      value: settlement.releasedDate
        ? formatSettlementDate(settlement.releasedDate)
        : formatSettlementDate(settlement.expectedDate),
    },
  ];

  return (
    <View className="rounded-[22px] border border-brand-border bg-brand-white p-lg">
      <Typography variant="headingLeft" className="text-[20px]">
        Financial Breakdown
      </Typography>
      <View className="mt-md gap-sm">
        {rows.map((row) => (
          <View
            key={row.label}
            className="flex-row items-center justify-between border-b border-brand-border/60 py-sm last:border-b-0"
          >
            <Typography
              variant={row.emphasized ? 'roleTitle' : 'roleDescription'}
              className={row.emphasized ? 'text-brand-heading' : 'text-brand-body'}
            >
              {row.label}
            </Typography>
            <Typography
              variant={row.emphasized ? 'headingLeft' : 'roleTitle'}
              className={row.emphasized ? 'text-[22px] text-brand-primary' : undefined}
            >
              {row.value}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
});
