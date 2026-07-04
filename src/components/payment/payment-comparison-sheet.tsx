import { forwardRef, memo, useCallback, useMemo } from 'react';

import { View } from 'react-native';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

import { Typography } from '@/components/ui/typography';
import { PAYMENT_COMPARISON_ROWS } from '@/constants/payment';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type PaymentComparisonSheetProps = {
  selectedMethodId?: string;
};

export const PaymentComparisonSheet = memo(
  forwardRef<BottomSheetModal, PaymentComparisonSheetProps>(function PaymentComparisonSheet(
    { selectedMethodId },
    ref,
  ) {
    const snapPoints = useMemo(() => ['72%'], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
      ),
      [],
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
          <Typography variant="roleTitle" className="mb-xs text-[18px] text-brand-heading">
            Compare Payment Options
          </Typography>
          <Typography variant="roleDescription" className="mb-lg text-[13px] text-brand-body">
            Frontend comparison only. No credit checks or payment APIs are connected.
          </Typography>

          <View style={{ gap: 12 }}>
            {PAYMENT_COMPARISON_ROWS.map((row) => {
              const isSelected = row.id === selectedMethodId;
              return (
                <View
                  key={row.id}
                  className={cn(
                    'rounded-2xl border px-md py-md',
                    isSelected
                      ? 'border-brand-heading bg-brand-primary-tint'
                      : 'border-brand-border bg-brand-white',
                  )}
                >
                  <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                    {row.title}
                  </Typography>

                  <View className="mt-sm" style={{ gap: 6 }}>
                    <ComparisonLine label="Payment Timing" value={row.timing} />
                    <ComparisonLine label="Interest" value={row.interest} />
                    <ComparisonLine label="Credit" value={row.credit} />
                    <ComparisonLine label="Best For" value={row.bestFor} />
                  </View>
                </View>
              );
            })}
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }),
);

const ComparisonLine = memo(function ComparisonLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start justify-between">
      <Typography variant="fieldLabel" className="text-[10px] tracking-[0.5px] text-brand-muted">
        {label}
      </Typography>
      <Typography
        variant="roleDescription"
        className="ml-md flex-1 text-right text-[12px] text-brand-heading"
      >
        {value}
      </Typography>
    </View>
  );
});
