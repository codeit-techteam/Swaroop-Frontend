import { memo } from 'react';

import { View } from 'react-native';

import { CheckCircleIcon } from '@/icons';
import { Typography } from '@/components';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';
import type { DispatchChecklistItem } from '@/seller/modules/dispatch/types/dispatch';

const stateMap = {
  done: {
    label: 'DONE',
    text: 'text-brand-success',
    marker: <CheckCircleIcon size={18} color={brandColors.success} />,
    border: 'border-transparent',
  },
  pending: {
    label: 'PENDING',
    text: 'text-brand-body',
    marker: <View className="h-[18px] w-[18px] rounded-full border border-brand-border bg-brand-white" />,
    border: 'border-transparent',
  },
  required: {
    label: 'REQUIRED',
    text: 'text-brand-error',
    marker: <View className="h-[18px] w-[18px] rounded-full border border-brand-body bg-brand-white" />,
    border: 'border-l-2 border-brand-error',
  },
} as const;

export const DispatchChecklist = memo(function DispatchChecklist({
  items,
}: {
  items: DispatchChecklistItem[];
}) {
  return (
    <View className="rounded-[22px] border border-brand-border bg-brand-white p-md">
      {items.map((item, index) => {
        const state = stateMap[item.state];
        return (
          <View
            key={item.key}
            className={cn(
              'flex-row items-center justify-between px-sm py-md',
              state.border,
              index < items.length - 1 && 'border-b border-brand-surface',
            )}
          >
            <View className="flex-1 flex-row items-center gap-sm pr-md">
              {state.marker}
              <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                {item.label}
              </Typography>
            </View>
            <Typography variant="badge" className={cn('text-[10px]', state.text)}>
              {state.label}
            </Typography>
          </View>
        );
      })}
    </View>
  );
});
