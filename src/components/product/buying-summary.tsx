import { memo } from 'react';

import { ActivityIndicator, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { formatInr } from '@/constants/productDetails';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';
import type { ProductQuoteEstimate } from '@/utils/product-quote-estimate';

type BuyingSummaryProps = {
  summary?: ProductQuoteEstimate | null;
  refreshing?: boolean;
  error?: string | null;
  className?: string;
};

export const BuyingSummary = memo(function BuyingSummary({
  summary,
  refreshing = false,
  error = null,
  className,
}: BuyingSummaryProps) {
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
              Price
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
                Discount
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
              Estimated Freight
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
              Grand Total
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
