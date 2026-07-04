import { forwardRef, memo, useCallback, useMemo } from 'react';

import { Pressable, View } from 'react-native';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

import { Typography } from '@/components/ui/typography';
import { DELIVERY_LOCATIONS } from '@/constants/dashboard';
import { LocationPinIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { DeliveryLocation } from '@/types/home';
import { cn } from '@/utils/cn';

type LocationBottomSheetProps = {
  selectedId: string;
  locations?: DeliveryLocation[];
  onSelect: (location: DeliveryLocation) => void;
};

export const LocationBottomSheet = memo(
  forwardRef<BottomSheetModal, LocationBottomSheetProps>(function LocationBottomSheet(
    { selectedId, locations = DELIVERY_LOCATIONS, onSelect },
    ref,
  ) {
    const snapPoints = useMemo(() => ['48%'], []);

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
          <Typography variant="roleTitle" className="mb-md text-[17px] text-brand-heading">
            Select Delivery Location
          </Typography>

          {locations.map((location) => {
            const isSelected = location.id === selectedId;

            return (
              <Pressable
                key={location.id}
                onPress={() => onSelect(location)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={location.label}
                className={cn(
                  'mb-sm flex-row items-center rounded-xl border px-md py-md',
                  isSelected
                    ? 'border-brand-primary bg-brand-primary-light'
                    : 'border-brand-border bg-brand-white',
                )}
              >
                <LocationPinIcon color={isSelected ? brandColors.primary : brandColors.muted} />
                <View className="ml-md flex-1">
                  <Typography
                    variant="roleTitle"
                    className={cn(
                      'text-[15px]',
                      isSelected ? 'text-brand-primary' : 'text-brand-heading',
                    )}
                  >
                    {location.city}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="mt-0.5 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
                  >
                    {location.label}
                  </Typography>
                </View>
                {isSelected ? <View className="h-2.5 w-2.5 rounded-full bg-brand-primary" /> : null}
              </Pressable>
            );
          })}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }),
);
