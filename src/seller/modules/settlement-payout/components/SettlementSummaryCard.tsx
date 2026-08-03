import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { InlineDetailGrid } from '@/seller/components';
import { SettlementStatusBadge } from '@/seller/modules/settlement-payout/components/SettlementStatusBadge';
import {
  formatSettlementAmount,
  formatSettlementDate,
} from '@/seller/modules/settlement-payout/services/settlementService';
import type { Settlement } from '@/seller/modules/settlement-payout/types/settlement';

export const SettlementSummaryCard = memo(function SettlementSummaryCard({
  settlement,
}: {
  settlement: Settlement;
}) {
  return (
    <View className="rounded-[22px] border border-brand-border bg-brand-white p-lg">
      <View className="flex-row items-start justify-between gap-sm">
        <View className="flex-1">
          <Typography variant="fieldLabel">Settlement ID</Typography>
          <Typography variant="headingLeft" className="mt-xs text-[22px]">
            {settlement.settlementId}
          </Typography>
        </View>
        <SettlementStatusBadge status={settlement.status} />
      </View>

      <View className="mt-lg">
        <InlineDetailGrid
          items={[
            { label: 'Order ID', value: settlement.orderId },
            { label: 'Invoice No', value: settlement.invoiceNo },
            { label: 'PO No', value: settlement.poNo },
            { label: 'Material', value: settlement.material },
            { label: 'Quantity', value: settlement.quantity },
            { label: 'Warehouse', value: settlement.warehouse },
            { label: 'Destination', value: settlement.destination },
            { label: 'Buyer', value: 'Hidden (Blind Marketplace)' },
          ]}
        />
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
    <View className="mt-md flex-row flex-wrap gap-md">
      <View className="min-w-[46%] flex-1 rounded-2xl bg-brand-surface p-md">
        <Typography variant="fieldLabel">Net Settlement</Typography>
        <Typography variant="headingLeft" className="mt-xs text-[22px] text-brand-primary">
          {formatSettlementAmount(settlement.netAmount)}
        </Typography>
      </View>
      <View className="min-w-[46%] flex-1 rounded-2xl bg-brand-surface p-md">
        <Typography variant="fieldLabel">Expected Release</Typography>
        <Typography variant="roleTitle" className="mt-xs">
          {formatSettlementDate(settlement.expectedDate)}
        </Typography>
      </View>
    </View>
  );
});
