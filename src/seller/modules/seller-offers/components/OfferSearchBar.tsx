import { memo } from 'react';

import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { Typography } from '@/components';
import { SearchIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { OfferTabFilter } from '@/seller/modules/seller-offers/types/offers';
import { cn } from '@/utils/cn';

export const OfferSearchBar = memo(function OfferSearchBar({
  value,
  onChangeText,
  placeholder = 'Search by Product, Offer ID, Grade, Warehouse',
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <View className="flex-row items-center rounded-2xl border border-brand-border bg-brand-white px-md py-sm">
      <SearchIcon size={18} color={brandColors.body} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={brandColors.body}
        className="ml-sm flex-1 font-sans text-[15px] text-brand-heading"
      />
    </View>
  );
});

const OFFER_TABS: Array<{ label: string; value: OfferTabFilter }> = [
  { label: 'All Offers', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Expired', value: 'expired' },
];

export const OfferFilters = memo(function OfferFilters({
  activeTab,
  onTabChange,
}: {
  activeTab: OfferTabFilter;
  onTabChange: (tab: OfferTabFilter) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 20 }}
    >
      {OFFER_TABS.map((tab) => {
        const selected = activeTab === tab.value;
        return (
          <Pressable key={tab.value} onPress={() => onTabChange(tab.value)} className="pb-sm">
            <Typography
              variant="roleTitle"
              className={cn(selected ? 'text-brand-navy' : 'text-brand-body')}
            >
              {tab.label}
            </Typography>
            {selected ? <View className="mt-sm h-0.5 rounded-full bg-brand-navy" /> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
});
