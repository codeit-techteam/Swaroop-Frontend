import { memo } from 'react';

import { View } from 'react-native';


import { AnimatedCurrency } from '@/components/checkout/animated-currency';
import { Typography } from '@/components/ui/typography';
import { formatCheckoutCurrency } from '@/constants/checkout';
import { elevation } from '@/theme/shadows';
import type { CheckoutOrderSummary, CheckoutProductLine } from '@/types/checkout';
import { cn } from '@/utils/cn';

type OrderSummaryCardProps = {
  products: CheckoutProductLine[];
  summary: CheckoutOrderSummary;
  className?: string;
};

type SummaryRowProps = {
  label: string;
  value: string;
  muted?: boolean;
};

const SummaryRow = memo(function SummaryRow({ label, value, muted = false }: SummaryRowProps) {
  return (
    <View className="mb-sm flex-row items-center justify-between">
      <Typography
        variant="roleDescription"
        className={cn('text-[13px]', muted ? 'text-brand-muted' : 'text-brand-body')}
      >
        {label}
      </Typography>
      <Typography
        variant="roleDescription"
        className={cn('text-[13px]', muted ? 'text-brand-muted' : 'text-brand-heading')}
      >
        {value}
      </Typography>
    </View>
  );
});

export const CheckoutOrderSummaryCard = memo(function CheckoutOrderSummaryCard({
  products,
  summary,
  className,
}: OrderSummaryCardProps) {
  const primary = products[0];

  return (
    <View

      className={cn('mx-lg overflow-hidden rounded-2xl border border-brand-border bg-brand-white', className)}
      style={elevation.sm}
    >
      <View className="flex-row items-center justify-between bg-brand-cardBlue px-lg py-md">
        <Typography
          variant="fieldLabel"
          className="text-[11px] tracking-[1.2px] text-brand-white"
        >
          ORDER SUMMARY
        </Typography>
        <View className="rounded-full bg-brand-white/20 px-sm py-xs">
          <Typography variant="roleDescription" className="text-[10px] text-brand-white">
            B2B Contract
          </Typography>
        </View>
      </View>

      <View className="p-lg">
        {primary ? (
          <View className="mb-md flex-row items-start justify-between">
            <View className="mr-md flex-1">
              <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
                {primary.title}
              </Typography>
              <Typography variant="roleDescription" className="mt-xs text-[12px] text-brand-body">
                {primary.subtitle}
              </Typography>
            </View>
            <View className="items-end">
              <Typography variant="roleTitle" className="text-[18px] text-brand-primary">
                {primary.quantityMt} MT
              </Typography>
              <Typography variant="roleDescription" className="mt-xs text-[11px] text-brand-muted">
                {primary.packaging}
              </Typography>
            </View>
          </View>
        ) : null}

        {products.length > 1 ? (
          <View className="mb-md" style={{ gap: 8 }}>
            {products.slice(1).map((product) => (
              <View key={product.id} className="flex-row items-center justify-between">
                <Typography
                  variant="roleDescription"
                  className="mr-sm flex-1 text-[12px] text-brand-body"
                  numberOfLines={1}
                >
                  {product.title}
                </Typography>
                <Typography variant="roleDescription" className="text-[12px] text-brand-heading">
                  {product.quantityMt} MT
                </Typography>
              </View>
            ))}
          </View>
        ) : null}

        <View className="mb-md h-px bg-brand-border" />

        <SummaryRow label="Base Amount" value={formatCheckoutCurrency(summary.baseSubtotal)} />
        {summary.discount && summary.discount > 0 ? (
          <SummaryRow
            label="Discount"
            value={`−${formatCheckoutCurrency(summary.discount)}`}
          />
        ) : null}
        <SummaryRow label={summary.freightLabel} value={formatCheckoutCurrency(summary.freight)} />
        <SummaryRow label={summary.gstLabel ?? 'GST (18%)'} value={formatCheckoutCurrency(summary.gst)} />
        <SummaryRow
          label="Platform Fee"
          value={formatCheckoutCurrency(summary.platformFee)}
          muted
        />
        <SummaryRow
          label="Insurance"
          value={
            summary.insuranceIncluded
              ? 'Included'
              : formatCheckoutCurrency(summary.insuranceAmount ?? 0)
          }
          muted
        />

        <View className="my-md border-t border-dashed border-brand-border" />

        <View className="flex-row items-end justify-between">
          <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
            Total Payable
          </Typography>
          <AnimatedCurrency
            amount={summary.totalPayable}
            textClassName="font-sans text-[22px] font-semibold text-brand-primary"
          />
        </View>
      </View>
    </View>
  );
});
