import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

type StatusBadgeVariant = 'success' | 'primary' | 'muted';

type StatusBadgeProps = {
  label: string;
  variant?: StatusBadgeVariant;
  className?: string;
};

const variantClasses: Record<StatusBadgeVariant, string> = {
  success: 'bg-brand-success-light',
  primary: 'bg-brand-primary-light',
  muted: 'bg-brand-surface',
};

const textClasses: Record<StatusBadgeVariant, string> = {
  success: 'text-brand-success',
  primary: 'text-brand-primary',
  muted: 'text-brand-muted',
};

export const StatusBadge = memo(function StatusBadge({
  label,
  variant = 'success',
  className,
}: StatusBadgeProps) {
  return (
    <View className={cn('rounded-full px-sm py-xs', variantClasses[variant], className)}>
      <Typography variant="badge" className={cn('tracking-[0.6px]', textClasses[variant])}>
        {label}
      </Typography>
    </View>
  );
});
