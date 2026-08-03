import { memo } from 'react';

import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';

import { DropdownField, InputField, PrimaryButton, Typography } from '@/components';
import {
  BellIcon,
  BuildingIcon,
  FilterIcon,
  SearchIcon,
} from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

import type {
  InventoryCategory,
  InventoryProduct,
  InventoryStatus,
  StockAdjustmentReason,
  StockHistoryEntry,
  WarehouseOption,
} from '@/seller/types';

const formatStock = (value: number): string => `${value.toFixed(value % 1 === 0 ? 1 : 2)} MT`;

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const inventoryStatusStyles: Record<InventoryStatus, { chip: string; text: string; label: string }> = {
  normal: {
    chip: 'bg-brand-success-light',
    text: 'text-brand-success',
    label: 'Normal',
  },
  low_stock: {
    chip: 'bg-brand-error-light',
    text: 'text-brand-error',
    label: 'Low Stock',
  },
  out_of_stock: {
    chip: 'bg-brand-surface',
    text: 'text-brand-body',
    label: 'Out of Stock',
  },
};

export const InventorySummaryCard = memo(function InventorySummaryCard({
  title,
  value,
  accent,
  meta,
}: {
  title: string;
  value: string | number;
  accent: 'navy' | 'blue' | 'red' | 'gray';
  meta?: string;
}) {
  const accentMap = {
    navy: 'bg-brand-primary-light text-brand-heading',
    blue: 'bg-[#EEF4FF] text-brand-primary-dark',
    red: 'bg-brand-error-light text-brand-error',
    gray: 'bg-brand-surface text-brand-body',
  } as const;

  return (
    <View className="min-h-[112px] flex-1 rounded-[22px] border border-brand-border bg-brand-white p-md">
      <View className="flex-row items-start justify-between">
        <View className={cn('rounded-xl px-sm py-sm', accentMap[accent].split(' ')[0])}>
          <Typography variant="badge" className={accentMap[accent].split(' ')[1]}>
            {title.slice(0, 1)}
          </Typography>
        </View>
        {meta ? (
          <Typography variant="legal" className="text-left text-brand-body">
            {meta}
          </Typography>
        ) : null}
      </View>
      <Typography variant="roleDescription" className="mt-sm">
        {title}
      </Typography>
      <Typography variant="headingLeft" className="mt-xs text-[30px]">
        {value}
      </Typography>
    </View>
  );
});

export const InventoryProductCard = memo(function InventoryProductCard({
  product,
  onUpdateStock,
}: {
  product: InventoryProduct;
  onUpdateStock: (product: InventoryProduct) => void;
}) {
  const badgeStyle = inventoryStatusStyles[product.status];

  return (
    <View className="rounded-[22px] border border-brand-border bg-brand-white p-md">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-md">
          <Typography variant="headingLeft" className="text-[24px] text-brand-heading">
            {product.productName}
          </Typography>
          <Typography variant="badge" className="mt-xs text-[11px] text-brand-body">
            {`${product.category.toUpperCase()} / ${product.subcategory.toUpperCase()}`}
          </Typography>
        </View>
        <View className={cn('rounded-full px-sm py-xs', badgeStyle.chip)}>
          <Typography variant="badge" className={cn('text-[10px]', badgeStyle.text)}>
            {badgeStyle.label}
          </Typography>
        </View>
      </View>

      <View className="mt-md flex-row flex-wrap">
        {[
          { label: 'Available Stock', value: formatStock(product.availableStock) },
          { label: 'Reserved Stock', value: formatStock(product.reservedStock) },
          { label: 'Offered Stock', value: formatStock(product.offeredStock) },
          { label: 'Remaining', value: formatStock(product.remainingStock) },
        ].map((item) => (
          <View key={item.label} className="mb-md w-1/2 pr-sm">
            <Typography variant="fieldLabel">{item.label}</Typography>
            <Typography
              variant="headingLeft"
              className={cn(
                'mt-xs text-[20px]',
                item.label === 'Remaining' &&
                  product.status === 'low_stock' &&
                  'text-brand-error',
              )}
            >
              {item.value}
            </Typography>
          </View>
        ))}
      </View>

      <PrimaryButton label="Update Stock" onPress={() => onUpdateStock(product)} />
    </View>
  );
});

export const WarehouseSelector = memo(function WarehouseSelector({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly WarehouseOption[] | readonly StockAdjustmentReason[];
  onChange: (value: string) => void;
}) {
  return <DropdownField label={label} value={value} options={options} onChange={onChange} />;
});

