import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { ClockIcon, ShieldCheckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { PAYMENT_METHOD_LABELS } from '@/seller/modules/seller-orders/services/sellerOrdersService';
import type { SellerOrder } from '@/seller/modules/seller-orders/types/sellerOrders';

const formatAmount = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const isCreditPayment = (order: SellerOrder): boolean =>
  order.paymentMethod === 'credit_15_days' || order.paymentMethod === 'credit_30_days';

const getPaymentStatusLabel = (order: SellerOrder): string => {
  if (order.paymentStatus === 'completed') {
    return 'Payment Completed';
  }
  if (order.paymentStatus === 'pending_after_loading') {
    return 'Payment Pending After Loading';
  }
  if (order.paymentStatus === 'pending_on_delivery') {
    return 'Payment Pending On Delivery';
  }
  return PAYMENT_METHOD_LABELS[order.paymentMethod];
};

export const CreditAssessmentCard = memo(function CreditAssessmentCard({
  order,
}: {
  order: SellerOrder;
}) {
  const showCredit = isCreditPayment(order);

  return (
    <View className="overflow-hidden rounded-[20px] border border-brand-border bg-brand-white">
      <View className="p-lg">
        <View className="flex-row items-start">
          {showCredit ? (
            <View className="mr-md h-14 w-14 items-center justify-center rounded-2xl border border-brand-border bg-brand-surface">
              <Typography variant="roleTitle" className="text-brand-primary">
                {order.buyerScore}%
              </Typography>
            </View>
          ) : (
            <View className="mr-md h-14 w-14 items-center justify-center rounded-2xl bg-brand-success-light">
              <ShieldCheckIcon size={22} color={brandColors.success} />
            </View>
          )}

          <View className="flex-1">
            <Typography variant="headingLeft" className="text-[18px]">
              {showCredit ? 'Credit Approved' : getPaymentStatusLabel(order)}
            </Typography>
            {showCredit ? (
              <View className="mt-xs flex-row items-center gap-sm">
                <View className="h-2 w-2 rounded-full bg-brand-success" />
                <Typography variant="legal" className="text-brand-body">
                  Eligible
                </Typography>
                <Typography variant="legal" className="text-brand-body">
                  Buyer ID: {order.buyerId}
                </Typography>
              </View>
            ) : (
              <Typography variant="legal" className="mt-xs text-left text-brand-body">
                Buyer ID: {order.buyerId}
              </Typography>
            )}
          </View>
        </View>

        {showCredit ? (
          <View className="mt-lg">
            <Typography variant="fieldLabel">APPROVED LIMIT</Typography>
            <Typography variant="headingLeft" className="mt-xs text-[32px] text-brand-primary">
              {formatAmount(order.creditLimit)}
            </Typography>
          </View>
        ) : null}
      </View>

      <View className="border-t border-brand-border bg-brand-surface px-lg py-md">
        <View className="flex-row items-center gap-sm">
          <ClockIcon size={16} color={brandColors.primaryDark} />
          <Typography variant="roleDescription">
            Payment: {getPaymentStatusLabel(order)}
          </Typography>
        </View>
        {showCredit ? (
          <View className="mt-sm flex-row items-center gap-sm">
            <ShieldCheckIcon size={16} color={brandColors.primaryDark} />
            <Typography variant="roleDescription">
              Trade Insurance: {order.insuranceStatus === 'active' ? 'Active' : 'Inactive'}
            </Typography>
          </View>
        ) : null}
      </View>
    </View>
  );
});
