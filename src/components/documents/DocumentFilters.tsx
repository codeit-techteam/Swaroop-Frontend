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

type DocumentFilterTabsProps = {
  selected: DocumentTab;
  onSelect: (tab: DocumentTab) => void;
};

export const DocumentFilterTabs = memo(function DocumentFilterTabs({
  selected,
  onSelect,
}: DocumentFilterTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-sm"
    >
      {DOCUMENT_TABS.map((tab) => {
        const isSelected = tab.id === selected;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onSelect(tab.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            className={cn(
              'rounded-full px-md py-sm',
              isSelected ? 'bg-brand-primary' : 'border border-brand-border bg-brand-white',
            )}
            style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
          >
            <Typography
              variant="badge"
              className={cn(
                'text-[12px] tracking-normal',
                isSelected ? 'text-brand-white' : 'text-brand-body',
              )}
            >
              {tab.title}
            </Typography>
          </Pressable>
        );
      })}
    </ScrollView>
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
        contentContainerClassName="gap-sm"
      >
        {DOCUMENT_STATUS_FILTERS.map((status) => {
          const selected = filters.status === status;
          return (
            <Pressable
              key={status}
              onPress={() => onChange({ status })}
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
                {status === 'all'
                  ? 'All Statuses'
                  : DOCUMENT_STATUS_LABELS[status as DocumentStatus]}
              </Typography>
            </Pressable>
          );
        })}
        {warehouseOptions.length > 1
          ? warehouseOptions.map((warehouse) => {
              const selected = filters.warehouse === warehouse;
              return (
                <Pressable
                  key={`wh-${warehouse}`}
                  onPress={() => onChange({ warehouse })}
                  className={cn(
                    'rounded-full px-md py-sm',
                    selected
                      ? 'bg-brand-primary-tint'
                      : 'border border-brand-border bg-brand-white',
                  )}
                >
                  <Typography
                    variant="badge"
                    className={cn(
                      'text-[11px] tracking-normal',
                      selected ? 'text-brand-primary' : 'text-brand-muted',
                    )}
                  >
                    {warehouse === 'all' ? 'All Warehouses' : warehouse}
                  </Typography>
                </Pressable>
              );
            })
          : null}
        {sellerOptions.length > 1
          ? sellerOptions.map((seller) => {
              const selected = filters.seller === seller;
              return (
                <Pressable
                  key={`sl-${seller}`}
                  onPress={() => onChange({ seller })}
                  className={cn(
                    'rounded-full px-md py-sm',
                    selected
                      ? 'bg-brand-primary-tint'
                      : 'border border-brand-border bg-brand-white',
                  )}
                >
                  <Typography
                    variant="badge"
                    className={cn(
                      'text-[11px] tracking-normal',
                      selected ? 'text-brand-primary' : 'text-brand-muted',
                    )}
                  >
                    {seller === 'all' ? 'All Supply Sources' : seller}
                  </Typography>
                </Pressable>
              );
            })
          : null}
        <Pressable
          onPress={() => onChange({ sortBy: filters.sortBy === 'newest' ? 'oldest' : 'newest' })}
          className="rounded-full border border-brand-border bg-brand-white px-md py-sm"
        >
          <Typography variant="badge" className="text-[11px] tracking-normal text-brand-muted">
            {filters.sortBy === 'newest' ? 'Newest' : 'Oldest'}
          </Typography>
        </Pressable>
      </ScrollView>
      {hasActive ? (
        <Pressable onPress={onReset} className="self-end">
          <Typography variant="link" className="text-[12px]">
            Reset filters
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
});
