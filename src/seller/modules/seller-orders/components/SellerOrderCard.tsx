import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { PrimaryButton, SecondaryButton, Typography } from '@/components';
import { ShieldCheckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { OrderStatusBadge } from '@/seller/modules/seller-orders/components/OrderStatusBadge';
import { PAYMENT_METHOD_LABELS } from '@/seller/modules/seller-orders/services/sellerOrdersService';
import type { SellerOrder } from '@/seller/modules/seller-orders/types/sellerOrders';

const formatAmount = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const SellerOrderCard = memo(function SellerOrderCard({
  order,
  onAccept,
  onReject,
  onViewDetails,
  onUploadLorryReceipt,
}: {
  order: SellerOrder;
  onAccept: (order: SellerOrder) => void;
  onReject: (order: SellerOrder) => void;
  onViewDetails: (order: SellerOrder) => void;
  onUploadLorryReceipt: (order: SellerOrder) => void;
}) {
  const renderActions = () => {
    switch (order.orderStatus) {
      case 'pending':
        return (
          <View className="mt-md flex-row gap-sm">
            <View className="flex-1">
              <PrimaryButton label="Accept Order" onPress={() => onAccept(order)} />
            </View>
            <View className="flex-1">
              <SecondaryButton label="Reject" variant="outline" onPress={() => onReject(order)} />
            </View>
          </View>
        );
      case 'accepted':
        return (
          <View className="mt-md flex-row items-center justify-between rounded-xl bg-brand-surface px-md py-md">
            <Typography variant="legal" className="text-brand-body">
              Processing Logistics...
            </Typography>
            <Pressable onPress={() => onViewDetails(order)}>
              <Typography variant="badge" className="text-brand-primary">
                View Details
              </Typography>
            </Pressable>
          </View>
        );
      case 'dispatch_pending':
        return (
          <View className="mt-md gap-sm">
            <PrimaryButton label="Upload Lorry Receipt" onPress={() => onUploadLorryReceipt(order)} />
            <Pressable onPress={() => onViewDetails(order)} className="items-center py-sm">
              <Typography variant="badge" className="text-brand-primary">
                View Details
              </Typography>
            </Pressable>
          </View>
        );
      case 'delivered':
        return (
          <View className="mt-md flex-row items-center gap-sm rounded-xl bg-brand-primary-light px-md py-md">
            <ShieldCheckIcon size={16} color={brandColors.primaryDark} />
            <Typography variant="roleTitle" className="text-brand-primary">
              Order Complete
            </Typography>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="rounded-[22px] border border-brand-border bg-brand-white p-lg">
      <View className="flex-row items-start justify-between">
        <Typography variant="badge" className="text-brand-heading">
          #{order.orderId}
        </Typography>
        <OrderStatusBadge status={order.orderStatus} compact />
      </View>

      <Typography variant="headingLeft" className="mt-sm text-[20px]">
        {order.material}
      </Typography>

      <View className="mt-md flex-row flex-wrap">
        {[
          { label: 'QUANTITY', value: `${order.quantity} MT` },
          { label: 'DESTINATION', value: order.city },
          { label: 'VALUE', value: formatAmount(order.value) },
          { label: 'PAYMENT', value: PAYMENT_METHOD_LABELS[order.paymentMethod] },
        ].map((item) => (
          <View key={item.label} className="mb-sm w-1/2 pr-sm">
            <Typography variant="fieldLabel">{item.label}</Typography>
            <Typography variant="roleTitle" className="mt-0.5 text-[14px]">
              {item.value}
            </Typography>
          </View>
        ))}
      </View>

      {renderActions()}
    </View>
  );
});
