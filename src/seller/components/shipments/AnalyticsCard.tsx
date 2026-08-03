import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { cn } from '@/utils/cn';

type AnalyticsCardProps = {
  label: string;
  value: string;
  accent?: 'default' | 'success' | 'danger';
};

export const AnalyticsCard = memo(function AnalyticsCard({
  label,
  value,
  accent = 'default',
}: AnalyticsCardProps) {
  const valueClass =
    accent === 'success'
      ? 'text-brand-success'
      : accent === 'danger'
        ? 'text-brand-error'
        : 'text-brand-heading';

  return (
    <View className="min-h-[84px] flex-1 rounded-2xl border border-brand-border bg-brand-white px-md py-md">
      <Typography variant="badge" className="text-[10px] uppercase tracking-wide text-brand-body">
        {label}
      </Typography>
      <Typography variant="headingLeft" className={cn('mt-sm text-[24px]', valueClass)}>
        {value}
      </Typography>
    </View>
  );
});