export const UpdateStockBottomSheet = memo(function UpdateStockBottomSheet({
  visible,
  product,
  warehouse,
  warehouses,
  addStock,
  reduceStock,
  reason,
  reasons,
  onClose,
  onWarehouseChange,
  onAddStockChange,
  onReduceStockChange,
  onReasonChange,
  onSubmit,
}: {
  visible: boolean;
  product: InventoryProduct | null;
  warehouse: string;
  warehouses: readonly WarehouseOption[];
  addStock: string;
  reduceStock: string;
  reason: string;
  reasons: readonly StockAdjustmentReason[];
  onClose: () => void;
  onWarehouseChange: (value: string) => void;
  onAddStockChange: (value: string) => void;
  onReduceStockChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onSubmit: () => void;
}) {
  if (!visible) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable className="flex-1 justify-end bg-black/35" onPress={onClose}>
        <Pressable
          className="rounded-t-[30px] bg-brand-white px-lg pb-2xl pt-md"
          onPress={(event) => event.stopPropagation()}
        >
          <View className="mb-md h-1 w-12 self-center rounded-full bg-brand-border" />
          <View className="flex-row items-center justify-between">
            <Typography variant="headingLeft" className="text-[24px]">
              Update Stock
            </Typography>
            <Pressable onPress={onClose} className="h-9 w-9 items-center justify-center rounded-full bg-brand-surface">
              <Typography variant="roleTitle">×</Typography>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16 }}>
            <InputField
              label="Selected Product Grade"
              value={product ? `${product.productName} • ${product.grade}` : '--'}
              editable={false}
            />
            <InputField
              label="Current Stock (MT)"
              value={product ? String(product.availableStock) : '0'}
              editable={false}
              containerClassName="mt-md"
            />
            <WarehouseSelector
              label="Warehouse Location"
              value={warehouse}
              options={warehouses}
              onChange={onWarehouseChange}
            />
            <View className="mt-md flex-row gap-md">
              <InputField
                label="Add Stock (+)"
                value={addStock}
                onChangeText={onAddStockChange}
                keyboardType="numeric"
                containerClassName="flex-1"
              />
              <InputField
                label="Reduce Stock (-)"
                value={reduceStock}
                onChangeText={onReduceStockChange}
                keyboardType="numeric"
                containerClassName="flex-1"
              />
            </View>
            <View className="mt-md">
              <WarehouseSelector
                label="Adjustment Reason"
                value={reason}
                options={reasons}
                onChange={onReasonChange}
              />
            </View>
            <PrimaryButton label="Update Inventory" onPress={onSubmit} className="mt-lg bg-brand-navy" />
            <Pressable
              onPress={onClose}
              className="mt-md items-center justify-center rounded-md border border-brand-border bg-brand-white px-xl py-lg"
            >
              <Typography variant="button" className="text-brand-body">
                Cancel
              </Typography>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

export const StockHistoryCard = memo(function StockHistoryCard({ entry }: { entry: StockHistoryEntry }) {
  return (
    <View className="rounded-[20px] border border-brand-border bg-brand-white p-md">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-md">
          <Typography variant="roleTitle">{entry.productName}</Typography>
          <Typography variant="legal" className="mt-xs text-left">
            {entry.warehouse}
          </Typography>
        </View>
        <Typography variant="legal" className="text-left text-brand-body">
          {formatDateTime(entry.updatedAt)}
        </Typography>
      </View>
      <View className="mt-md flex-row flex-wrap">
        {[
          { label: 'Added', value: `${entry.added} MT` },
          { label: 'Reduced', value: `${entry.reduced} MT` },
          { label: 'Reason', value: entry.reason },
          { label: 'Updated By', value: entry.updatedBy },
        ].map((item) => (
          <View key={item.label} className="mb-md w-1/2 pr-sm">
            <Typography variant="fieldLabel">{item.label}</Typography>
            <Typography variant="roleTitle" className="mt-xs">
              {item.value}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
});

export const SellerModuleTopBar = memo(function SellerModuleTopBar({
  title = 'PetroTrade',
  showSearch = true,
  onSearchPress,
  onBellPress,
}: {
  title?: string;
  showSearch?: boolean;
  onSearchPress?: () => void;
  onBellPress?: () => void;
}) {
  return (
    <View className="rounded-b-[20px] bg-brand-white px-lg pb-md pt-md">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-sm">
          <BuildingIcon size={18} color={brandColors.primaryDark} />
          <Typography variant="logo" className="text-[20px] text-brand-heading">
            {title}
          </Typography>
        </View>
        <View className="flex-row items-center gap-sm">
          {showSearch ? (
            <Pressable onPress={onSearchPress} className="rounded-full p-sm">
              <SearchIcon size={18} color={brandColors.body} />
            </Pressable>
          ) : null}
          <Pressable onPress={onBellPress} className="rounded-full p-sm">
            <BellIcon />
          </Pressable>
        </View>
      </View>
    </View>
  );
});

export const SearchField = memo(function SearchField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View className="min-h-[48px] w-full flex-row items-center rounded-md border border-brand-border bg-brand-white px-md">
      <SearchIcon size={16} color={brandColors.body} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={brandColors.footer}
        className="ml-sm flex-1 py-md font-sans text-[15px] text-brand-heading"
      />
    </View>
  );
});

export const FilterChipRow = memo(function FilterChipRow({
  options,
  selected,
  onSelect,
}: {
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
      {options.map((option) => {
        const active = selected === option;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            className={cn(
              'rounded-full px-md py-sm',
              active ? 'bg-brand-navy' : 'bg-[#F3F4F6]',
            )}
          >
            <Typography
              variant="roleTitle"
              className={cn('text-[13px]', active ? 'text-brand-white' : 'text-brand-body')}
            >
              {option}
            </Typography>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

export const SectionLabel = memo(function SectionLabel({ label }: { label: string }) {
  return (
    <Typography variant="badge" className="text-[11px] tracking-[1.2px] text-brand-body">
      {label.toUpperCase()}
    </Typography>
  );
});

export const InlineDetailGrid = memo(function InlineDetailGrid({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  return (
    <View className="flex-row flex-wrap">
      {items.map((item) => (
        <View key={item.label} className="mb-md w-1/2 pr-sm">
          <Typography variant="fieldLabel">{item.label}</Typography>
          <Typography variant="roleTitle" className="mt-xs">
            {item.value}
          </Typography>
        </View>
      ))}
    </View>
  );
});

export const FilterButton = memo(function FilterButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="mt-md flex-row items-center justify-center gap-sm rounded-xl border border-brand-border bg-brand-white px-md py-md"
    >
      <FilterIcon size={16} color={brandColors.body} />
      <Typography variant="roleTitle">Advanced Filters</Typography>
    </Pressable>
  );
});

export const inventoryCategoryOptions: readonly ['All Products', ...InventoryCategory[]] = [
  'All Products',
  'Polymer',
  'Chemicals',
  'Speciality',
  'Lubricants',
];
