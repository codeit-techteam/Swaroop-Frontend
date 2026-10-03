import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { BellIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type NotificationsEmptyStateProps = {
  className?: string;
};

export const NotificationsEmptyState = memo(function NotificationsEmptyState({
  className,
}: NotificationsEmptyStateProps) {
  return (
    <View
      className={cn(
        'items-center rounded-[24px] border border-brand-border bg-brand-white px-lg py-2xl',
        className,
      )}
    >
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-primary-light">
        <BellIcon size={28} color={brandColors.primaryDark} />
      </View>
      <Typography variant="roleTitle" className="mt-lg text-center">
        You&apos;re all caught up
      </Typography>
      <Typography variant="subheading" className="mt-sm text-center">
        No new notifications. Alerts for orders, payments, and shipments will appear here.
      </Typography>
    </View>
  );
});
