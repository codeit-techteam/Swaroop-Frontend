import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { MarketTabIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type EmptyStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  className?: string;
};

export const EmptyState = memo(function EmptyState({
  title = 'No materials found',
  description = 'Try a different grade, category, or search term.',
  actionLabel,
  onActionPress,
  className,
}: EmptyStateProps) {
  return (
    <View className={cn('items-center px-xl py-3xl', className)}>
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-primary-tint">
        <MarketTabIcon color={brandColors.primary} />
      </View>
      <Typography variant="roleTitle" className="mt-lg text-center text-brand-heading">
        {title}
      </Typography>
      <Typography variant="subheading" className="mt-sm text-center text-brand-muted">
        {description}
      </Typography>
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          className="mt-lg rounded-lg bg-brand-primary px-lg py-sm"
        >
          <Typography variant="button" className="text-[13px] tracking-normal">
            {actionLabel}
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
});
