import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { PrimaryButton, SecondaryButton, Typography } from '@/components';
import { MoreVerticalIcon } from '@/icons';
import { brandColors } from '@/theme/colors';

import { DispatchStatusBadge } from '@/seller/modules/dispatch/components/DispatchStatusBadge';
import type { DispatchOrder } from '@/seller/modules/dispatch/types/dispatch';

const getPrimaryButtonLabel = (order: DispatchOrder): string | null => {
  if (order.stage === 'in_transit' || order.stage === 'dispatched' || order.stage === 'delayed') {
    return 'Track Shipment';
  }
  if (order.stage === 'delivered') {
    return 'View Delivery';
  }
  if (!order.invoiceNumber) {
    return 'Generate Invoice';
  }
  if (!order.vehicleNumber) {
    return 'Assign Vehicle';
  }
  return null;
};

export const DispatchOrderCard = memo(function DispatchOrderCard({
  order,
  onPrimaryAction,
  onViewDispatch,
}: {
  order: DispatchOrder;
  onPrimaryAction: (order: DispatchOrder) => void;
  onViewDispatch: (order: DispatchOrder) => void;
}) {
  const primaryLabel = getPrimaryButtonLabel(order);

  return (
    <View className="rounded-[24px] border border-brand-border bg-brand-white p-lg">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-sm">
          <Typography variant="headingLeft" className="text-[28px] text-brand-heading">
            {order.id.replace('PT-', '#')}
          </Typography>
          <Typography variant="roleDescription" className="mt-xs text-left text-brand-body">
            ETA
          </Typography>
          <Typography variant="roleTitle" className="mt-0.5">
            {order.orderDateTime}
          </Typography>
        </View>
        <View className="items-end gap-sm">
          <DispatchStatusBadge stage={order.stage} />
          <Pressable className="h-8 w-8 items-center justify-center">
            <MoreVerticalIcon size={16} color={brandColors.body} />
          </Pressable>
        </View>
      </View>

      <View className="my-md h-px bg-brand-border" />

      <View className="flex-row flex-wrap">
        {[
          { label: 'Material', value: order.material },
          { label: 'Quantity', value: `${order.quantityMt} MT` },
          {
            label: 'Vehicle',
            value:
              order.vehicleStatus === 'assigned'
                ? order.vehicleNumber ?? 'Assigned'
                : order.vehicleStatus === 'assigning'
                  ? 'Assigning...'
                  : 'Not Assigned',
          },
          { label: 'Payment', value: order.paymentStatus === 'verified' ? 'Verified' : 'Pending' },
        ].map((item) => (
          <View key={item.label} className="mb-md w-1/2 pr-sm">
            <Typography variant="fieldLabel">{item.label}</Typography>
            <Typography variant="roleTitle" className="mt-xs">
              {item.value}
            </Typography>
          </View>
        ))}
      </View>

      <View className="mt-sm flex-row gap-sm">
        {primaryLabel ? (
          <View className="flex-1">
            <PrimaryButton label={primaryLabel} onPress={() => onPrimaryAction(order)} />
          </View>
        ) : null}
        <View className="flex-1">
          <SecondaryButton label="View Dispatch" variant="outline" onPress={() => onViewDispatch(order)} />
        </View>
      </View>
    </View>
  );
});
