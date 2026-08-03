import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { DownloadButton } from '@/seller/modules/settlement-payout/components/DownloadButton';
import { SettlementStatusBadge } from '@/seller/modules/settlement-payout/components/SettlementStatusBadge';
import {
  formatSettlementAmount,
  formatSettlementDate,
} from '@/seller/modules/settlement-payout/services/settlementService';
import type { Settlement } from '@/seller/modules/settlement-payout/types/settlement';

type SettlementCardProps = {
  settlement: Settlement;
  onViewDetails: (settlement: Settlement) => void;
  onDownloadInvoice: (settlement: Settlement) => void;
  variant?: 'default' | 'history';
  onDownloadAdvice?: (settlement: Settlement) => void;
};

export const SettlementCard = memo(function SettlementCard({
  settlement,
  onViewDetails,
  onDownloadInvoice,
  variant = 'default',
  onDownloadAdvice,
}: SettlementCardProps) {
  if (variant === 'history') {
    return (
      <View className="rounded-[22px] border border-brand-border bg-brand-white p-md">
        <View className="flex-row items-start justify-between gap-sm">
          <View className="flex-1">
            <Typography variant="roleTitle">{settlement.settlementId}</Typography>
            <Typography variant="legal" className="mt-xs text-left text-brand-body">
              {settlement.orderId}
            </Typography>
          </View>
          <SettlementStatusBadge status={settlement.status} />
        </View>

        <View className="mt-md flex-row flex-wrap gap-md">
          <View className="min-w-[46%] flex-1">
            <Typography variant="fieldLabel">Amount</Typography>
            <Typography variant="roleTitle" className="mt-xs text-brand-primary">
              {formatSettlementAmount(settlement.netAmount)}
            </Typography>
          </View>
          <View className="min-w-[46%] flex-1">
            <Typography variant="fieldLabel">Release Date</Typography>
            <Typography variant="roleTitle" className="mt-xs">
              {settlement.releasedDate ? formatSettlementDate(settlement.releasedDate) : '--'}
            </Typography>
          </View>
          <View className="min-w-[46%] flex-1">
            <Typography variant="fieldLabel">Bank</Typography>
            <Typography variant="roleTitle" className="mt-xs">
              {settlement.bankAccount ?? 'HDFC Bank •••• 4821'}
            </Typography>
          </View>
        </View>

        {onDownloadAdvice ? (
          <View className="mt-md">
            <DownloadButton
              label="Download Advice"
              onPress={() => onDownloadAdvice(settlement)}
              compact
            />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View className="rounded-[22px] border border-brand-border bg-brand-white p-md">
      <View className="flex-row items-start justify-between gap-sm">
        <View className="flex-1">
          <Typography variant="headingLeft" className="text-[22px]">
            {settlement.orderId}
          </Typography>
          <Typography variant="legal" className="mt-xs text-left text-brand-body">
            {settlement.material} • {settlement.quantity}
          </Typography>
        </View>
        <SettlementStatusBadge status={settlement.status} />
      </View>

      <View className="mt-md gap-xs">
        <Typography variant="roleDescription">Buyer Hidden • {settlement.destination}</Typography>
        <Typography variant="roleDescription">Invoice {settlement.invoiceNo}</Typography>
      </View>

      <View className="mt-md flex-row flex-wrap gap-md">
        <View className="min-w-[46%] flex-1">
          <Typography variant="fieldLabel">Gross Amount</Typography>
          <Typography variant="roleTitle" className="mt-xs">
            {formatSettlementAmount(settlement.grossAmount)}
          </Typography>
        </View>
        <View className="min-w-[46%] flex-1">
          <Typography variant="fieldLabel">GST</Typography>
          <Typography variant="roleTitle" className="mt-xs">
            {formatSettlementAmount(settlement.gst)}
          </Typography>
        </View>
        <View className="min-w-[46%] flex-1">
          <Typography variant="fieldLabel">TDS</Typography>
          <Typography variant="roleTitle" className="mt-xs">
            {formatSettlementAmount(settlement.tds)}
          </Typography>
        </View>
        <View className="min-w-[46%] flex-1">
          <Typography variant="fieldLabel">Net Settlement</Typography>
          <Typography variant="roleTitle" className="mt-xs text-brand-primary">
            {formatSettlementAmount(settlement.netAmount)}
          </Typography>
        </View>
      </View>

      <Typography variant="legal" className="mt-md text-left text-brand-body">
        Expected release {formatSettlementDate(settlement.expectedDate)}
      </Typography>

      <View className="mt-md flex-row flex-wrap gap-sm">
        <Pressable
          onPress={() => onViewDetails(settlement)}
          className="rounded-xl bg-brand-navy px-md py-sm"
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          <Typography variant="roleTitle" className="text-brand-white">
            View Details
          </Typography>
        </Pressable>
        <DownloadButton label="Download Invoice" onPress={() => onDownloadInvoice(settlement)} compact />
      </View>
    </View>
  );
});
