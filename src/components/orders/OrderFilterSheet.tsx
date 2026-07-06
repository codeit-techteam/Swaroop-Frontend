import { forwardRef, memo, useCallback, useMemo } from 'react';

import { Pressable, View } from 'react-native';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

import { PrimaryButton, SecondaryButton, Typography } from '@/components/ui';
import {
  ORDER_FILTER_DATE_OPTIONS,
  ORDER_FILTER_PRODUCT_OPTIONS,
  ORDER_FILTER_STATUS_OPTIONS,
  type OrderDateFilterId,
} from '@/constants/orderStatus';
import type { OrderDisplayStatus, ProductCategory } from '@/types/order';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

export type OrderFilterState = {
  status: OrderDisplayStatus | null;
  date: OrderDateFilterId | null;
  product: ProductCategory | null;
};

export const DEFAULT_ORDER_FILTERS: OrderFilterState = {
  status: null,
  date: null,
  product: null,
};

type OrderFilterSheetProps = {
  filters: OrderFilterState;
  onFiltersChange: (filters: OrderFilterState) => void;
  onApply: () => void;
  onReset: () => void;
};

type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

const FilterChip = memo(function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={cn(
        'rounded-full border px-md py-sm',
        selected
          ? 'border-brand-primary bg-brand-primary-tint'
          : 'border-brand-border bg-brand-white',
      )}
    >
      <Typography
        variant="roleTitle"
        className={cn('text-[13px]', selected ? 'text-brand-primary' : 'text-brand-body')}
      >
        {label}
      </Typography>
    </Pressable>
  );
});

const FilterSection = memo(function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-xl">
      <Typography variant="fieldLabel" className="mb-md text-[11px] tracking-[0.8px] text-brand-muted">
        {title}
      </Typography>
      <View className="flex-row flex-wrap gap-sm">{children}</View>
    </View>
  );
});

const STATUS_LABELS: Record<OrderDisplayStatus, string> = {
  processing: 'Active',
  in_transit: 'In Transit',
  delivered: 'Completed',
  cancelled: 'Cancelled',
};

export const OrderFilterSheet = memo(
  forwardRef<BottomSheetModal, OrderFilterSheetProps>(function OrderFilterSheet(
    { filters, onFiltersChange, onApply, onReset },
    ref,
  ) {
    const snapPoints = useMemo(() => ['65%'], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
      ),
      [],
    );

    const toggleStatus = useCallback(
      (status: OrderDisplayStatus) => {
        onFiltersChange({
          ...filters,
          status: filters.status === status ? null : status,
        });
      },
      [filters, onFiltersChange],
    );

    const toggleDate = useCallback(
      (date: OrderDateFilterId) => {
        onFiltersChange({
          ...filters,
          date: filters.date === date ? null : date,
        });
      },
      [filters, onFiltersChange],
    );

    const toggleProduct = useCallback(
      (product: ProductCategory) => {
        onFiltersChange({
          ...filters,
          product: filters.product === product ? null : product,
        });
      },
      [filters, onFiltersChange],
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: brandColors.indicatorInactive }}
        backgroundStyle={{ backgroundColor: brandColors.white }}
      >
        <BottomSheetScrollView
          className="flex-1 px-lg"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <Typography variant="roleTitle" className="mb-lg text-[18px] text-brand-heading">
            Filter Orders
          </Typography>

          <FilterSection title="ORDER STATUS">
            {ORDER_FILTER_STATUS_OPTIONS.map((status) => (
              <FilterChip
                key={status}
                label={STATUS_LABELS[status]}
                selected={filters.status === status}
                onPress={() => toggleStatus(status)}
              />
            ))}
          </FilterSection>

          <FilterSection title="DATE">
            {ORDER_FILTER_DATE_OPTIONS.map((option) => (
              <FilterChip
                key={option.id}
                label={option.label}
                selected={filters.date === option.id}
                onPress={() => toggleDate(option.id)}
              />
            ))}
          </FilterSection>

          <FilterSection title="PRODUCT">
            {ORDER_FILTER_PRODUCT_OPTIONS.map((product) => (
              <FilterChip
                key={product}
                label={product}
                selected={filters.product === product}
                onPress={() => toggleProduct(product)}
              />
            ))}
          </FilterSection>

          <View className="flex-row gap-sm">
            <View className="flex-1">
              <SecondaryButton label="Reset" onPress={onReset} />
            </View>
            <View className="flex-1">
              <PrimaryButton label="Apply" onPress={onApply} />
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }),
);
