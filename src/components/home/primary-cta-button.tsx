import { memo } from 'react';

import { type GestureResponderEvent, Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

type PrimaryCTAButtonProps = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  className?: string;
  accessibilityLabel?: string;
};

export const PrimaryCTAButton = memo(function PrimaryCTAButton({
  label,
  onPress,
  className,
  accessibilityLabel,
}: PrimaryCTAButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      className={cn('overflow-hidden rounded-xl bg-brand-white px-lg py-md shadow-sm', className)}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View className="items-center justify-center">
        <Typography variant="button" className="text-[14px] tracking-[0.3px] text-brand-primary">
          {label}
        </Typography>
      </View>
    </Pressable>
  );
});
