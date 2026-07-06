import { memo } from 'react';

import { View } from 'react-native';

import { Image } from 'expo-image';


import { Typography } from '@/components/ui/typography';
import { formatPaymentCurrency } from '@/constants/payment';
import { DocumentFileIcon, StoreIcon, TruckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

export type PaymentOrderSummary = {
  productName: string;
  grade: string;
  quantityMt: number;
  imageUrl?: string;
  pickupLabel: string;
  destinationLabel: string;
  totalAmount: number;
};

type PaymentSummaryCardProps = {
  summary: PaymentOrderSummary;
  className?: string;
};

export const PaymentSummaryCard = memo(function PaymentSummaryCard({
  summary,
  className,
}: PaymentSummaryCardProps) {
  return (
    <View

      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <View className="mb-md flex-row items-center">
        <DocumentFileIcon size={iconSizes.sm} color={brandColors.heading} />
        <Typography variant="roleTitle" className="ml-sm text-[15px] text-brand-heading">
          Order Summary
        </Typography>
      </View>

      <View className="flex-row">
        {summary.imageUrl ? (
          <View className="mr-md h-14 w-14 overflow-hidden rounded-xl bg-brand-surface">
            <Image
              source={{ uri: summary.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={0}
              accessibilityLabel={`${summary.productName} product image`}
            />
          </View>
        ) : null}

        <View className="flex-1">
          <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
            {summary.productName}
          </Typography>
          <Typography variant="roleDescription" className="mt-xs text-[12px] text-brand-body">
            Grade: {summary.grade} | Qty: {summary.quantityMt} MT
          </Typography>
        </View>
      </View>

      <View className="mt-md" style={{ gap: 8 }}>
        <View className="flex-row items-center">
          <StoreIcon size={iconSizes.sm} color={brandColors.muted} />
          <Typography
            variant="fieldLabel"
            className="ml-sm flex-1 text-[10px] tracking-[0.5px] text-brand-body"
          >
            DISPATCH FROM {summary.pickupLabel}
          </Typography>
        </View>
        <View className="flex-row items-center">
          <TruckIcon size={iconSizes.sm} color={brandColors.muted} />
          <Typography
            variant="fieldLabel"
            className="ml-sm flex-1 text-[10px] tracking-[0.5px] text-brand-body"
          >
            DESTINATION {summary.destinationLabel}
          </Typography>
        </View>
      </View>

      <View className="mt-md flex-row items-center justify-between border-t border-brand-border pt-md">
        <Typography variant="roleDescription" className="text-[13px] text-brand-body">
          Total Amount
        </Typography>
        <Typography variant="roleTitle" className="text-[18px] text-brand-heading">
          {formatPaymentCurrency(summary.totalAmount)}
        </Typography>
      </View>
    </View>
  );
});
