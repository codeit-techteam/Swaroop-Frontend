import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { LocationPinIcon } from '@/icons';
import { DownloadButton } from '@/seller/modules/settlement-payout/components/DownloadButton';
import { SettlementStatusBadge } from '@/seller/modules/settlement-payout/components/SettlementStatusBadge';
import {
  formatSettlementAmount,
  formatSettlementDate,
} from '@/seller/modules/settlement-payout/services/settlementService';
import type { Settlement } from '@/seller/modules/settlement-payout/types/settlement';
import { brandColors } from '@/theme/colors';
import { elevation } from '@/theme/shadows';

type SettlementCardProps = {
  settlement: Settlement;
  onViewDetails: (settlement: Settlement) => void;
  onDownloadInvoice: (settlement: Settlement) => void;
  variant?: 'default' | 'history';
  onDownloadAdvice?: (settlement: Settlement) => void;
};

const Metric = ({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) => (
  <View className="flex-1 pr-xs">
    <Typography variant="fieldLabel" className="text-[9px] tracking-[0.6px]">
      {label}
    </Typography>
    <Typography
      variant="roleTitle"
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.75}
      className={emphasize ? 'mt-xs text-[13px] text-brand-navy' : 'mt-xs text-[13px]'}
    >
      {value}
    </Typography>
  </View>
);

export const SettlementCard = memo(function SettlementCard({
  settlement,
  onViewDetails,
  onDownloadInvoice,
  variant = 'default',
  onDownloadAdvice,
}: SettlementCardProps) {
  if (variant === 'history') {
    return (
      <Pressable
        onPress={() => onViewDetails(settlement)}
        className="rounded-2xl border border-brand-border bg-brand-white p-md"
        style={({ pressed }) => [elevation.sm, { opacity: pressed ? 0.96 : 1 }]}
      >
        <View className="flex-row items-start justify-between gap-sm">
          <View className="flex-1 pr-sm">
            <Typography variant="roleTitle" className="text-[16px]">
              {settlement.settlementId}
            </Typography>
            <Typography variant="legal" className="mt-xs text-left text-brand-body">
              {settlement.orderId} · {settlement.material}
            </Typography>
          </View>
          <SettlementStatusBadge status={settlement.status} />
        </View>

        <View className="mt-md flex-row">
          <Metric label="Net payout" value={formatSettlementAmount(settlement.netAmount)} emphasize />
          <Metric
            label="Released"
            value={settlement.releasedDate ? formatSettlementDate(settlement.releasedDate) : '—'}
          />
        </View>
        <Typography variant="legal" className="mt-sm text-left text-[11px] text-brand-body">
          {settlement.bankAccount ?? 'HDFC Bank •••• 4821'}
        </Typography>

        {onDownloadAdvice ? (
          <View className="mt-md">
            <DownloadButton
              label="Download advice"
              onPress={() => onDownloadAdvice(settlement)}
              compact
            />
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <View
      className="overflow-hidden rounded-2xl border border-brand-border bg-brand-white"
      style={elevation.sm}
    >
      <Pressable
        onPress={() => onViewDetails(settlement)}
        className="p-md"
        style={({ pressed }) => ({ opacity: pressed ? 0.96 : 1 })}
      >
        <View className="flex-row items-start justify-between gap-sm">
          <View className="flex-1 pr-sm">
            <Typography variant="headingLeft" className="text-[18px] leading-[22px]">
              {settlement.orderId}
            </Typography>
            <Typography variant="legal" className="mt-xs text-left text-[11px] text-brand-body">
              {settlement.material} · {settlement.quantity}
            </Typography>
          </View>
          <SettlementStatusBadge status={settlement.status} />
        </View>

        <View className="mt-sm flex-row items-center">
          <LocationPinIcon size={13} color={brandColors.primaryDark} />
          <Typography variant="legal" className="ml-xs flex-1 text-left text-[11px] text-brand-body" numberOfLines={1}>
            {settlement.destination} · {settlement.invoiceNo}
          </Typography>
        </View>

        <View className="mt-md rounded-2xl bg-brand-surface px-md py-md">
          <View className="flex-row items-end justify-between">
            <View className="flex-1 pr-md">
              <Typography variant="fieldLabel">Net settlement</Typography>
              <Typography
                variant="headingLeft"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                className="mt-xs text-[22px] leading-[26px] text-brand-navy"
              >
                {formatSettlementAmount(settlement.netAmount)}
              </Typography>
            </View>
            <Typography variant="legal" className="text-right text-[10px] text-brand-body">
              Due {formatSettlementDate(settlement.expectedDate)}
            </Typography>
          </View>
          <View className="mt-md flex-row">
            <Metric label="Gross" value={formatSettlementAmount(settlement.grossAmount)} />
            <Metric label="GST" value={formatSettlementAmount(settlement.gst)} />
            <Metric label="TDS" value={formatSettlementAmount(settlement.tds)} />
          </View>
        </View>
      </Pressable>

      <View className="flex-row gap-sm border-t border-brand-border px-md py-md">
        <Pressable
          onPress={() => onViewDetails(settlement)}
          className="flex-1 items-center rounded-xl bg-brand-navy py-sm"
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          <Typography variant="badge" className="text-[11px] text-brand-white">
            View details
          </Typography>
        </Pressable>
        <DownloadButton
          label="Invoice"
          onPress={() => onDownloadInvoice(settlement)}
          compact
          className="flex-1"
        />
      </View>
    </View>
  );
});
