import { memo, type ReactNode } from 'react';

import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { DropdownField, InputField, PrimaryButton, Typography } from '@/components';
import {
  BellIcon,
  BuildingIcon,
  FilterIcon,
  LocationPinIcon,
  SearchIcon,
  StoreIcon,
} from '@/icons';
import { SellerSheetShell } from '@/seller/components/SellerSheetShell';
import type {
  InventoryCategory,
  InventoryProduct,
  InventoryStatus,
  StockAdjustmentReason,
  StockHistoryEntry,
  WarehouseOption,
} from '@/seller/types';
import { brandColors } from '@/theme/colors';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

const formatStock = (value: number): string => `${value.toFixed(value % 1 === 0 ? 1 : 2)} MT`;

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const inventoryStatusStyles: Record<
  InventoryStatus,
  { chip: string; text: string; label: string }
> = {
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

const SUMMARY_ACCENT = {
  navy: {
    tint: 'bg-brand-primary-light',
    icon: brandColors.navy,
    selected: 'border-brand-navy bg-brand-primary-tint',
  },
  blue: {
    tint: 'bg-[#EEF4FF]',
    icon: brandColors.primaryDark,
    selected: 'border-brand-primary bg-[#EEF4FF]',
  },
  red: {
    tint: 'bg-brand-error-light',
    icon: brandColors.error,
    selected: 'border-brand-error bg-brand-error-light',
  },
  gray: {
    tint: 'bg-brand-surface',
    icon: brandColors.body,
    selected: 'border-brand-heading bg-brand-surface',
  },
} as const;

export const InventorySummaryCard = memo(function InventorySummaryCard({
  title,
  value,
  accent,
  icon,
  selected = false,
  onPress,
}: {
  title: string;
  value: string | number;
  accent: 'navy' | 'blue' | 'red' | 'gray';
  icon?: ReactNode;
  selected?: boolean;
  onPress?: () => void;
}) {
  const palette = SUMMARY_ACCENT[accent];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected }}
      accessibilityLabel={`${title} ${value}`}
      className={cn(
        'w-full rounded-2xl border bg-brand-white px-md py-md',
        selected ? palette.selected : 'border-brand-border',
      )}
      style={({ pressed }) => [
        elevation.sm,
        {
          opacity: pressed && onPress ? 0.92 : 1,
          transform: [{ scale: pressed && onPress ? 0.985 : 1 }],
        },
      ]}
    >
      <View className="flex-row items-center justify-between">
        <View className={cn('h-8 w-8 items-center justify-center rounded-xl', palette.tint)}>
          {icon ?? <StoreIcon size={15} color={palette.icon} />}
        </View>
        <Typography variant="headingLeft" className="text-[24px] leading-[28px]">
          {value}
        </Typography>
      </View>
      <Typography variant="legal" className="mt-sm text-left text-[11px] text-brand-body">
        {title}
      </Typography>
    </Pressable>
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
  const available = Math.max(product.availableStock, 0);
  const remainingShare = available > 0 ? Math.max(product.remainingStock, 0) / available : 0;
  const offeredShare = available > 0 ? Math.max(product.offeredStock, 0) / available : 0;
  const reservedShare = available > 0 ? Math.max(product.reservedStock, 0) / available : 0;

  return (
    <View
      className="overflow-hidden rounded-2xl border border-brand-border bg-brand-white p-md"
      style={elevation.sm}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-md">
          <Typography
            variant="headingLeft"
            className="text-[17px] leading-[22px] text-brand-heading"
            numberOfLines={2}
          >
            {product.productName}
          </Typography>
          <Typography variant="legal" className="mt-xs text-left text-[11px] text-brand-body">
            {product.grade} · {product.category}
            {product.subcategory ? ` / ${product.subcategory}` : ''}
          </Typography>
          <View className="mt-xs flex-row items-center">
            <LocationPinIcon size={13} color={brandColors.primaryDark} />
            <Typography variant="badge" className="ml-xs text-[11px] text-brand-primary-dark">
              {product.warehouse}
            </Typography>
          </View>
        </View>
        <View className="items-end gap-xs">
          <View className={cn('rounded-full px-sm py-xs', badgeStyle.chip)}>
            <Typography variant="badge" className={cn('text-[10px]', badgeStyle.text)}>
              {badgeStyle.label}
            </Typography>
          </View>
          {product.activeOffer ? (
            <View className="rounded-full bg-brand-primary-light px-sm py-xs">
              <Typography variant="badge" className="text-[10px] text-brand-primary-dark">
                Offer live
              </Typography>
            </View>
          ) : null}
        </View>
      </View>

      <View className="mt-md h-1.5 flex-row overflow-hidden rounded-full bg-brand-surface">
        <View className="h-full bg-brand-success" style={{ flex: remainingShare }} />
        <View className="h-full bg-brand-primary" style={{ flex: offeredShare }} />
        <View className="h-full bg-[#C5D0DC]" style={{ flex: reservedShare }} />
      </View>

      <View className="mt-md flex-row">
        {[
          { label: 'Available', value: formatStock(product.availableStock) },
          {
            label: 'Free',
            value: formatStock(product.remainingStock),
            alert: product.status !== 'normal',
          },
          { label: 'Reserved', value: formatStock(product.reservedStock) },
          { label: 'Offered', value: formatStock(product.offeredStock) },
        ].map((item) => (
          <View key={item.label} className="flex-1 pr-xs">
            <Typography variant="fieldLabel" className="text-[10px]">
              {item.label}
            </Typography>
            <Typography
              variant="roleTitle"
              className={cn('mt-xs text-[13px]', item.alert && 'text-brand-error')}
            >
              {item.value}
            </Typography>
          </View>
        ))}
      </View>

      <PrimaryButton
        label="Update Stock"
        onPress={() => onUpdateStock(product)}
        className="mt-md rounded-2xl bg-brand-navy py-md"
      />
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
  return (
    <SellerSheetShell visible={visible} onClose={onClose}>
      <View className="flex-row items-center justify-between">
        <Typography variant="headingLeft" className="text-[22px]">
          Update Stock
        </Typography>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="h-9 w-9 items-center justify-center rounded-full bg-brand-surface"
        >
          <Typography variant="roleTitle" className="text-brand-footer">
            ×
          </Typography>
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
        <PrimaryButton
          label="Update Inventory"
          onPress={onSubmit}
          className="mt-lg rounded-2xl bg-brand-navy"
        />
        <Pressable
          onPress={onClose}
          className="mt-md items-center justify-center rounded-2xl border border-brand-border bg-brand-white px-xl py-md"
        >
          <Typography variant="button" className="text-brand-body">
            Cancel
          </Typography>
        </Pressable>
      </ScrollView>
    </SellerSheetShell>
  );
});

