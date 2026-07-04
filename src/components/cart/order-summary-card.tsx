import { memo } from 'react';

import { View } from 'react-native';

import Animated, { FadeInDown } from 'react-native-reanimated';

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

export const OrderSummaryCard = memo(function OrderSummaryCard({
  summary,
  className,
}: OrderSummaryCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(180).duration(360).springify().damping(18)}
      className={cn('mx-lg rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <Typography
        variant="fieldLabel"
        className="mb-md text-[11px] tracking-[1.2px] text-brand-muted"
      >
        ORDER SUMMARY
      </Typography>

      <SummaryRow label="Base Subtotal" value={formatCartCurrency(summary.baseSubtotal)} />
      <SummaryRow label="Estimated Freight" value={formatCartCurrency(summary.freight)} showInfo />
      <SummaryRow label="GST (18%)" value={formatCartCurrency(summary.gst)} />
      <SummaryRow label="Platform Fee" value={formatCartCurrency(summary.platformFee)} muted />
      <SummaryRow
        label="Insurance"
        value={summary.insuranceIncluded ? 'Included' : formatCartCurrency(0)}
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
          {formatCartCurrency(summary.totalLandedCost)}
        </Typography>
      </View>
    </Animated.View>
  );
});
