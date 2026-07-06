import { memo, type ReactNode } from 'react';

import { type GestureResponderEvent, Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

type SecondaryButtonProps = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  className?: string;
  disabled?: boolean;
  variant?: 'solid' | 'outline';
  leftIcon?: ReactNode;
  accessibilityLabel?: string;
};

export const SecondaryButton = memo(function SecondaryButton({
  label,
  onPress,
  className,
  disabled = false,
  variant = 'solid',
  leftIcon,
  accessibilityLabel,
}: SecondaryButtonProps) {
  const isOutline = variant === 'outline';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      className={cn(
        'w-full flex-row items-center justify-center rounded-md px-xl py-lg',
        isOutline
          ? 'border border-brand-primary bg-brand-white'
          : disabled
            ? 'bg-brand-disabled'
            : 'bg-brand-secondary',
        className,
      )}
      style={({ pressed }) => ({ opacity: !disabled && pressed ? 0.85 : 1 })}
    >
      <View className="flex-row items-center justify-center gap-sm">
        {leftIcon}
        <Typography
          variant="buttonSecondary"
          className={isOutline ? 'text-brand-primary' : undefined}
        >
          {label}
        </Typography>
      </View>
    </Pressable>
  );
});