export const StockHistoryCard = memo(function StockHistoryCard({
  entry,
}: {
  entry: StockHistoryEntry;
}) {
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
    <View className="border-b border-brand-border bg-brand-white px-lg pb-md pt-md">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-sm">
          <View className="h-9 w-9 items-center justify-center rounded-2xl bg-brand-primary-light">
            <BuildingIcon size={16} color={brandColors.navy} />
          </View>
          <Typography variant="logo" className="text-[18px] text-brand-heading">
            {title}
          </Typography>
        </View>
        <View className="flex-row items-center gap-sm">
          {showSearch ? (
            <Pressable
              onPress={onSearchPress}
              accessibilityRole="button"
              accessibilityLabel="Search"
              className="h-10 w-10 items-center justify-center rounded-2xl border border-brand-border bg-brand-white"
            >
              <SearchIcon size={18} color={brandColors.body} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={onBellPress}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            className="h-10 w-10 items-center justify-center rounded-2xl border border-brand-border bg-brand-white"
          >
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
    <View
      className="min-h-[48px] w-full flex-row items-center rounded-2xl border border-brand-border bg-brand-white px-md"
      style={elevation.sm}
    >
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10 }}
    >
      {options.map((option) => {
        const active = selected === option;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            className={cn('rounded-full px-md py-sm', active ? 'bg-brand-navy' : 'bg-[#F3F4F6]')}
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
