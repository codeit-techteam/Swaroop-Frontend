import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { OrderProgressTimeline } from '@/components/orders/OrderProgressTimeline';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { PrimaryButton, SecondaryButton, Typography } from '@/components/ui';
import {
  deriveOrderDisplayStatus,
  formatOrderDate,
  formatOrderNumber,
  getOrderProgressColor,
  getOrderProgressLabel,
} from '@/constants/orderStatus';
import { isPostDeliveryPaymentPending } from '@/constants/deliveryCompleted';
import { isCreditPaymentPending } from '@/constants/creditWorkflow';
import { CheckCircleIcon, ClipboardCheckIcon, MoreVerticalIcon, TruckIcon } from '@/icons';
import type { Order } from '@/types/order';
import { brandColors } from '@/theme/colors';
import { elevation } from '@/theme/shadows';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type OrderCardProps = {
  order: Order;
  onTrackOrder: (order: Order) => void;
  onViewDetails: (order: Order) => void;
  onPayNow?: (order: Order) => void;
  onMenuPress?: (order: Order) => void;
  className?: string;
};

const getProductCategoryLabel = (order: Order): string => {
  const categoryMap: Record<Order['productCategory'], string> = {
    PP: 'Polypropylene',
    PVC: 'PVC',
    HDPE: 'High-Density PE',
    LLDPE: 'Linear Low-Density PE',
    PET: 'Polyethylene Terephthalate',
  };

  return categoryMap[order.productCategory];
};

export const OrderCard = memo(function OrderCard({
  order,
  onTrackOrder,
  onViewDetails,
  onPayNow,
  onMenuPress,
  className,
}: OrderCardProps) {
  const displayStatus = deriveOrderDisplayStatus(order);
  const progressColor = getOrderProgressColor(order);
  const progressLabel = getOrderProgressLabel(order);
  const isInTransit = displayStatus === 'in_transit';
  const isProcessing = displayStatus === 'processing';
  const isPaymentVerified = order.paymentStatus === 'verified';
  const isDeliveryCompletedPendingPayment = isPostDeliveryPaymentPending(order);
  const isCreditPendingPayment = isCreditPaymentPending(order);
  const showPayNow = isDeliveryCompletedPendingPayment || isCreditPendingPayment;

  return (
    <View
      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 flex-row flex-wrap items-center gap-sm">
          <Typography variant="roleTitle" className="text-[14px] text-brand-primary">
            {formatOrderNumber(order.id)}
          </Typography>
          <OrderStatusBadge order={order} className="rounded-full" />
          {showPayNow ? (
            <View className="rounded-full bg-brand-primary-tint px-sm py-xs">
              <Typography variant="fieldLabel" className="text-[10px] text-brand-primary">
                PAYMENT PENDING
              </Typography>
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={() => onMenuPress?.(order)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Order options"
          className="h-8 w-8 items-center justify-center"
        >
          <MoreVerticalIcon color={brandColors.muted} />
        </Pressable>
      </View>

      <Typography variant="subheadingLeft" className="mt-xs text-[12px] text-brand-muted">
        {formatOrderDate(order.createdAt)}
      </Typography>

      <View className="mt-md rounded-xl bg-brand-surface px-md py-md">
        <View className="flex-row items-center gap-md">
          <View className="h-10 w-10 items-center justify-center rounded-lg bg-brand-primary-tint">
            <Typography variant="roleTitle" className="text-[11px] text-brand-primary">
              {order.productCategory}
            </Typography>
          </View>
          <View className="min-w-0 flex-1">
            <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
              {order.productName}
            </Typography>
            <Typography variant="subheadingLeft" className="mt-xs text-[13px] text-brand-body">
              {getProductCategoryLabel(order)} • {order.quantityMt} MT
            </Typography>
            <Typography variant="fieldLabel" className="mt-xs text-[11px] text-brand-muted">
              {order.paymentMethod}
            </Typography>
          </View>
        </View>
      </View>

      <View className="mt-md">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-xs">
            {isInTransit ? (
              <TruckIcon size={iconSizes.sm} color={brandColors.success} />
            ) : isProcessing ? (
              <ClipboardCheckIcon size={iconSizes.sm} color={brandColors.heading} />
            ) : null}
            <Typography
              variant="roleTitle"
              className={cn(
                'text-[13px]',
                isInTransit ? 'text-brand-success' : 'text-brand-heading',
              )}
            >
              {progressLabel}
            </Typography>
          </View>
          <Typography variant="fieldLabel" className="text-[11px] text-brand-muted">
            {order.progress}% Complete
          </Typography>
        </View>

        <OrderProgressTimeline
          order={order}
          progressColor={progressColor}
          className="mt-md"
        />
      </View>

      {isPaymentVerified && !isCreditPendingPayment ? (
        <View className="mt-md flex-row items-center gap-sm rounded-lg bg-brand-success-light px-md py-sm">
          <CheckCircleIcon size={iconSizes.sm} color={brandColors.success} />
          <Typography variant="subheadingLeft" className="text-[12px] text-brand-success">
            Payment Verified by PetroTrade
          </Typography>
        </View>
      ) : null}

      <View className="mt-md flex-row gap-sm">
        {showPayNow ? (
          <>
            <View className="flex-1">
              <PrimaryButton
                label="Pay Now"
                onPress={() => onPayNow?.(order)}
                className="py-md"
              />
            </View>
            <View className="flex-1">
              <SecondaryButton
                label="View Details"
                variant="outline"
                onPress={() => onViewDetails(order)}
                className="py-md"
              />
            </View>
          </>
        ) : (
          <>
            <View className="flex-1">
              <PrimaryButton
                label="Track Order"
                onPress={() => onTrackOrder(order)}
                className="py-md"
              />
            </View>
            <View className="flex-1">
              <SecondaryButton
                label="View Details"
                variant="outline"
                onPress={() => onViewDetails(order)}
                className="py-md"
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
});
