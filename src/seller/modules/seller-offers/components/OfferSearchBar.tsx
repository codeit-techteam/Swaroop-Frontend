import { memo } from 'react';

import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { Typography } from '@/components';
import { FilterIcon, SearchIcon } from '@/icons';
import type { OfferTabFilter } from '@/seller/modules/seller-offers/types/offers';
import { brandColors } from '@/theme/colors';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

export const OfferSearchBar = memo(function OfferSearchBar({
  value,
  onChangeText,
  placeholder = 'Search product, offer ID, grade',
  onFilterPress,
  filterCount = 0,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  filterCount?: number;
}) {
  return (
    <View className="flex-row items-center gap-sm">
      <View
        className="min-h-[48px] flex-1 flex-row items-center rounded-2xl border border-brand-border bg-brand-white px-md"
        style={elevation.sm}
      >
        <SearchIcon size={16} color={brandColors.body} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={brandColors.footer}
          className="ml-sm flex-1 py-md font-sans text-[15px] text-brand-heading"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>
      {onFilterPress ? (
        <Pressable
          onPress={onFilterPress}
          accessibilityRole="button"
          accessibilityLabel={filterCount > 0 ? `Filters, ${filterCount} active` : 'Filters'}
          className="h-12 w-12 items-center justify-center rounded-2xl border border-brand-border bg-brand-white"
          style={({ pressed }) => [elevation.sm, { opacity: pressed ? 0.9 : 1 }]}
        >
          <FilterIcon size={18} color={brandColors.navy} />
          {filterCount > 0 ? (
            <View className="absolute -right-0.5 -top-0.5 min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-brand-navy px-[4px]">
              <Typography variant="badge" className="text-[9px] text-brand-white">
                {filterCount > 9 ? '9+' : filterCount}
              </Typography>
            </View>
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
});

const OFFER_TABS: Array<{ label: string; value: OfferTabFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Expired', value: 'expired' },
  { label: 'Draft', value: 'draft' },
];

export const OfferFilters = memo(function OfferFilters({
  activeTab,
  onTabChange,
  counts,
}: {
  activeTab: OfferTabFilter;
  onTabChange: (tab: OfferTabFilter) => void;
  counts?: Partial<Record<OfferTabFilter, number>>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingRight: 12 }}
    >
      {OFFER_TABS.map((tab) => {
        const selected = activeTab === tab.value;
        const count = counts?.[tab.value];
        return (
          <Pressable
            key={tab.value}
            onPress={() => onTabChange(tab.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={cn(
              'flex-row items-center rounded-full px-md py-sm',
              selected ? 'bg-brand-navy' : 'border border-brand-border bg-brand-white',
            )}
          >
            <Typography
              variant="roleTitle"
              className={cn('text-[13px]', selected ? 'text-brand-white' : 'text-brand-body')}
            >
              {tab.label}
            </Typography>
            {typeof count === 'number' ? (
              <View
                className={cn(
                  'ml-xs min-w-[20px] items-center rounded-full px-xs py-[1px]',
                  selected ? 'bg-white/15' : 'bg-brand-surface',
                )}
              >
                <Typography
                  variant="badge"
                  className={cn('text-[10px]', selected ? 'text-brand-white' : 'text-brand-heading')}
                >
                  {count}
                </Typography>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
});
