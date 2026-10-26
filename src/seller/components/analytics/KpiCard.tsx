import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { cn } from '@/utils/cn';

type KpiCardProps = {
  label: string;
  value: string;
  accent?: 'default' | 'navy' | 'success';
  /** Stretch to full row width (e.g. transit time). */
  fullWidth?: boolean;
  className?: string;
};

export const KpiCard = memo(function KpiCard({
  label,
  value,
  accent = 'default',
  fullWidth = false,
  className,
}: KpiCardProps) {
  const valueClass =
    accent === 'navy'
      ? 'text-brand-navy'
      : accent === 'success'
        ? 'text-brand-success'
        : 'text-brand-heading';

  return (
    <View
      className={cn(
        'min-h-[92px] rounded-2xl border border-brand-border bg-brand-white px-md py-md',
        fullWidth ? 'w-full' : 'min-w-[46%] flex-1 basis-[46%]',
        className,
      )}
    >
      <Typography
        variant="badge"
        numberOfLines={2}
        className="text-[10px] leading-[14px] tracking-[0.4px] text-brand-body"
      >
        {label}
      </Typography>
      <Typography
        variant="headingLeft"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        className={cn('mt-sm text-[22px] leading-[28px]', valueClass)}
      >
        {value}
      </Typography>
    </View>
  );
});
