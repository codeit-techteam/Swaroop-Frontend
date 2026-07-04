import { memo } from 'react';

import { TextInput, View } from 'react-native';

import { MARKET_SEARCH_PLACEHOLDER } from '@/constants/marketProducts';
import { SearchIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
};

export const SearchBar = memo(function SearchBar({
  value,
  onChangeText,
  placeholder = MARKET_SEARCH_PLACEHOLDER,
  className,
}: SearchBarProps) {
  return (
    <View
      className={cn(
        'mx-lg flex-row items-center rounded-xl border border-brand-border bg-brand-surface px-md py-md',
        className,
      )}
    >
      <SearchIcon size={iconSizes.md} color={brandColors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={brandColors.muted}
        accessibilityLabel={placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        returnKeyType="search"
        className="ml-sm flex-1 font-sans text-[14px] text-brand-heading"
        style={{ paddingVertical: 0 }}
      />
    </View>
  );
});
