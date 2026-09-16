import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { SettlementStatusBadge } from '@/seller/modules/settlement-payout/components/SettlementStatusBadge';
import {
  formatSettlementAmount,
  formatSettlementDate,
} from '@/seller/modules/settlement-payout/services/settlementService';
import type { Settlement } from '@/seller/modules/settlement-payout/types/settlement';
import { elevation } from '@/theme/shadows';

export const SettlementSummaryCard = memo(function SettlementSummaryCard({
  settlement,
}: {
  settlement: Settlement;
}) {
  const facts = [
    { label: 'Order', value: settlement.orderId },
    { label: 'Invoice', value: settlement.invoiceNo },
    { label: 'PO', value: settlement.poNo },
    { label: 'Material', value: settlement.material },
    { label: 'Quantity', value: settlement.quantity },
    { label: 'Warehouse', value: settlement.warehouse },
    { label: 'Destination', value: settlement.destination },
    { label: 'Buyer', value: 'Hidden (blind marketplace)' },
  ];

  return (
    <View className="overflow-hidden rounded-3xl bg-brand-navy" style={elevation.md}>
      <View className="px-lg pt-lg">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-md">
            <Typography variant="badge" className="text-[10px] text-brand-primary-light">
              Settlement
            </Typography>
            <Typography variant="headingLeft" className="mt-xs text-[22px] text-brand-white">
              {settlement.settlementId}
            </Typography>
          </View>
          <SettlementStatusBadge status={settlement.status} />
        </View>
        <Typography variant="legal" className="mt-lg text-left text-[11px] text-brand-primary-light">
          Net payable
        </Typography>
        <Typography
          variant="headingLeft"
          numberOfLines={1}
          adjustsFontSizeToFit
          className="mt-xs text-[32px] leading-[38px] text-brand-white"
        >
          {formatSettlementAmount(settlement.netAmount)}
        </Typography>
        <Typography variant="legal" className="mt-xs text-left text-brand-primary-light">
          Expected {formatSettlementDate(settlement.expectedDate)}
        </Typography>
      </View>

      <View className="mt-lg rounded-t-3xl bg-brand-white px-lg py-lg">
        <View className="flex-row flex-wrap">
          {facts.map((item) => (
            <View key={item.label} className="mb-md w-1/2 pr-sm">
              <Typography variant="fieldLabel">{item.label}</Typography>
              <Typography variant="roleTitle" className="mt-xs text-[14px]" numberOfLines={2}>
                {item.value}
              </Typography>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
});

export const SettlementSummaryMeta = memo(function SettlementSummaryMeta({
  settlement,
}: {
  settlement: Settlement;
}) {
  return (
    <View className="mt-md flex-row gap-sm">
      <View className="flex-1 rounded-2xl bg-brand-surface p-md">
        <Typography variant="fieldLabel">Net settlement</Typography>
        <Typography
          variant="headingLeft"
          numberOfLines={1}
          adjustsFontSizeToFit
          className="mt-xs text-[20px] text-brand-navy"
        >
          {formatSettlementAmount(settlement.netAmount)}
        </Typography>
      </View>
      <View className="flex-1 rounded-2xl bg-brand-surface p-md">
        <Typography variant="fieldLabel">Expected release</Typography>
        <Typography variant="roleTitle" className="mt-xs text-[14px]">
          {formatSettlementDate(settlement.expectedDate)}
        </Typography>
      </View>
    </View>
  );
});
