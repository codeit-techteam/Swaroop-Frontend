import { memo, useMemo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { StoreIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

export const InventoryProgressCard = memo(function InventoryProgressCard({
  allocatedStock,
  reservedStock,
  remainingStock,
  compact = false,
}: {
  allocatedStock: number;
  reservedStock: number;
  remainingStock: number;
  compact?: boolean;
}) {
  const { progress, remainingPct, tone } = useMemo(() => {
    const total = Math.max(allocatedStock, 1);
    const used = allocatedStock - remainingStock;
    const remainingRatio = remainingStock / total;
    const barTone =
      remainingRatio <= 0.12 ? 'bg-brand-error' : remainingRatio <= 0.28 ? 'bg-[#F59E0B]' : 'bg-brand-navy';

    return {
      progress: Math.min(Math.max(used / total, 0), 1),
      remainingPct: Math.round(remainingRatio * 100),
      tone: barTone,
    };
  }, [allocatedStock, remainingStock]);

  const remainingLabel = `${remainingStock.toLocaleString('en-IN')} MT`;

  if (compact) {
    return (
      <View>
        <View className="flex-row items-center justify-between">
          <Typography variant="legal" className="text-left text-[11px] text-brand-body">
            Stock · {remainingPct}% left
          </Typography>
          <Typography
            variant="badge"
            className={cn(
              'text-[11px]',
              remainingPct <= 12 ? 'text-brand-error' : remainingPct <= 28 ? 'text-[#B45309]' : 'text-brand-heading',
            )}
          >
            {remainingLabel}
          </Typography>
        </View>
        <View className="mt-xs h-1.5 overflow-hidden rounded-full bg-brand-surface">
          <View className={cn('h-full rounded-full', tone)} style={{ width: `${progress * 100}%` }} />
        </View>
        {reservedStock > 0 ? (
          <Typography variant="legal" className="mt-xs text-left text-[10px] text-brand-primary-dark">
            {reservedStock.toLocaleString('en-IN')} MT reserved against quotes
          </Typography>
        ) : null}
      </View>
    );
  }

  return (
    <View className="px-md py-md">
      <View className="mb-sm flex-row items-center gap-xs">
        <StoreIcon size={14} color={brandColors.body} />
        <Typography variant="badge" className="text-[11px] tracking-[0.8px] text-brand-body">
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
        <View className={cn('h-full rounded-full', tone)} style={{ width: `${progress * 100}%` }} />
      </View>

      <View className="mt-sm flex-row items-center justify-between">
        <Typography
          variant="legal"
          className={cn(
            'text-left',
            remainingPct <= 12 ? 'text-brand-error' : remainingPct <= 28 ? 'text-[#B45309]' : 'text-brand-body',
          )}
        >
          Remaining: {remainingLabel}
        </Typography>
        <Typography variant="legal" className="text-brand-primary-dark">
          Reserved: {reservedStock.toLocaleString('en-IN')} MT
        </Typography>
      </View>
    </View>
  );
});
