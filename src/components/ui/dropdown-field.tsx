import { memo, useState } from 'react';

import { Modal, Pressable, ScrollView, View } from 'react-native';

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
  const [open, setOpen] = useState(false);
  const hasValue = Boolean(value);

  return (
    <View className={cn('w-full', containerClassName)}>
      <Typography variant="fieldLabel" className="mb-sm">
        {label}
      </Typography>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
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

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 items-center justify-end bg-black/40"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="max-h-[50%] w-full rounded-t-2xl bg-brand-white px-xl pb-2xl pt-lg"
            onPress={(event) => event.stopPropagation()}
          >
            <Typography variant="headingLeft" className="mb-md text-[18px]">
              {label}
            </Typography>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => {
                const selected = option === value;
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                    className={cn('rounded-md px-md py-md', selected && 'bg-brand-primary-light')}
                  >
                    <Typography
                      variant="body"
                      className={
                        selected ? 'font-semibold text-brand-primary' : 'text-brand-heading'
                      }
                    >
                      {option}
                    </Typography>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
});
