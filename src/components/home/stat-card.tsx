import { memo, type ReactNode } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

type StatCardProps = {
  label: string;
  value: string;
  trailing?: ReactNode;
  className?: string;
};

export const StatCard = memo(function StatCard({
  label,
  value,
  trailing,
  className,
}: StatCardProps) {
  return (
    <View className={cn('flex-1 rounded-lg bg-white/15 px-md py-md', className)}>
      <Typography variant="fieldLabel" className="text-[10px] tracking-[1px] text-brand-white/85">
        {label}
      </Typography>
      <View className="mt-xs flex-row items-center">
        <Typography variant="headingLeft" className="text-[20px] text-brand-white">
          {value}
        </Typography>
        {trailing ? <View className="ml-xs">{trailing}</View> : null}
      </View>
    </View>
  );
});
