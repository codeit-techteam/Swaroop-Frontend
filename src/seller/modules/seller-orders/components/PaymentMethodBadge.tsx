import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { PAYMENT_METHOD_LABELS } from '@/seller/modules/seller-orders/services/sellerOrdersService';
import type { SellerOrderPaymentMethod } from '@/seller/modules/seller-orders/types/sellerOrders';

export const PaymentMethodBadge = memo(function PaymentMethodBadge({
  method,
}: {
  method: SellerOrderPaymentMethod;
}) {
  return (
    <View className="rounded-lg bg-brand-surface px-sm py-xs">
      <Typography variant="legal" className="text-brand-heading">
        {PAYMENT_METHOD_LABELS[method]}
      </Typography>
    </View>
  );
});
