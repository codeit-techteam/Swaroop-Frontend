import { memo, type ReactNode } from 'react';

import { ActivityIndicator, type GestureResponderEvent, Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { ArrowRightIcon } from '@/icons/arrow-right';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type PrimaryButtonProps = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  className?: string;
  showArrow?: boolean;
  leftIcon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
};

export const PrimaryButton = memo(function PrimaryButton({
  label,
  onPress,
  className,
  showArrow = false,
  leftIcon,
  disabled = false,
  loading = false,
  accessibilityLabel,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      className={cn(
        'w-full flex-row items-center justify-center rounded-md px-xl py-lg shadow-sm',
        isDisabled ? 'bg-brand-disabled' : 'bg-brand-primary',
        className,
      )}
      style={({ pressed }) => ({ opacity: !isDisabled && pressed ? 0.85 : 1 })}
    >
      {loading ? (
        <ActivityIndicator color={brandColors.white} />
      ) : (
        <View className="flex-row items-center justify-center gap-sm">
          {leftIcon}
          <Typography variant="button">{label}</Typography>
          {showArrow ? <ArrowRightIcon /> : null}
        </View>
      )}
    </Pressable>
  );
});
