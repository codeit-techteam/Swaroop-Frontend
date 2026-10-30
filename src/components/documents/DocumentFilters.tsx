import { memo, useMemo } from 'react';

import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import {
  DOCUMENT_STATUS_FILTERS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_TABS,
} from '@/constants/documents';
import { SearchIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { DocumentStatus, DocumentTab, DocumentsFiltersState } from '@/types/documents';
import { cn } from '@/utils/cn';

const TAB_SHORT_LABELS: Record<DocumentTab, string> = {
  purchase_orders: 'POs',
  invoices: 'Invoices',
  proforma: 'Proforma',
};

type DocumentFilterTabsProps = {
  selected: DocumentTab;
  onSelect: (tab: DocumentTab) => void;
};

export const DocumentFilterTabs = memo(function DocumentFilterTabs({
  selected,
  onSelect,
}: DocumentFilterTabsProps) {
  return (
    <View className="flex-row rounded-xl border border-brand-border bg-brand-white p-xs">
      {DOCUMENT_TABS.map((tab) => {
        const isSelected = tab.id === selected;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onSelect(tab.id)}
            accessibilityRole="button"
            accessibilityLabel={tab.title}
            accessibilityState={{ selected: isSelected }}
            className={cn(
              'min-w-0 flex-1 items-center justify-center rounded-lg px-sm py-sm',
              isSelected ? 'bg-brand-primary' : 'bg-transparent',
            )}
            style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
          >
            <Typography
              variant="roleTitle"
              numberOfLines={1}
              className={cn(
                'text-center text-[12px]',
                isSelected ? 'text-brand-white' : 'text-brand-body',
              )}
            >
              {TAB_SHORT_LABELS[tab.id]}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
});

type DocumentSearchBarProps = {
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
};

export const DocumentSearchBar = memo(function DocumentSearchBar({
  value,
  placeholder,
  onChangeText,
}: DocumentSearchBarProps) {
  return (
    <View className="flex-row items-center rounded-xl border border-brand-border bg-brand-white px-md py-sm">
      <SearchIcon size={18} color={brandColors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={brandColors.muted}
        accessibilityRole="search"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        className="ml-sm flex-1 font-sans text-[14px] text-brand-heading"
        style={{ paddingVertical: 0 }}
      />
    </View>
  );
});

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

const FilterChip = memo(function FilterChip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={cn(
        'rounded-full px-md py-sm',
        selected ? 'bg-brand-primary-tint' : 'border border-brand-border bg-brand-white',
      )}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      <Typography
        variant="badge"
        className={cn(
          'text-[11px] tracking-normal',
          selected ? 'text-brand-primary' : 'text-brand-muted',
        )}
      >
        {label}
      </Typography>
    </Pressable>
  );
});

type DocumentFiltersRowProps = {
  filters: DocumentsFiltersState;
  warehouses: string[];
  sellers: string[];
  onChange: (patch: Partial<DocumentsFiltersState>) => void;
  onReset: () => void;
};

export const DocumentFiltersRow = memo(function DocumentFiltersRow({
  filters,
  warehouses,
  sellers,
  onChange,
  onReset,
}: DocumentFiltersRowProps) {
  const hasActive =
    filters.status !== 'all' ||
    filters.warehouse !== 'all' ||
    filters.seller !== 'all' ||
    filters.sortBy !== 'newest' ||
    Boolean(filters.search.trim());

  const warehouseOptions = useMemo(() => ['all', ...warehouses], [warehouses]);
  const sellerOptions = useMemo(() => ['all', ...sellers], [sellers]);

  return (
    <View className="gap-sm">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={{ gap: 8, paddingHorizontal: 24 }}
      >
        {DOCUMENT_STATUS_FILTERS.map((status) => (
          <FilterChip
            key={status}
            label={
              status === 'all' ? 'All Statuses' : DOCUMENT_STATUS_LABELS[status as DocumentStatus]
            }
            selected={filters.status === status}
            onPress={() => onChange({ status })}
          />
        ))}
        {warehouseOptions.length > 1
          ? warehouseOptions.map((warehouse) => (
              <FilterChip
                key={`wh-${warehouse}`}
                label={warehouse === 'all' ? 'All Warehouses' : warehouse}
                selected={filters.warehouse === warehouse}
                onPress={() => onChange({ warehouse })}
              />
            ))
          : null}
        {sellerOptions.length > 1
          ? sellerOptions.map((seller) => (
              <FilterChip
                key={`sl-${seller}`}
                label={seller === 'all' ? 'All Sources' : seller}
                selected={filters.seller === seller}
                onPress={() => onChange({ seller })}
              />
            ))
          : null}
        <FilterChip
          label={filters.sortBy === 'newest' ? 'Newest' : 'Oldest'}
          selected={filters.sortBy !== 'newest'}
          onPress={() => onChange({ sortBy: filters.sortBy === 'newest' ? 'oldest' : 'newest' })}
        />
      </ScrollView>
      {hasActive ? (
        <Pressable onPress={onReset} className="self-end px-xl py-xs" hitSlop={8}>
          <Typography variant="link" className="text-[12px]">
            Reset filters
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
});
