import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import type { WarehouseAnalytics } from '@/seller/types/analytics';

export const WarehouseCard = memo(function WarehouseCard({
  warehouse,
}: {
  warehouse: WarehouseAnalytics;
}) {
  return (
    <View className="mb-md rounded-2xl border border-brand-border bg-brand-white px-md py-md">
      <View className="flex-row items-center justify-between">
        <Typography variant="roleTitle">{warehouse.name}</Typography>
        <Typography variant="badge" className="text-[#0B4A8B]">
          {warehouse.capacityPercent}% Capacity
        </Typography>
      </View>
      <View className="mt-md h-2 overflow-hidden rounded-full bg-brand-surface">
        <View
          className="h-full rounded-full bg-[#0B4A8B]"
          style={{ width: `${warehouse.capacityPercent}%` }}
        />
      </View>
      <View className="mt-md flex-row">
        <View className="flex-1">
          <Typography variant="legal" className="text-left text-brand-body">
            Available Stock
          </Typography>
          <Typography variant="roleTitle" className="mt-xs">
            {warehouse.availableStock}
          </Typography>
        </View>
        <View className="flex-1">
          <Typography variant="legal" className="text-left text-brand-body">
            Reserved
          </Typography>
          <Typography variant="roleTitle" className="mt-xs">
            {warehouse.reserved}
          </Typography>
        </View>
      </View>
    </View>
  );
});
