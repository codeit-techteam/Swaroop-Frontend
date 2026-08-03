import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import type { DispatchOrder } from '@/seller/modules/dispatch/types/dispatch';

export const VehicleCard = memo(function VehicleCard({
  order,
}: {
  order: DispatchOrder;
}) {
  return (
    <View className="rounded-[22px] border border-brand-border bg-brand-white p-md">
      <Typography variant="badge" className="text-[11px] tracking-[1.2px] text-brand-body">
        TRANSPORT DETAILS
      </Typography>
      <View className="mt-md flex-row flex-wrap">
        {[
          { label: 'Vehicle No', value: order.vehicleNumber ?? 'Not assigned' },
          { label: 'Driver', value: order.driverName ?? 'Pending assignment' },
          { label: 'Driver Phone', value: order.driverPhone ?? 'Pending assignment' },
          { label: 'Loading Point', value: order.loadingPoint },
          { label: 'Destination', value: order.destination },
          { label: 'Capacity', value: order.vehicleCapacity ?? '--' },
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
