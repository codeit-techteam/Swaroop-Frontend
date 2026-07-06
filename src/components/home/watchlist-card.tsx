import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import type { WatchlistItem } from '@/types/home';
import { cn } from '@/utils/cn';

type WatchlistCardProps = {
  item: WatchlistItem;
  onPress?: (item: WatchlistItem) => void;
  showDivider?: boolean;
  className?: string;
};

const trendColorClass = (trend: WatchlistItem['trend']): string => {
  if (trend === 'up') {
    return 'text-brand-success';
  }
  if (trend === 'down') {
    return 'text-brand-error';
  }
  return 'text-brand-muted';
};

const trendArrow = (trend: WatchlistItem['trend']): string => {
  if (trend === 'up') {
    return '▲';
  }
  if (trend === 'down') {
    return '▼';
  }
  return '●';
};

export const WatchlistCard = memo(function WatchlistCard({
  item,
  onPress,
  showDivider = false,
  className,
}: WatchlistCardProps) {
  return (
    <Pressable
      onPress={() => onPress?.(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.materialName}, ${item.priceLabel}, ${item.changePercent}`}
      className={cn('px-md py-md', showDivider && 'border-b border-brand-border', className)}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View className="flex-row items-center">
        <View className="mr-md h-11 w-11 items-center justify-center rounded-full bg-brand-primary-light">
          <Typography variant="badge" className="text-[12px] text-brand-primary">
            {item.initials}
          </Typography>
        </View>

        <View className="mr-sm flex-1">
          <Typography
            variant="roleTitle"
            className="text-[14px] text-brand-primary"
            numberOfLines={1}
          >
            {item.materialName}
          </Typography>
          <View className="mt-0.5 flex-row items-center gap-xs">
            <Typography
              variant="caption"
              className={cn(
                'font-sans text-[11px] normal-case tracking-normal',
                trendColorClass(item.trend),
              )}
            >
              {trendArrow(item.trend)} {item.changePercent}
            </Typography>
          </View>
        </View>

        <Typography variant="roleTitle" className="text-[14px] text-brand-primary">
          {item.priceLabel}
        </Typography>
      </View>
    </Pressable>
  );
});
