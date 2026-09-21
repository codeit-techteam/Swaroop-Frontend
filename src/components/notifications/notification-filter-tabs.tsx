import { memo } from 'react';

import { Pressable, ScrollView } from 'react-native';

import { Typography } from '@/components/ui/typography';
import type { NotificationCategoryFilter } from '@/types/notifications';
import { cn } from '@/utils/cn';

const FILTER_OPTIONS: { id: NotificationCategoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'orders', label: 'Orders' },
  { id: 'payments', label: 'Payments' },
  { id: 'shipment', label: 'Shipment' },
  { id: 'documents', label: 'Documents' },
  { id: 'offers', label: 'Offers' },
];

type NotificationFilterTabsProps = {
  selected: NotificationCategoryFilter;
  onSelect: (category: NotificationCategoryFilter) => void;
};

export const NotificationFilterTabs = memo(function NotificationFilterTabs({
  selected,
  onSelect,
}: NotificationFilterTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10, paddingHorizontal: 2 }}
    >
      {FILTER_OPTIONS.map((option) => {
        const active = selected === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            accessibilityRole="button"
            accessibilityLabel={`${option.label} notifications`}
            accessibilityState={{ selected: active }}
            className={cn(
              'rounded-full border px-md py-sm',
              active ? 'border-brand-navy bg-brand-navy' : 'border-brand-border bg-brand-white',
            )}
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <Typography
              variant="roleTitle"
              className={cn('text-[13px]', active ? 'text-brand-white' : 'text-brand-body')}
            >
              {option.label}
            </Typography>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});
