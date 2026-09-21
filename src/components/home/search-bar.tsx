import { memo } from 'react';

import { Pressable } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { HOME_SEARCH_PLACEHOLDER } from '@/constants/dashboard';
import { FilterIcon, SearchIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type SearchBarProps = {
  placeholder?: string;
  onPress: () => void;
  onFilterPress?: () => void;
  className?: string;
};

export const SearchBar = memo(function SearchBar({
  placeholder = HOME_SEARCH_PLACEHOLDER,
  onPress,
  onFilterPress,
  className,
}: SearchBarProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="search"
      accessibilityLabel={placeholder}
      accessibilityHint="Opens Market search"
      className={cn(
        'mx-lg flex-row items-center rounded-xl border border-brand-border bg-brand-white px-md py-md',
        className,
      )}
    >
      <SearchIcon color={brandColors.muted} />
      <Typography
        variant="input"
        className="ml-sm flex-1 text-[14px] text-brand-muted"
        numberOfLines={1}
      >
        {placeholder}
      </Typography>
      <Pressable
        onPress={onFilterPress ?? onPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Open Market filters"
        className="pl-sm"
      >
        <FilterIcon color={brandColors.primary} />
      </Pressable>
    </Pressable>
  );
});
