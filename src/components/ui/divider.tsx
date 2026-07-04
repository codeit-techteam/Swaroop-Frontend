import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

type DividerProps = {
  label?: string;
  className?: string;
};

export const Divider = memo(function Divider({ label = 'OR', className }: DividerProps) {
  return (
    <View className={cn('w-full flex-row items-center gap-md', className)}>
      <View className="h-px flex-1 bg-brand-border" />
      <Typography variant="fieldLabel" className="text-brand-muted">
        {label}
      </Typography>
      <View className="h-px flex-1 bg-brand-border" />
    </View>
  );
});
