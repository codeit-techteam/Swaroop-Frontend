import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';

export const DispatchProgress = memo(function DispatchProgress({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  return (
    <View>
      <View className="flex-row items-center justify-between">
        <Typography variant="fieldLabel">Dispatch Progress</Typography>
        <Typography variant="fieldLabel" className="text-brand-primary-dark">
          {label ?? `${value}%`}
        </Typography>
      </View>
      <View className="mt-sm h-2 overflow-hidden rounded-full bg-brand-border">
        <View
          className="h-full rounded-full bg-[#10B981]"
          style={{ width: `${Math.max(6, Math.min(100, value))}%` }}
        />
      </View>
    </View>
  );
});
