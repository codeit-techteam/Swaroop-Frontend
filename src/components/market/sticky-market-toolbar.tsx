import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { FilterIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type StickyMarketToolbarProps = {
  resultLabel: string;
  filterLabel: string;
  sortLabel?: string;
  onFilterPress: () => void;
  onSortPress?: () => void;
  onClearFilters?: () => void;
  showClear?: boolean;
  className?: string;
};

/**
 * Sticky Sort | Filter control row for the Market screen.
 * Kept compact so product cards remain in the first viewport.
 */
export const StickyMarketToolbar = memo(function StickyMarketToolbar({
  resultLabel,
  filterLabel,
  sortLabel = 'Sort',
  onFilterPress,
  onSortPress,
  onClearFilters,
  showClear = false,
  className,
}: StickyMarketToolbarProps) {
  return (
    <View
      className={cn(
        'border-b border-brand-border bg-brand-white px-lg py-sm',
        className,
      )}
      accessibilityRole="toolbar"
      accessibilityLabel="Market sort and filter"
    >
      <View className="flex-row items-center gap-sm">
        <Typography
          variant="caption"
          className="min-w-0 flex-1 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
          numberOfLines={1}
        >
          {resultLabel}
        </Typography>

        {showClear && onClearFilters ? (
          <Pressable
            onPress={onClearFilters}
            accessibilityRole="button"
            accessibilityLabel="Clear filters"
            hitSlop={8}
            className="min-h-[40px] justify-center px-sm"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Typography
              variant="caption"
              className="font-sans text-[12px] normal-case tracking-normal text-brand-primary"
            >
              Clear
            </Typography>
          </Pressable>
        ) : null}

        {onSortPress ? (
          <Pressable
            onPress={onSortPress}
            accessibilityRole="button"
            accessibilityLabel={sortLabel}
            hitSlop={6}
            className="min-h-[40px] min-w-[44px] items-center justify-center rounded-lg border border-brand-border px-md"
            style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
          >
            <Typography variant="roleTitle" className="text-[13px] text-brand-heading">
              {sortLabel}
            </Typography>
          </Pressable>
        ) : null}

        <Pressable
          onPress={onFilterPress}
          accessibilityRole="button"
          accessibilityLabel={filterLabel}
          hitSlop={6}
          className="min-h-[40px] min-w-[44px] flex-row items-center gap-xs rounded-lg bg-brand-primary px-md"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <FilterIcon size={iconSizes.sm} color={brandColors.white} />
          <Typography variant="button" className="text-[13px] tracking-normal">
            {filterLabel}
          </Typography>
        </Pressable>
      </View>
    </View>
  );
});
