import { memo, useCallback } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { MARKET_CATEGORIES } from '@/constants/marketProducts';
import { FilterIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { MarketCategory } from '@/types/market';
import { cn } from '@/utils/cn';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CategoryChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

const CategoryChip = memo(function CategoryChip({ label, selected, onPress }: CategoryChipProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 16, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 320 });
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Filter ${label}`}
      className={cn(
        'mr-sm rounded-lg border px-md py-sm',
        selected ? 'border-brand-border bg-brand-overlay' : 'border-brand-border bg-brand-white',
      )}
      style={animatedStyle}
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
    </AnimatedPressable>
  );
});

type CategoryFilterProps = {
  selectedCategory: MarketCategory | null;
  onSelectCategory: (category: MarketCategory | null) => void;
  onFilterPress?: () => void;
  className?: string;
};

export const CategoryFilter = memo(function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  onFilterPress,
  className,
}: CategoryFilterProps) {
  const filterScale = useSharedValue(1);

  const filterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: filterScale.value }],
  }));

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
        <AnimatedPressable
          onPress={onFilterPress}
          onPressIn={() => {
            filterScale.value = withSpring(0.96, { damping: 16, stiffness: 320 });
          }}
          onPressOut={() => {
            filterScale.value = withSpring(1, { damping: 16, stiffness: 320 });
          }}
          accessibilityRole="button"
          accessibilityLabel="Open filters"
          className="mr-sm flex-row items-center gap-xs rounded-lg bg-brand-primary px-md py-sm"
          style={filterAnimatedStyle}
        >
          <FilterIcon size={iconSizes.sm} color={brandColors.white} />
          <Typography variant="button" className="text-[13px] tracking-normal">
            Filter
          </Typography>
        </AnimatedPressable>

        <View className="mr-sm h-6 w-px bg-brand-border" />

        {MARKET_CATEGORIES.map((category) => (
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
