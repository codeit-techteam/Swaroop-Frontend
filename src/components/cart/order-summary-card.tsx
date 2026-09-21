import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { formatCartCurrency } from '@/constants/cart';
import { InfoIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import type { CartOrderSummary } from '@/types/product';
import { cn } from '@/utils/cn';

type OrderSummaryCardProps = {
  summary: CartOrderSummary;
  loading?: boolean;
  className?: string;
};

type SummaryRowProps = {
  label: string;
  value: string;
  showInfo?: boolean;
  muted?: boolean;
};

const SummaryRow = memo(function SummaryRow({
  label,
  value,
  showInfo = false,
  muted = false,
}: SummaryRowProps) {
  return (
    <View className="mb-sm flex-row items-center justify-between">
      <View className="flex-row items-center">
        <Typography
          variant="roleDescription"
          className={cn('text-[13px]', muted ? 'text-brand-muted' : 'text-brand-body')}
        >
          {label}
        </Typography>
        {showInfo ? (
          <View className="ml-xs">
            <InfoIcon size={iconSizes.xs} color={brandColors.muted} />
          </View>
        ) : null}
      </View>
      <Typography
        variant="roleDescription"
        className={cn('text-[13px]', muted ? 'text-brand-muted' : 'text-brand-heading')}
      >
        {value}
      </Typography>
    </View>
  );
});

const formatOrPlaceholder = (amount: number | null, loading?: boolean): string => {
  if (loading) {
    return '—';
  }
  if (amount == null) {
    return '—';
  }
  return formatCartCurrency(amount);
};

export const OrderSummaryCard = memo(function OrderSummaryCard({
  summary,
  loading = false,
  className,
}: OrderSummaryCardProps) {
  return (
    <View
      className={cn('mx-lg rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <Typography
        variant="fieldLabel"
        className="mb-md text-[11px] tracking-[1.2px] text-brand-muted"
      >
        ORDER SUMMARY
      </Typography>

      <SummaryRow
        label="Base Subtotal"
        value={formatOrPlaceholder(summary.baseSubtotal, loading)}
      />
      {summary.discount != null && summary.discount > 0 ? (
        <SummaryRow label="Discount" value={`−${formatCartCurrency(summary.discount)}`} />
      ) : null}
      <SummaryRow
        label="Estimated Freight"
        value={formatOrPlaceholder(summary.freight, loading)}
        showInfo
      />
      <SummaryRow
        label={summary.gstLabel || 'GST'}
        value={formatOrPlaceholder(summary.gst, loading)}
      />
      <SummaryRow
        label="Platform Fee"
        value={formatOrPlaceholder(summary.platformFee, loading)}
        muted
      />
      <SummaryRow
        label="Insurance"
        value={
          loading
            ? '—'
            : summary.insuranceIncluded
              ? 'Included'
              : formatOrPlaceholder(summary.insuranceAmount, loading)
        }
        muted
      />

      <View className="my-sm h-px bg-brand-border" />

      <View className="flex-row items-end justify-between">
        <View className="mr-md flex-1">
          <Typography
            variant="roleTitle"
            className="text-[13px] tracking-[0.4px] text-brand-heading"
          >
            TOTAL LANDED COST
          </Typography>
          <Typography variant="roleDescription" className="mt-xs text-[11px] text-brand-muted">
            Inclusive of all taxes & delivery
          </Typography>
        </View>
        <Typography
          variant="roleTitle"
          className="text-[20px] text-brand-primary"
          accessibilityLiveRegion="polite"
        >
          {loading ? 'Checking...' : formatOrPlaceholder(summary.totalLandedCost)}
        </Typography>
      </View>
    </View>
  );
});
