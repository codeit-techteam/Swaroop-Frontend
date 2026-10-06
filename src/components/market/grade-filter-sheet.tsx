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
import type { GradeFacetBucket } from '@/types/grade-master';
import { cn } from '@/utils/cn';

const MANUFACTURER_LIMIT = 40;

export type GradeSheetFilters = {
  gradeGroup: string | null;
  manufacturer: string | null;
  hasOffers: boolean;
};

type GradeFilterSheetProps = {
  filters: GradeSheetFilters;
  gradeGroups: GradeFacetBucket[];
  manufacturers: GradeFacetBucket[];
  onApply: (filters: GradeSheetFilters) => void;
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
  children,
}: {
  title: string;
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
      <View className="flex-row flex-wrap gap-sm">{children}</View>
    </View>
  );
});

export const GradeFilterSheet = memo(
  forwardRef<BottomSheetModal, GradeFilterSheetProps>(function GradeFilterSheet(
    { filters, gradeGroups, manufacturers, onApply },
    ref,
  ) {
    const snapPoints = useMemo(() => ['75%'], []);
    const [draft, setDraft] = useState<GradeSheetFilters>(filters);
    const [manufacturerQuery, setManufacturerQuery] = useState('');

    useEffect(() => {
      setDraft(filters);
    }, [filters]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
      ),
      [],
    );

    const visibleManufacturers = useMemo(() => {
      const needle = manufacturerQuery.trim().toLowerCase();
      const matches = needle
        ? manufacturers.filter((item) => item.name.toLowerCase().includes(needle))
        : [...manufacturers].sort((a, b) => b.gradeCount - a.gradeCount);
      const top = matches.slice(0, MANUFACTURER_LIMIT);
      if (draft.manufacturer && !top.some((item) => item.name === draft.manufacturer)) {
        top.unshift({ name: draft.manufacturer, gradeCount: 0 });
      }
      return top;
    }, [draft.manufacturer, manufacturerQuery, manufacturers]);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: brandColors.indicatorInactive }}
        backgroundStyle={{ backgroundColor: brandColors.white }}
        onDismiss={() => setDraft(filters)}
      >
        <BottomSheetScrollView
          className="flex-1 px-lg"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <Typography variant="roleTitle" className="mb-lg text-[18px] text-brand-heading">
            Filter grades
          </Typography>

          <SheetSection title="AVAILABILITY">
            <SheetChip
              label="Only grades with live offers"
              selected={draft.hasOffers}
              onPress={() => setDraft((prev) => ({ ...prev, hasOffers: !prev.hasOffers }))}
            />
          </SheetSection>

          {gradeGroups.length > 0 ? (
            <SheetSection title="GRADE GROUP">
              {gradeGroups.map((group) => (
                <SheetChip
                  key={group.name}
                  label={`${group.name} (${group.gradeCount})`}
                  selected={draft.gradeGroup === group.name}
                  onPress={() =>
                    setDraft((prev) => ({
                      ...prev,
                      gradeGroup: prev.gradeGroup === group.name ? null : group.name,
                    }))
                  }
                />
              ))}
            </SheetSection>
          ) : null}

          {manufacturers.length > 0 ? (
            <View className="mb-xl">
              <Typography
                variant="fieldLabel"
                className="mb-md text-[11px] tracking-[0.8px] text-brand-muted"
              >
                MANUFACTURER
              </Typography>
              <BottomSheetTextInput
                value={manufacturerQuery}
                onChangeText={setManufacturerQuery}
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
                    label={item.gradeCount > 0 ? `${item.name} (${item.gradeCount})` : item.name}
                    selected={draft.manufacturer === item.name}
                    onPress={() =>
                      setDraft((prev) => ({
                        ...prev,
                        manufacturer: prev.manufacturer === item.name ? null : item.name,
                      }))
                    }
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View className="flex-row gap-sm">
            <View className="flex-1">
              <SecondaryButton
                label="Reset"
                onPress={() => onApply({ gradeGroup: null, manufacturer: null, hasOffers: false })}
              />
            </View>
            <View className="flex-1">
              <PrimaryButton label="Apply" onPress={() => onApply(draft)} />
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }),
);
