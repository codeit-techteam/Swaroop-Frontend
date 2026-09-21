import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { formatInr } from '@/constants/productDetails';
import type { CheckoutQuote } from '@/types/checkout-quote';
import { cn } from '@/utils/cn';

type BuyingSummaryProps = {
  quote?: CheckoutQuote | null;
  loading?: boolean;
  error?: string | null;
  className?: string;
};

export const BuyingSummary = memo(function BuyingSummary({
  quote,
  loading = false,
  error = null,
  className,
}: BuyingSummaryProps) {
  const summary = quote
    ? {
        materialSubtotal: Number(quote.baseAmount),
        discount: Number(quote.discountAmount),
        freight: Number(quote.freightAmount),
        gst: Number(quote.taxAmount),
        gstLabel: `Estimated GST (${quote.taxRate}%)`,
        grandTotal: Number(quote.totalAmount),
      }
    : null;

  return (
    <View
      className={cn(
        'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <Typography variant="fieldLabel" className="text-[10px] tracking-[0.8px] text-brand-muted">
        Buying Summary
      </Typography>
      {error ? (
        <Typography variant="caption" className="mt-md font-sans text-[13px] normal-case text-brand-danger">
          {error}
        </Typography>
      ) : loading && !quote ? (
        <Typography variant="caption" className="mt-md font-sans text-[13px] normal-case text-brand-muted">
          Calculating total...
        </Typography>
      ) : !summary ? (
        <Typography variant="caption" className="mt-md font-sans text-[13px] normal-case text-brand-muted">
          Unable to load latest pricing
        </Typography>
      ) : (
        <View className="mt-md" style={{ gap: 8 }}>
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
