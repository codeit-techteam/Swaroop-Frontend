import { forwardRef, memo, useCallback, useState } from 'react';

import { Pressable, TextInput, View, type TextInput as TextInputType } from 'react-native';

import { MARKET_SEARCH_PLACEHOLDER } from '@/constants/marketProducts';
import { SearchIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: () => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
};

export const SearchBar = memo(
  forwardRef<TextInputType, SearchBarProps>(function SearchBar(
    {
      value,
      onChangeText,
      onFocus,
      onBlur,
      onSubmit,
      onClear,
      placeholder = MARKET_SEARCH_PLACEHOLDER,
      autoFocus = false,
      className,
    },
    ref,
  ) {
    const [focused, setFocused] = useState(false);
    const hasValue = value.trim().length > 0;

    const handleClear = useCallback(() => {
      // Prefer onClear so the parent can restore the browse list without
      // racing onChangeText('') → suggestions overlay → blank screen.
      if (onClear) {
        onClear();
        return;
      }
      onChangeText('');
    }, [onChangeText, onClear]);

    const handleFocus = useCallback(() => {
      setFocused(true);
      onFocus?.();
    }, [onFocus]);

    const handleBlur = useCallback(() => {
      setFocused(false);
      onBlur?.();
    }, [onBlur]);

    return (
      <View
        className={cn(
          'mx-lg flex-row items-center rounded-xl border bg-brand-surface px-md py-md',
          focused ? 'border-brand-primary' : 'border-brand-border',
          className,
        )}
      >
        <SearchIcon size={iconSizes.md} color={focused ? brandColors.primary : brandColors.muted} />
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={brandColors.muted}
          accessibilityRole="search"
          accessibilityLabel="Search marketplace products"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          clearButtonMode="never"
          returnKeyType="search"
          enablesReturnKeyAutomatically
          textContentType="none"
          importantForAutofill="no"
          className="ml-sm flex-1 font-sans text-[14px] text-brand-heading"
          style={{ paddingVertical: 0 }}
        />
        {hasValue ? (
          <Pressable
            onPress={handleClear}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            className="ml-sm h-5 w-5 items-center justify-center rounded-full bg-brand-overlay"
          >
            <View className="h-[1.5px] w-2.5 rotate-45 bg-brand-muted" />
            <View className="absolute h-[1.5px] w-2.5 -rotate-45 bg-brand-muted" />
          </Pressable>
        ) : null}
      </View>
    );
  }),
);
