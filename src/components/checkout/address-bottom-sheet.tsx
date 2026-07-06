import { forwardRef, memo, useCallback, useMemo } from 'react';

import { Pressable, View } from 'react-native';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

import { Typography } from '@/components/ui/typography';
import { CHECKOUT_ADDRESSES, formatCheckoutCurrency } from '@/constants/checkout';
import { LocationPinIcon, TruckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { CheckoutShippingAddress } from '@/types/checkout';
import { cn } from '@/utils/cn';

type AddressBottomSheetProps = {
  selectedId: string;
  addresses?: CheckoutShippingAddress[];
  onSelect: (addressId: string) => void;
};

export const AddressBottomSheet = memo(
  forwardRef<BottomSheetModal, AddressBottomSheetProps>(function AddressBottomSheet(
    { selectedId, addresses = CHECKOUT_ADDRESSES, onSelect },
    ref,
  ) {
    const snapPoints = useMemo(() => ['58%'], []);

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
        <BottomSheetView className="flex-1 px-lg pb-xl">
          <Typography variant="roleTitle" className="mb-xs text-[17px] text-brand-heading">
            Select Shipping Address
          </Typography>
          <Typography variant="roleDescription" className="mb-md text-[13px] text-brand-body">
            Freight and total payable update instantly based on warehouse location.
          </Typography>

          {addresses.map((address) => {
            const isSelected = address.id === selectedId;

            return (
              <Pressable
                key={address.id}
                onPress={() => onSelect(address.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={address.warehouseName}
                className={cn(
                  'mb-sm rounded-xl border px-md py-md',
                  isSelected
                    ? 'border-brand-primary bg-brand-primary-light'
                    : 'border-brand-border bg-brand-white',
                )}
              >
                <View className="flex-row items-start">
                  <View className="mr-md mt-0.5 h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-light">
                    <TruckIcon
                      size={iconSizes.sm}
                      color={isSelected ? brandColors.primary : brandColors.muted}
                    />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Typography
                        variant="roleTitle"
                        className={cn(
                          'flex-1 text-[15px]',
                          isSelected ? 'text-brand-primary' : 'text-brand-heading',
                        )}
                        numberOfLines={1}
                      >
                        {address.warehouseName}
                      </Typography>
                      {isSelected ? (
                        <View className="ml-sm h-2.5 w-2.5 rounded-full bg-brand-primary" />
                      ) : null}
                    </View>

                    <View className="mt-xs flex-row items-center">
                      <LocationPinIcon size={iconSizes.xs} color={brandColors.muted} />
                      <Typography
                        variant="caption"
                        className="ml-xs flex-1 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
                        numberOfLines={2}
                      >
                        {address.line1}, {address.line2}, {address.state}
                      </Typography>
                    </View>

                    <Typography
                      variant="roleDescription"
                      className="mt-xs text-[12px] text-brand-body"
                    >
                      Freight: {formatCheckoutCurrency(address.freightAmount)} · ETA:{' '}
                      {address.etaLabel}
                    </Typography>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }),
);
