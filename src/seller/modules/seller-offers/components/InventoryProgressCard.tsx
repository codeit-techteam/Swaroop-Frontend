import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { StoreIcon } from '@/icons';
import { brandColors } from '@/theme/colors';

export const InventoryProgressCard = memo(function InventoryProgressCard({
  allocatedStock,
  reservedStock,
  remainingStock,
}: {
  allocatedStock: number;
  reservedStock: number;
  remainingStock: number;
}) {
  const total = Math.max(allocatedStock, 1);
  const used = allocatedStock - remainingStock;
  const progress = Math.min(Math.max(used / total, 0), 1);

  return (
    <View className="border-t border-brand-border px-md py-md">
      <View className="mb-sm flex-row items-center gap-xs">
        <StoreIcon size={14} color={brandColors.body} />
        <Typography variant="badge" className="text-[11px] text-brand-body">
          STOCK STATUS
        </Typography>
      </View>

      <View className="flex-row items-center justify-between">
        <Typography variant="legal" className="text-left text-brand-body">
          Allocated Stock
        </Typography>
        <Typography variant="roleTitle">{allocatedStock.toLocaleString('en-IN')} MT</Typography>
      </View>

      <View className="mt-sm h-2 overflow-hidden rounded-full bg-brand-surface">
        <View
          className="h-full rounded-full bg-brand-navy"
          style={{ width: `${progress * 100}%` }}
        />
      </View>

      <View className="mt-sm flex-row items-center justify-between">
        <Typography variant="legal" className="text-left text-brand-body">
          Remaining: {remainingStock.toLocaleString('en-IN')} MT
        </Typography>
        <Typography variant="legal" className="text-brand-primary">
          Reserved: {reservedStock.toLocaleString('en-IN')} MT
        </Typography>
      </View>
    </View>
  );
});
