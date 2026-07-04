import { memo } from 'react';

import { View } from 'react-native';

import Animated, { FadeIn } from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { MarketTabIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type EmptyStateProps = {
  title?: string;
  description?: string;
  className?: string;
};

export const EmptyState = memo(function EmptyState({
  title = 'No materials found',
  description = 'Try a different grade, category, or search term.',
  className,
}: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(280)}
      className={cn('items-center px-xl py-3xl', className)}
    >
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-primary-tint">
        <MarketTabIcon color={brandColors.primary} />
      </View>
      <Typography variant="roleTitle" className="mt-lg text-center text-brand-heading">
        {title}
      </Typography>
      <Typography variant="subheading" className="mt-sm text-center text-brand-muted">
        {description}
      </Typography>
    </Animated.View>
  );
});
