import { memo, useCallback, useState } from 'react';

import { Pressable, View } from 'react-native';

import { AppBottomSheetPicker } from '@/components/ui/app-bottom-sheet-picker';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

type DropdownFieldProps = {
  label: string;
  value: string;
  options: readonly string[];
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  containerClassName?: string;
};

export const DropdownField = memo(function DropdownField({
  label,
  value,
  options,
  placeholder = 'Select option',
  error,
  onChange,
  disabled = false,
  containerClassName,
}: DropdownFieldProps) {
  const [visible, setVisible] = useState(false);
  const hasValue = Boolean(value);

  const openPicker = useCallback(() => {
    if (disabled) {
      return;
    }
    setVisible(true);
  }, [disabled]);

  const closePicker = useCallback(() => {
    setVisible(false);
  }, []);

  const handleSelect = useCallback(
    (selected: string) => {
      onChange(selected);
    },
    [onChange],
  );

  return (
    <View className={cn('w-full', containerClassName)}>
      <Typography variant="fieldLabel" className="mb-sm">
        {label}
      </Typography>
      <Pressable
        disabled={disabled}
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={label}
        className={cn(
          'min-h-[48px] w-full flex-row items-center justify-between rounded-md border bg-brand-white px-md',
          hasValue ? 'border-brand-primary' : 'border-brand-border',
          error && 'border-brand-error',
          disabled && 'opacity-50',
        )}
      >
        <Typography
          variant="input"
          className={cn(!hasValue && 'text-brand-footer')}
          numberOfLines={1}
        >
          {hasValue ? value : placeholder}
        </Typography>
        <Typography variant="input" className="text-brand-muted">
          ▾
        </Typography>
      </Pressable>
      {error ? (
        <Typography variant="error" className="mt-xs">
          {error}
        </Typography>
      ) : null}

      <AppBottomSheetPicker
        title={label}
        items={options}
        selectedValue={value}
        onSelect={handleSelect}
        visible={visible}
        onClose={closePicker}
      />
    </View>
  );
});
