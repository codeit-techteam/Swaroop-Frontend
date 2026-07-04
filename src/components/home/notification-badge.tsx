import { memo } from 'react';

import { View } from 'react-native';

import { cn } from '@/utils/cn';

type NotificationBadgeProps = {
  visible?: boolean;
  className?: string;
};

export const NotificationBadge = memo(function NotificationBadge({
  visible = true,
  className,
}: NotificationBadgeProps) {
  if (!visible) {
    return null;
  }

  return (
    <View
      className={cn(
        'absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-brand-notification-dot',
        className,
      )}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
});
