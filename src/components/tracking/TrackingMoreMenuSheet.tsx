import { forwardRef, memo, useCallback, useMemo } from 'react';

import { Pressable } from 'react-native';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

import { Typography } from '@/components/ui';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

export type TrackingMenuAction =
  | 'track_history'
  | 'raise_support'
  | 'contact_support'
  | 'download_invoice'
  | 'cancel_order';

type TrackingMoreMenuSheetProps = {
  canCancelOrder: boolean;
  onAction: (action: TrackingMenuAction) => void;
};

type MenuItemProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
};

const MenuItem = memo(function MenuItem({
  label,
  onPress,
  disabled = false,
  destructive = false,
}: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={cn(
        'border-b border-brand-border px-lg py-lg',
        disabled && 'opacity-40',
      )}
    >
      <Typography
        variant="roleTitle"
        className={cn(
          'text-[15px]',
          destructive ? 'text-brand-error' : 'text-brand-heading',
        )}
      >
        {label}
      </Typography>
    </Pressable>
  );
});

export const TrackingMoreMenuSheet = forwardRef<BottomSheetModal, TrackingMoreMenuSheetProps>(
  function TrackingMoreMenuSheet({ canCancelOrder, onAction }, ref) {
    const snapPoints = useMemo(() => ['42%'], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.45} />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: brandColors.white }}
        handleIndicatorStyle={{ backgroundColor: brandColors.border }}
      >
        <BottomSheetView className="pb-xl">
          <Typography
            variant="roleTitle"
            className="mb-md px-lg text-[16px] text-brand-heading"
          >
            More Options
          </Typography>

          <MenuItem label="Track History" onPress={() => onAction('track_history')} />
          <MenuItem label="Raise Support Ticket" onPress={() => onAction('raise_support')} />
          <MenuItem label="Contact Support" onPress={() => onAction('contact_support')} />
          <MenuItem label="Download Invoice" onPress={() => onAction('download_invoice')} />
          <MenuItem
            label="Cancel Order"
            onPress={() => onAction('cancel_order')}
            disabled={!canCancelOrder}
            destructive
          />
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);
