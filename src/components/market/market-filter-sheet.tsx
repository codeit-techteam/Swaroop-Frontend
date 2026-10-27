import { forwardRef, memo, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { Pressable, View } from 'react-native';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

import { PrimaryButton, SecondaryButton, Typography } from '@/components/ui';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';
import {
  EMPTY_MARKET_FILTERS,
  MARKET_SORT_OPTIONS,
  normalizeMarketFilters,
  parseFilterNumber,
  type MarketFacets,
  type MarketFilters,
} from '@/utils/market-filters';

const FACET_LIMIT = 30;

type MarketFilterSheetProps = {
  filters: MarketFilters;
  facets: MarketFacets;
  /** How many listings the current draft would keep — shown on the Apply button. */
  previewCount?: (draft: MarketFilters) => number;
  onApply: (filters: MarketFilters) => void;
};

const SheetChip = memo(function SheetChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
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

const SheetSection = memo(function SheetSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View className="mb-xl">
      <Typography
        variant="fieldLabel"
        className="mb-md text-[11px] tracking-[0.8px] text-brand-muted"
      >
        {title}
      </Typography>
      {children}
      {hint ? (
        <Typography
          variant="caption"
          className="mt-sm font-sans text-[11px] normal-case tracking-normal text-brand-muted"
        >
          {hint}
        </Typography>
      ) : null}
    </View>
  );
});

const NumberField = memo(function NumberField({
  value,
  placeholder,
  onChangeText,
  accessibilityLabel,
}: {
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  accessibilityLabel: string;
}) {
  return (
    <BottomSheetTextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={brandColors.muted}
      keyboardType="number-pad"
      inputMode="numeric"
      accessibilityLabel={accessibilityLabel}
      className="flex-1 rounded-xl border border-brand-border bg-brand-surface px-md py-sm font-sans text-[14px] text-brand-heading"
    />
  );
});

const toggleValue = (list: string[], value: string): string[] =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

const formatInr = (value: number): string => `₹${Math.round(value).toLocaleString('en-IN')}`;

