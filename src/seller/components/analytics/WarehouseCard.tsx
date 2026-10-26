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
      <View className="flex-row items-center justify-between gap-md">
        <Typography variant="roleTitle" numberOfLines={1} className="flex-1">
          {warehouse.name}
        </Typography>
        <Typography variant="badge" className="shrink-0 tracking-[0.4px] text-brand-navy">
          {warehouse.capacityPercent}% Capacity
        </Typography>
      </View>
      <View className="mt-md h-2.5 overflow-hidden rounded-full bg-brand-surface">
        <View
          className="h-full rounded-full bg-brand-navy"
          style={{ width: `${Math.min(Math.max(warehouse.capacityPercent, 0), 100)}%` }}
        />
      </View>
      <View className="mt-md flex-row">
        <View className="flex-1 pr-sm">
          <Typography variant="legal" className="text-left text-brand-body">
            Available Stock
          </Typography>
          <Typography variant="roleTitle" numberOfLines={1} className="mt-xs text-brand-navy">
            {warehouse.availableStock}
          </Typography>
        </View>
        <View className="flex-1">
          <Typography variant="legal" className="text-left text-brand-body">
            Reserved
          </Typography>
          <Typography variant="roleTitle" numberOfLines={1} className="mt-xs text-brand-navy">
            {warehouse.reserved}
          </Typography>
        </View>
      </View>
    </View>
  );
});
