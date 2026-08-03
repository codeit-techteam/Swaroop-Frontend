import { memo, type ReactNode } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { StoreIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { SellerOrder } from '@/seller/modules/seller-orders/types/sellerOrders';

const formatAmount = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const OrderSummaryCard = memo(function OrderSummaryCard({ order }: { order: SellerOrder }) {
  return (
    <View className="rounded-[20px] border border-brand-border bg-brand-white p-lg">
      <View className="flex-row items-center justify-between">
        <Typography variant="headingLeft" className="text-[18px]">
          Material Details
        </Typography>
        <StoreIcon size={18} color={brandColors.primaryDark} />
      </View>

      <Typography variant="fieldLabel" className="mt-lg">
        POLYMER GRADE
      </Typography>
      <Typography variant="roleTitle" className="mt-xs">
        {order.material}
      </Typography>

      <View className="mt-lg flex-row">
        <View className="flex-1">
          <Typography variant="fieldLabel">Quantity</Typography>
          <Typography variant="roleTitle" className="mt-xs">
            {order.quantity} MT
          </Typography>
        </View>
        <View className="flex-1">
          <Typography variant="fieldLabel">Unit Price</Typography>
          <Typography variant="roleTitle" className="mt-xs">
            {formatAmount(order.unitPrice)}
          </Typography>
        </View>
      </View>

      <View className="my-lg h-px bg-brand-border" />

      <Typography variant="fieldLabel">TOTAL TRANSACTION VALUE</Typography>
      <Typography variant="headingLeft" className="mt-xs text-[28px] text-brand-primary">
        {formatAmount(order.value)}
      </Typography>
    </View>
  );
});

export const EligibilityCard = memo(function EligibilityCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="rounded-[20px] border border-brand-border bg-brand-white p-lg">
      <Typography variant="headingLeft" className="text-[18px]">
        {title}
      </Typography>
      <View className="mt-md">{children}</View>
    </View>
  );
});
