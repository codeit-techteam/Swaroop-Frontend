import { memo, useMemo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { formatInr, PRODUCT_GST_RATE } from '@/constants/productDetails';
import { cn } from '@/utils/cn';

type BuyingSummaryProps = {
  pricePerMt: number;
  quantity: number;
  freightPerMt: number;
  discountRate?: number;
  className?: string;
};

export const BuyingSummary = memo(function BuyingSummary({
  pricePerMt,
  quantity,
  freightPerMt,
  discountRate = 0,
  className,
}: BuyingSummaryProps) {
  const summary = useMemo(() => {
    const materialSubtotal = pricePerMt * quantity;
    const discount = Math.round(materialSubtotal * discountRate);
    const taxable = materialSubtotal - discount;
    const freight = freightPerMt * quantity;
    const gst = Math.round(taxable * PRODUCT_GST_RATE);
    const grandTotal = taxable + freight + gst;

    return { materialSubtotal, discount, freight, gst, grandTotal };
  }, [discountRate, freightPerMt, pricePerMt, quantity]);

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
            Estimated GST ({Math.round(PRODUCT_GST_RATE * 100)}%)
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
    </View>
  );
});
