import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { cn } from '@/utils/cn';

import type { NotificationPriority } from '@/seller/types/notifications';

type NotificationBadgeProps = {
  label: string;
  priority?: NotificationPriority;
  className?: string;
};

const priorityStyles: Record<NotificationPriority, { container: string; text: string }> = {
  critical: {
    container: 'bg-brand-error-light',
    text: 'text-brand-error',
  },
  warning: {
    container: 'bg-[#FEF3E8]',
    text: 'text-[#B45309]',
  },
  info: {
    container: 'bg-brand-primary-light',
    text: 'text-brand-primary-dark',
  },
};

export const NotificationBadge = memo(function NotificationBadge({
  label,
  priority = 'info',
  className,
}: NotificationBadgeProps) {
  const styles = priorityStyles[priority];

  return (
    <View className={cn('rounded-full px-sm py-xs', styles.container, className)}>
      <Typography variant="badge" className={cn('text-[10px]', styles.text)}>
        {label}
      </Typography>
    </View>
  );
});
