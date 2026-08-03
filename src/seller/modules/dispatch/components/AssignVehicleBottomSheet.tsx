import { memo } from 'react';

import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Typography } from '@/components';
import { cn } from '@/utils/cn';
import type { DispatchDriver, DispatchVehicle } from '@/seller/modules/dispatch/types/dispatch';

export const AssignVehicleBottomSheet = memo(function AssignVehicleBottomSheet({
  visible,
  vehicles,
  drivers,
  selectedVehicleId,
  selectedDriverId,
  onSelectVehicle,
  onSelectDriver,
  onClose,
}: {
  visible: boolean;
  vehicles: DispatchVehicle[];
  drivers: DispatchDriver[];
  selectedVehicleId: string | null;
  selectedDriverId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  onSelectDriver: (driverId: string) => void;
  onClose: () => void;
}) {
  if (!visible) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable className="flex-1 justify-end bg-black/35" onPress={onClose}>
        <Pressable
          className="rounded-t-[28px] bg-brand-white px-lg pb-2xl pt-md"
          onPress={(event) => event.stopPropagation()}
        >
          <View className="mb-md h-1 w-12 self-center rounded-full bg-brand-border" />
          <Typography variant="headingLeft" className="text-[22px]">
            Assign Vehicle
          </Typography>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 16, paddingTop: 16 }}
          >
            <View>
              <Typography variant="badge" className="text-brand-body">
                VEHICLES
              </Typography>
              <View className="mt-sm gap-sm">
                {vehicles.map((vehicle) => {
                  const selected = selectedVehicleId === vehicle.id;
                  return (
                    <Pressable
                      key={vehicle.id}
                      onPress={() => onSelectVehicle(vehicle.id)}
                      className={cn(
                        'rounded-2xl border px-md py-md',
                        selected
                          ? 'border-brand-primary bg-brand-primary-light'
                          : 'border-brand-border bg-brand-white',
                      )}
                    >
                      <Typography variant="roleTitle">{vehicle.vehicleNumber}</Typography>
                      <Typography variant="legal" className="mt-xs text-left text-brand-body">
                        {vehicle.vehicleType} • {vehicle.capacity} • {vehicle.currentStatus}
                      </Typography>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View>
              <Typography variant="badge" className="text-brand-body">
                DRIVERS
              </Typography>
              <View className="mt-sm gap-sm">
                {drivers.map((driver) => {
                  const selected = selectedDriverId === driver.id;
                  return (
                    <Pressable
                      key={driver.id}
                      onPress={() => onSelectDriver(driver.id)}
                      className={cn(
                        'rounded-2xl border px-md py-md',
                        selected
                          ? 'border-brand-primary bg-brand-primary-light'
                          : 'border-brand-border bg-brand-white',
                      )}
                    >
                      <Typography variant="roleTitle">{driver.name}</Typography>
                      <Typography variant="legal" className="mt-xs text-left text-brand-body">
                        {driver.phone}
                      </Typography>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
});
