import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { cn } from '@/utils/cn';

import type { ShipmentFilterTab } from '@/seller/types/shipments';

const FILTER_OPTIONS: { id: ShipmentFilterTab; label: string }[] = [
  { id: 'in_transit', label: 'In Transit' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'delayed', label: 'Delayed' },
];

type ShipmentFilterTabsProps = {
  selected: ShipmentFilterTab;
  onSelect: (tab: ShipmentFilterTab) => void;
};

export const ShipmentFilterTabs = memo(function ShipmentFilterTabs({
  selected,
  onSelect,
}: ShipmentFilterTabsProps) {
  return (
    <View className="flex-row rounded-2xl border border-brand-border bg-brand-white p-1">
      {FILTER_OPTIONS.map((option) => {
        const active = selected === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            className={cn('flex-1 rounded-xl px-sm py-sm', active && 'bg-brand-navy')}
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <Typography
              variant="roleTitle"
              className={cn('text-center text-[13px]', active ? 'text-brand-white' : 'text-brand-heading')}
            >
              {option.label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
});
