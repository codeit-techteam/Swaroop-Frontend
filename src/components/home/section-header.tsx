import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  className?: string;
};

export const SectionHeader = memo(function SectionHeader({
  title,
  actionLabel,
  onActionPress,
  className,
}: SectionHeaderProps) {
  return (
    <View className={cn('flex-row items-center justify-between px-lg', className)}>
      <Typography variant="roleTitle" className="text-[17px] text-brand-primary">
        {title}
      </Typography>

      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Typography
            variant="link"
            className="font-semibold text-[12px] tracking-[0.8px] text-brand-primary"
          >
            {actionLabel}
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
});
