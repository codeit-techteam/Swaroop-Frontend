import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { cn } from '@/utils/cn';

type KpiCardProps = {
  label: string;
  value: string;
  accent?: 'default' | 'navy' | 'success';
  className?: string;
};

export const KpiCard = memo(function KpiCard({
  label,
  value,
  accent = 'default',
  className,
}: KpiCardProps) {
  const valueClass =
    accent === 'navy'
      ? 'text-[#0B4A8B]'
      : accent === 'success'
        ? 'text-brand-success'
        : 'text-brand-heading';

  return (
    <View
      className={cn(
        'min-h-[88px] flex-1 rounded-2xl border border-brand-border bg-brand-white px-md py-md',
        className,
      )}
    >
      <Typography variant="badge" className="text-[10px] uppercase tracking-wide text-brand-body">
        {label}
      </Typography>
      <Typography variant="headingLeft" className={cn('mt-sm text-[22px]', valueClass)}>
        {value}
      </Typography>
    </View>
  );
});
