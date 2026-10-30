import { memo } from 'react';

import { ActivityIndicator, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { formatInr } from '@/constants/productDetails';
import { formatEstimateMoney } from '@/services/marketplace-pricing';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';
import type { ProductQuoteEstimate } from '@/utils/product-quote-estimate';

type UnitPriceRow = {
  currency: string;
  unitPricePerMt: string;
  unitPricePerKg: string;
  note?: string | null;
};

type BuyingSummaryProps = {
  summary?: ProductQuoteEstimate | null;
  unitPrices?: UnitPriceRow | null;
  refreshing?: boolean;
  error?: string | null;
  className?: string;
};

export const BuyingSummary = memo(function BuyingSummary({
  summary,
  unitPrices = null,
  refreshing = false,
  error = null,
  className,
}: BuyingSummaryProps) {
  const showForeignNote =
    unitPrices && unitPrices.currency && unitPrices.currency.toUpperCase() !== 'INR';

  return (
    <View
      className={cn(
        'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <View className="flex-row items-center justify-between">
        <Typography variant="fieldLabel" className="text-[10px] tracking-[0.8px] text-brand-muted">
          Buying Summary
        </Typography>
        {refreshing ? (
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <ActivityIndicator size="small" color={brandColors.primary} />
            <Typography
              variant="caption"
              className="font-sans text-[10px] normal-case tracking-normal text-brand-primary"
            >
              Updating
            </Typography>
          </View>
        ) : null}
      </View>

      {unitPrices ? (
        <View className="mt-md rounded-lg bg-brand-surface px-md py-md" style={{ gap: 6 }}>
          <View className="flex-row items-center justify-between">
            <Typography
              variant="caption"
              className="font-sans text-[12px] normal-case tracking-normal text-brand-muted"
            >
              Unit price / MT
            </Typography>
            <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
              {unitPrices.currency.toUpperCase() === 'INR'
                ? formatEstimateMoney(unitPrices.unitPricePerMt)
                : `${unitPrices.currency} ${unitPrices.unitPricePerMt}`}
            </Typography>
          </View>
          <View className="flex-row items-center justify-between">
            <Typography
              variant="caption"
              className="font-sans text-[12px] normal-case tracking-normal text-brand-muted"
            >
              Unit price / kg
            </Typography>
            <Typography variant="roleTitle" className="text-[14px] text-brand-primary">
              {unitPrices.currency.toUpperCase() === 'INR'
                ? formatEstimateMoney(unitPrices.unitPricePerKg)
                : `${unitPrices.currency} ${unitPrices.unitPricePerKg}`}
            </Typography>
          </View>
          {showForeignNote ? (
            <Typography
              variant="caption"
              className="mt-xs font-sans text-[11px] normal-case tracking-normal text-brand-muted"
            >
              {unitPrices.note ??
                'Offer currency is not INR. No foreign→INR conversion without a configured exchange rate.'}
            </Typography>
          ) : null}
        </View>
      ) : null}

      {error && !summary ? (
        <Typography
          variant="caption"
          className="text-brand-danger mt-md font-sans text-[13px] normal-case"
        >
          {error}
        </Typography>
      ) : !summary ? (
        <Typography
          variant="caption"
          className="mt-md font-sans text-[13px] normal-case text-brand-muted"
        >
          Select a quantity to see the estimated total.
        </Typography>
      ) : (
        <View className="mt-md" style={{ gap: 8, opacity: refreshing ? 0.82 : 1 }}>
          <View className="flex-row items-center justify-between">
            <Typography
              variant="caption"
              className="font-sans text-[13px] normal-case tracking-normal text-brand-muted"
            >
              Subtotal
            </Typography>
            <Typography variant="roleTitle" className="text-[13px] text-brand-heading">
              {formatInr(summary.materialSubtotal)}
            </Typography>
          </View>
          {summary.discount > 0 ? (
            <View className="flex-row items-center justify-between">
              <Typography
                variant="caption"
                className="font-sans text-[13px] normal-case tracking-normal text-brand-muted"
              >
                Advance discount
              </Typography>
              <Typography variant="success" className="text-[13px]">
                −{formatInr(summary.discount)}
              </Typography>
            </View>
          ) : null}
          <View className="flex-row items-center justify-between">
            <Typography
              variant="caption"
              className="font-sans text-[13px] normal-case tracking-normal text-brand-muted"
            >
              Delivery charges
            </Typography>
            <Typography variant="roleTitle" className="text-[13px] text-brand-heading">
              {formatInr(summary.freight)}
            </Typography>
          </View>
          <View className="flex-row items-center justify-between">
            <Typography
              variant="caption"
              className="font-sans text-[13px] normal-case tracking-normal text-brand-muted"
            >
              {summary.gstLabel}
            </Typography>
            <Typography variant="roleTitle" className="text-[13px] text-brand-heading">
              {formatInr(summary.gst)}
            </Typography>
          </View>
          <View className="mt-xs flex-row items-center justify-between border-t border-brand-border pt-sm">
            <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
              Estimated total
            </Typography>
            <Typography variant="roleTitle" className="text-[16px] text-brand-primary">
              {formatInr(summary.grandTotal)}
            </Typography>
          </View>
        </View>
      )}
    </View>
  );
});
