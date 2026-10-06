import { memo, useCallback, useEffect, useState } from 'react';

import { ScrollView, View } from 'react-native';

import { PrimaryButton, SecondaryButton, Typography } from '@/components';
import { SellerSheetShell } from '@/seller/components/SellerSheetShell';
import { FilterChip } from '@/seller/components/utility/SearchBar';
import {
  getFilterPreferences,
  resetFilterPreferences,
  saveFilterPreferences,
  type FilterPreferences,
} from '@/seller/services/documentsService';

export type FilterModule = 'orders' | 'products' | 'offers' | 'inventory' | 'shipments';

type FilterOption = { label: string; value: string };

type FilterGroup = {
  id: keyof FilterPreferences;
  label: string;
  options: FilterOption[];
  multi?: boolean;
};

const FILTER_GROUPS: Record<FilterModule, FilterGroup[]> = {
  orders: [
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Dispatched', value: 'dispatched' },
      ],
      multi: true,
    },
    {
      id: 'warehouse',
      label: 'Warehouse',
      options: [
        { label: 'Hazira', value: 'hazira' },
        { label: 'JNPT', value: 'jnpt' },
        { label: 'Bhiwandi', value: 'bhiwandi' },
        { label: 'Mundra', value: 'mundra' },
      ],
      multi: true,
    },
    {
      id: 'paymentMethod',
      label: 'Payment Method',
      options: [
        { label: 'Advance', value: 'advance' },
        { label: 'Credit — PetroTrade Managed', value: 'credit_15' },
        { label: 'On Delivery', value: 'on_delivery' },
        { label: 'On Loading', value: 'on_loading' },
      ],
      multi: true,
    },
  ],
  products: [
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
        { label: 'Inactive', value: 'inactive' },
      ],
      multi: true,
    },
  ],
  offers: [
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Expired', value: 'expired' },
        { label: 'Draft', value: 'draft' },
      ],
      multi: true,
    },
    {
      id: 'warehouse',
      label: 'Warehouse',
      options: [
        { label: 'Hazira', value: 'hazira' },
        { label: 'JNPT', value: 'jnpt' },
        { label: 'Bhiwandi', value: 'bhiwandi' },
      ],
      multi: true,
    },
  ],
  inventory: [
    {
      id: 'status',
      label: 'Stock Status',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Low Stock', value: 'low_stock' },
        { label: 'Out of Stock', value: 'out_of_stock' },
      ],
      multi: true,
    },
    {
      id: 'warehouse',
      label: 'Warehouse',
      options: [
        { label: 'Main Warehouse', value: 'main' },
        { label: 'Hazira', value: 'hazira' },
        { label: 'JNPT', value: 'jnpt' },
      ],
      multi: true,
    },
  ],
  shipments: [
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'In Transit', value: 'in_transit' },
        { label: 'On Time', value: 'on_time' },
        { label: 'Delayed', value: 'delayed' },
        { label: 'Delivered', value: 'delivered' },
      ],
      multi: true,
    },
    {
      id: 'destination',
      label: 'Destination',
      options: [
        { label: 'Mumbai', value: 'mumbai' },
        { label: 'Pune', value: 'pune' },
        { label: 'Ahmedabad', value: 'ahmedabad' },
        { label: 'Delhi', value: 'delhi' },
      ],
      multi: true,
    },
  ],
};

type FilterBottomSheetProps = {
  visible: boolean;
  module: FilterModule;
  onClose: () => void;
  onApply: (prefs: FilterPreferences) => void;
};

export const FilterBottomSheet = memo(function FilterBottomSheet({
  visible,
  module,
  onClose,
  onApply,
}: FilterBottomSheetProps) {
  const [draft, setDraft] = useState<FilterPreferences>({});

  useEffect(() => {
    if (visible) {
      setDraft(getFilterPreferences(module));
    }
  }, [visible, module]);

  const toggleValue = useCallback(
    (groupId: keyof FilterPreferences, value: string, multi?: boolean) => {
      setDraft((prev) => {
        const current = (prev[groupId] as string[] | undefined) ?? [];
        if (multi) {
          const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
          return { ...prev, [groupId]: next.length > 0 ? next : undefined };
        }
        return { ...prev, [groupId]: [value] };
      });
    },
    [],
  );

  const handleReset = () => {
    resetFilterPreferences(module);
    setDraft({});
    onApply({});
    onClose();
  };

  const handleApply = () => {
    saveFilterPreferences(module, draft);
    onApply(draft);
    onClose();
  };

  const groups = FILTER_GROUPS[module];

  return (
    <SellerSheetShell visible={visible} onClose={onClose}>
      <Typography variant="headingLeft" className="text-[22px]">
        Filters
      </Typography>
      <Typography variant="subheading" className="mt-xs text-brand-body">
        Refine your {module} list
      </Typography>

      <ScrollView className="mt-lg max-h-96" showsVerticalScrollIndicator={false}>
        {groups.map((group) => {
          const selected = (draft[group.id] as string[] | undefined) ?? [];
          return (
            <View key={group.id} className="mb-lg">
              <Typography
                variant="badge"
                className="mb-sm text-[11px] uppercase tracking-wide text-brand-body"
              >
                {group.label}
              </Typography>
              <View className="flex-row flex-wrap gap-sm">
                {group.options.map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    selected={selected.includes(option.value)}
                    onPress={() => toggleValue(group.id, option.value, group.multi)}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View className="mt-lg flex-row gap-sm">
        <View className="flex-1">
          <SecondaryButton label="Reset" variant="outline" onPress={handleReset} />
        </View>
        <View className="flex-1">
          <PrimaryButton
            label="Apply"
            className="rounded-2xl bg-brand-navy"
            onPress={handleApply}
          />
        </View>
      </View>
    </SellerSheetShell>
  );
});

export function getActiveFilterCount(prefs: FilterPreferences): number {
  return Object.values(prefs).filter(
    (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true),
  ).length;
}
