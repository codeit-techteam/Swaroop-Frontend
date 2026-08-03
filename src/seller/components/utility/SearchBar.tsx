import { memo } from 'react';

import { Pressable, TextInput, View } from 'react-native';

import { Typography } from '@/components';
import { FilterIcon, SearchIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  showFilter?: boolean;
  className?: string;
};

export const SearchBar = memo(function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  onFilterPress,
  showFilter = false,
  className,
}: SearchBarProps) {
  return (
    <View className={cn('flex-row items-center gap-sm', className)}>
      <View className="flex-1 flex-row items-center rounded-2xl border border-brand-border bg-brand-white px-md py-sm">
        <SearchIcon size={18} color={brandColors.body} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={brandColors.footer}
          className="ml-sm flex-1 font-sans text-[14px] text-brand-heading"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>
      {showFilter && onFilterPress ? (
        <Pressable
          onPress={onFilterPress}
          className="h-11 w-11 items-center justify-center rounded-2xl border border-brand-border bg-brand-white"
          style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
        >
          <FilterIcon size={18} color={brandColors.primaryDark} />
        </Pressable>
      ) : null}
    </View>
  );
});

type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export const FilterChip = memo(function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'rounded-full px-md py-sm',
        selected ? 'bg-brand-primary' : 'border border-brand-border bg-brand-white',
      )}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      <Typography
        variant="badge"
        className={cn('text-[12px]', selected ? 'text-brand-white' : 'text-brand-body')}
      >
        {label}
      </Typography>
    </Pressable>
  );
});

export const FilterTabRow = memo(function FilterTabRow({
  options,
  selected,
  onSelect,
}: {
  options: { label: string; value: string }[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-sm">
      {options.map((option) => (
        <FilterChip
          key={option.value}
          label={option.label}
          selected={selected === option.value}
          onPress={() => onSelect(option.value)}
        />
      ))}
    </View>
  );
});
