import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { cn } from '@/utils/cn';

export const AmountCard = memo(function AmountCard({
  title,
  value,
  accent = 'default',
  className,
}: {
  title: string;
  value: string;
  accent?: 'default' | 'navy' | 'success' | 'warning';
  className?: string;
}) {
  const accentMap = {
    default: 'border-brand-border bg-brand-white',
    navy: 'border-brand-navy bg-brand-navy',
    success: 'border-brand-success/20 bg-brand-success-light',
    warning: 'border-[#F59E0B]/20 bg-[#FEF3E8]',
  } as const;

  const titleColor =
    accent === 'navy' ? 'text-brand-white/80' : accent === 'warning' ? 'text-[#B45309]' : 'text-brand-body';
  const valueColor =
    accent === 'navy' ? 'text-brand-white' : accent === 'success' ? 'text-brand-success' : 'text-brand-heading';

  return (
    <View className={cn('min-h-[96px] flex-1 rounded-[20px] border p-md', accentMap[accent], className)}>
      <Typography variant="legal" className={cn('text-left', titleColor)}>
        {title}
      </Typography>
      <Typography variant="headingLeft" className={cn('mt-sm text-[24px]', valueColor)}>
        {value}
      </Typography>
    </View>
  );
});
