import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { ORDER_TAB_LABELS } from '@/constants/orderStatus';
import type { OrderTabCategory } from '@/types/order';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type OrderTabsProps = {
  selectedTab: OrderTabCategory;
  onTabChange: (tab: OrderTabCategory) => void;
  className?: string;
};

const TABS: OrderTabCategory[] = ['active', 'completed', 'cancelled'];

export const OrderTabs = memo(function OrderTabs({
  selectedTab,
  onTabChange,
  className,
}: OrderTabsProps) {
  return (
    <View className={cn('flex-row border-b border-brand-border', className)}>
      {TABS.map((tab) => {
        const isSelected = tab === selectedTab;

        return (
          <Pressable
            key={tab}
            onPress={() => onTabChange(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={ORDER_TAB_LABELS[tab]}
            className="flex-1 items-center pb-md pt-sm"
          >
            <Typography
              variant="roleTitle"
              className={cn(
                'text-[13px]',
                isSelected ? 'font-bold text-brand-primary' : 'text-brand-muted',
              )}
            >
              {ORDER_TAB_LABELS[tab]}
            </Typography>
            {isSelected ? (
              <View
                className="absolute bottom-0 h-0.5 w-full rounded-full"
                style={{ backgroundColor: brandColors.primary }}
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
});
