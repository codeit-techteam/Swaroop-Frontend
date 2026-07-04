import { memo, type ReactNode, useState } from 'react';

import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type InputFieldProps = TextInputProps & {
  label: string;
  error?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  rightActionLabel?: string;
  onRightActionPress?: () => void;
  rightActionActive?: boolean;
  containerClassName?: string;
};

export const InputField = memo(function InputField({
  label,
  error,
  leftSlot,
  rightSlot,
  rightActionLabel,
  onRightActionPress,
  rightActionActive = false,
  containerClassName,
  className,
  onFocus,
  onBlur,
  ...props
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = Boolean(props.value && String(props.value).length > 0);

  return (
    <View className={cn('w-full', containerClassName)}>
      <Typography variant="fieldLabel" className="mb-sm">
        {label}
      </Typography>
      <View
        className={cn(
          'min-h-[48px] w-full flex-row items-center rounded-md border bg-brand-white px-md',
          focused || hasValue ? 'border-brand-primary' : 'border-brand-border',
          error && 'border-brand-error',
        )}
      >
        {leftSlot}
        <TextInput
          className={cn('flex-1 py-md font-sans text-[15px] text-brand-heading', className)}
          placeholderTextColor={brandColors.footer}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
        {rightActionLabel ? (
          <Pressable
            onPress={onRightActionPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={rightActionLabel}
          >
            <Typography
              variant="link"
              className={cn(
                'font-bold tracking-[0.6px]',
                rightActionActive ? 'text-brand-success' : 'text-brand-primary',
              )}
            >
              {rightActionActive ? 'VERIFIED' : rightActionLabel}
            </Typography>
          </Pressable>
        ) : null}
        {rightSlot}
      </View>
      {error ? (
        <Typography variant="error" className="mt-xs">
          {error}
        </Typography>
      ) : null}
    </View>
  );
});
