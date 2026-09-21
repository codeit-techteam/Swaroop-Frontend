import { memo, useCallback } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { FilterIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { MarketCategory } from '@/types/market';
import { cn } from '@/utils/cn';

type CategoryChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

const CategoryChip = memo(function CategoryChip({ label, selected, onPress }: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Filter ${label}`}
      className={cn(
        'mr-sm rounded-lg border px-md py-sm',
        selected ? 'border-brand-border bg-brand-overlay' : 'border-brand-border bg-brand-white',
      )}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Typography
        variant="roleTitle"
        className={cn(
          'font-medium text-[13px]',
          selected ? 'text-brand-heading' : 'text-brand-muted',
        )}
      >
        {label}
      </Typography>
    </Pressable>
  );
});

type CategoryFilterProps = {
  categories: MarketCategory[];
  selectedCategory: MarketCategory | null;
  onSelectCategory: (category: MarketCategory | null) => void;
  onFilterPress?: () => void;
  className?: string;
};

export const CategoryFilter = memo(function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  onFilterPress,
  className,
}: CategoryFilterProps) {
  const handleCategoryPress = useCallback(
    (category: MarketCategory) => {
      onSelectCategory(selectedCategory === category ? null : category);
    },
    [onSelectCategory, selectedCategory],
  );

  return (
    <View className={cn('w-full', className)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="items-center px-lg"
      >
        <Pressable
          onPress={onFilterPress}
          accessibilityRole="button"
          accessibilityLabel="Open filters"
          className="mr-sm flex-row items-center gap-xs rounded-lg bg-brand-primary px-md py-sm"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <FilterIcon size={iconSizes.sm} color={brandColors.white} />
          <Typography variant="button" className="text-[13px] tracking-normal">
            Filter
          </Typography>
        </Pressable>

        <View className="mr-sm h-6 w-px bg-brand-border" />

        <CategoryChip
          label="All"
          selected={selectedCategory === null}
          onPress={() => onSelectCategory(null)}
        />

        {categories.map((category) => (
          <CategoryChip
            key={category}
            label={category}
            selected={selectedCategory === category}
            onPress={() => handleCategoryPress(category)}
          />
        ))}
      </ScrollView>
    </View>
  );
});
