import { memo, useCallback } from 'react';

import { FlatList, Pressable, ScrollView, View, type ListRenderItem } from 'react-native';

import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  PAYMENT_COMPARISON_TABLE_MIN_WIDTH,
  PaymentComparisonRow,
} from '@/components/payment/payment-comparison-row';
import { Typography } from '@/components/ui/typography';
import { InfoIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import type { PaymentComparisonOption, PaymentMethodId } from '@/types/payment';

type PaymentComparisonTableProps = {
  options: PaymentComparisonOption[];
  selectedId: PaymentMethodId;
  onSelect: (id: PaymentMethodId) => void;
  onInfoPress: () => void;
};

const TABLE_HEADERS = [
  { key: 'method', label: 'METHOD', width: 118 },
  { key: 'discount', label: 'DISCOUNT', width: 56 },
  { key: 'timeline', label: 'TIMELINE', width: 72 },
  { key: 'interest', label: 'INTEREST', width: 52 },
  { key: 'eligibility', label: 'ELIGIBILITY', width: 68 },
] as const;

export const PaymentComparisonTable = memo(function PaymentComparisonTable({
  options,
  selectedId,
  onSelect,
  onInfoPress,
}: PaymentComparisonTableProps) {
  const renderItem = useCallback<ListRenderItem<PaymentComparisonOption>>(
    ({ item, index }) => (
      <PaymentComparisonRow
        option={item}
        selected={item.id === selectedId}
        isLast={index === options.length - 1}
        onSelect={onSelect}
      />
    ),
    [onSelect, options.length, selectedId],
  );

  const keyExtractor = useCallback((item: PaymentComparisonOption) => item.id, []);

  return (
    <Animated.View
      entering={FadeInDown.duration(320).springify().damping(18)}
      className="overflow-hidden rounded-2xl border border-brand-border bg-brand-white"
      style={elevation.sm}
    >
      <View className="flex-row items-start justify-between border-b border-brand-border px-4 py-4">
        <View className="mr-3 flex-1">
          <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
            Payment Matrix
          </Typography>
          <Typography
            variant="roleDescription"
            className="mt-1 text-[12px] leading-[18px] text-brand-body"
          >
            Choose terms based on your cash flow and risk profile.
          </Typography>
        </View>

        <Pressable
          onPress={onInfoPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Payment matrix information"
          className="h-7 w-7 items-center justify-center rounded-full border border-brand-border bg-brand-white"
        >
          <InfoIcon size={iconSizes.sm} color={brandColors.primary} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ minWidth: '100%' }}
      >
        <View style={{ minWidth: PAYMENT_COMPARISON_TABLE_MIN_WIDTH, flexGrow: 1 }}>
          <View className="flex-row items-center border-b border-brand-border bg-brand-surface px-3 py-2.5">
            {TABLE_HEADERS.map((header) => (
              <View
                key={header.key}
                style={{ width: header.width }}
                className={header.key === 'method' ? 'items-start pr-2' : 'items-center px-0.5'}
              >
                <Typography
                  variant="fieldLabel"
                  className="text-[9px] tracking-[0.4px] text-brand-muted"
                >
                  {header.label}
                </Typography>
              </View>
            ))}
          </View>

          <FlatList
            data={options}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            scrollEnabled={false}
            extraData={selectedId}
          />
        </View>
      </ScrollView>
    </Animated.View>
  );
});