export const MarketFilterSheet = memo(
  forwardRef<BottomSheetModal, MarketFilterSheetProps>(function MarketFilterSheet(
    { filters, facets, previewCount, onApply },
    ref,
  ) {
    const snapPoints = useMemo(() => ['85%'], []);
    const [draft, setDraft] = useState<MarketFilters>(filters);
    const [priceMinText, setPriceMinText] = useState(filters.priceMin?.toString() ?? '');
    const [priceMaxText, setPriceMaxText] = useState(filters.priceMax?.toString() ?? '');
    const [maxMoqText, setMaxMoqText] = useState(filters.maxMoq?.toString() ?? '');
    const [facetQuery, setFacetQuery] = useState('');

    const syncFromFilters = useCallback((next: MarketFilters) => {
      setDraft(next);
      setPriceMinText(next.priceMin?.toString() ?? '');
      setPriceMaxText(next.priceMax?.toString() ?? '');
      setMaxMoqText(next.maxMoq?.toString() ?? '');
      setFacetQuery('');
    }, []);

    useEffect(() => {
      syncFromFilters(filters);
    }, [filters, syncFromFilters]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
      ),
      [],
    );

    const composedDraft = useMemo(
      () =>
        normalizeMarketFilters({
          ...draft,
          priceMin: parseFilterNumber(priceMinText),
          priceMax: parseFilterNumber(priceMaxText),
          maxMoq: parseFilterNumber(maxMoqText),
        }),
      [draft, maxMoqText, priceMaxText, priceMinText],
    );

    const matches = previewCount ? previewCount(composedDraft) : null;

    const visibleManufacturers = useMemo(() => {
      const needle = facetQuery.trim().toLowerCase();
      const list = needle
        ? facets.manufacturers.filter((item) => item.name.toLowerCase().includes(needle))
        : facets.manufacturers;
      const top = list.slice(0, FACET_LIMIT);
      for (const selected of draft.manufacturers) {
        if (!top.some((item) => item.name === selected)) top.unshift({ name: selected, count: 0 });
      }
      return top;
    }, [draft.manufacturers, facetQuery, facets.manufacturers]);

    const visibleOrigins = useMemo(() => facets.origins.slice(0, FACET_LIMIT), [facets.origins]);

    const priceHint = facets.priceRange
      ? `Listings range from ${formatInr(facets.priceRange.min)} to ${formatInr(facets.priceRange.max)} per MT.`
      : undefined;

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        handleIndicatorStyle={{ backgroundColor: brandColors.indicatorInactive }}
        backgroundStyle={{ backgroundColor: brandColors.white }}
        onDismiss={() => syncFromFilters(filters)}
      >
        <BottomSheetScrollView
          className="flex-1 px-lg"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <Typography variant="roleTitle" className="mb-lg text-[18px] text-brand-heading">
            Filter listings
          </Typography>

          <SheetSection title="AVAILABILITY">
            <View className="flex-row flex-wrap gap-sm">
              <SheetChip
                label="In stock only"
                selected={draft.inStockOnly}
                onPress={() => setDraft((prev) => ({ ...prev, inStockOnly: !prev.inStockOnly }))}
              />
              <SheetChip
                label="Credit eligible"
                selected={draft.creditEligibleOnly}
                onPress={() =>
                  setDraft((prev) => ({ ...prev, creditEligibleOnly: !prev.creditEligibleOnly }))
                }
              />
            </View>
          </SheetSection>

          <SheetSection title="SORT BY">
            <View className="flex-row flex-wrap gap-sm">
              {MARKET_SORT_OPTIONS.map((option) => (
                <SheetChip
                  key={option.value}
                  label={option.label}
                  selected={draft.sort === option.value}
                  onPress={() => setDraft((prev) => ({ ...prev, sort: option.value }))}
                />
              ))}
            </View>
          </SheetSection>

          <SheetSection title="PRICE PER MT (₹)" hint={priceHint}>
            <View className="flex-row gap-sm">
              <NumberField
                value={priceMinText}
                placeholder="Min"
                onChangeText={setPriceMinText}
                accessibilityLabel="Minimum price per MT"
              />
              <NumberField
                value={priceMaxText}
                placeholder="Max"
                onChangeText={setPriceMaxText}
                accessibilityLabel="Maximum price per MT"
              />
            </View>
          </SheetSection>

          <SheetSection
            title="MAXIMUM MOQ (MT)"
            hint="Hide listings whose minimum order is larger than you need."
          >
            <View className="flex-row gap-sm">
              <NumberField
                value={maxMoqText}
                placeholder="e.g. 5"
                onChangeText={setMaxMoqText}
                accessibilityLabel="Maximum minimum order quantity"
              />
            </View>
          </SheetSection>

          {facets.manufacturers.length > 0 ? (
            <SheetSection title="MANUFACTURER">
              <BottomSheetTextInput
                value={facetQuery}
                onChangeText={setFacetQuery}
                placeholder="Filter manufacturers"
                placeholderTextColor={brandColors.muted}
                autoCorrect={false}
                autoCapitalize="none"
                className="mb-md rounded-xl border border-brand-border bg-brand-surface px-md py-sm font-sans text-[14px] text-brand-heading"
              />
              <View className="flex-row flex-wrap gap-sm">
                {visibleManufacturers.map((item) => (
                  <SheetChip
                    key={item.name}
                    label={item.count > 0 ? `${item.name} (${item.count})` : item.name}
                    selected={draft.manufacturers.includes(item.name)}
                    onPress={() =>
                      setDraft((prev) => ({
                        ...prev,
                        manufacturers: toggleValue(prev.manufacturers, item.name),
                      }))
                    }
                  />
                ))}
              </View>
            </SheetSection>
          ) : null}

          {facets.origins.length > 0 ? (
            <SheetSection title="ORIGIN">
              <View className="flex-row flex-wrap gap-sm">
                {visibleOrigins.map((item) => (
                  <SheetChip
                    key={item.name}
                    label={`${item.name} (${item.count})`}
                    selected={draft.origins.includes(item.name)}
                    onPress={() =>
                      setDraft((prev) => ({
                        ...prev,
                        origins: toggleValue(prev.origins, item.name),
                      }))
                    }
                  />
                ))}
              </View>
            </SheetSection>
          ) : null}

          <View className="flex-row gap-sm">
            <View className="flex-1">
              <SecondaryButton label="Reset" onPress={() => onApply(EMPTY_MARKET_FILTERS)} />
            </View>
            <View className="flex-1">
              <PrimaryButton
                label={
                  matches === null
                    ? 'Apply'
                    : matches === 0
                      ? 'No matches'
                      : `Show ${matches} ${matches === 1 ? 'listing' : 'listings'}`
                }
                onPress={() => onApply(composedDraft)}
              />
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }),
);
