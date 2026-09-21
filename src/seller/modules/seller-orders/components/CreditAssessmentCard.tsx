import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { ClockIcon, ShieldCheckIcon } from '@/icons';
import { PAYMENT_METHOD_LABELS } from '@/seller/modules/seller-orders/services/sellerOrdersService';
import type { SellerOrder } from '@/seller/modules/seller-orders/types/sellerOrders';
import { PETROTRADE_CREDIT_LABEL, PETROTRADE_CREDIT_NOTE } from '@/seller/utils/pricing';
import { brandColors } from '@/theme/colors';

const isCreditPayment = (order: SellerOrder): boolean =>
  order.paymentMethod === 'credit_15_days' || order.paymentMethod === 'credit_30_days';

const getPaymentStatusLabel = (order: SellerOrder): string => {
  if (isCreditPayment(order)) {
    return PETROTRADE_CREDIT_LABEL;
  }
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
          <View className="mr-md h-14 w-14 items-center justify-center rounded-2xl bg-brand-success-light">
            <ShieldCheckIcon size={22} color={brandColors.success} />
          </View>

          <View className="flex-1">
            <Typography variant="headingLeft" className="text-[18px]">
              {showCredit ? PETROTRADE_CREDIT_LABEL : getPaymentStatusLabel(order)}
            </Typography>
            <Typography variant="legal" className="mt-xs text-left text-brand-body">
              Buyer ID: {order.buyerId}
            </Typography>
          </View>
        </View>

        {showCredit ? (
          <Typography variant="legal" className="mt-lg text-left text-brand-body">
            {PETROTRADE_CREDIT_NOTE} Seller credit configuration is not required.
          </Typography>
        ) : null}
      </View>

      <View className="border-t border-brand-border bg-brand-surface px-lg py-md">
        <View className="flex-row items-center gap-sm">
          <ClockIcon size={16} color={brandColors.primaryDark} />
          <Typography variant="roleDescription">Payment: {getPaymentStatusLabel(order)}</Typography>
        </View>
      </View>
    </View>
  );
});
