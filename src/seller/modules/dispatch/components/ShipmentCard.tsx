import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import type { DispatchOrder } from '@/seller/modules/dispatch/types/dispatch';

export const ShipmentCard = memo(function ShipmentCard({
  order,
}: {
  order: DispatchOrder;
}) {
  return (
    <View className="rounded-[22px] border border-brand-border bg-brand-white p-md">
      <Typography variant="headingLeft" className="text-[22px] text-brand-heading">
        Shipment Summary
      </Typography>
      <View className="mt-md flex-row flex-wrap">
        {[
          { label: 'Order', value: order.id.replace('PT-', '#') },
          { label: 'Vehicle', value: order.vehicleNumber ?? '--' },
          { label: 'Driver', value: order.driverName ?? '--' },
          { label: 'Dispatch Time', value: order.dispatchStartedAt ? 'Just now' : 'Pending' },
          { label: 'ETA', value: order.eta },
          { label: 'Destination', value: order.destination },
        ].map((item) => (
          <View key={item.label} className="mb-md w-1/2 pr-sm">
            <Typography variant="fieldLabel">{item.label}</Typography>
            <Typography variant="roleTitle" className="mt-xs">
              {item.value}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
});
