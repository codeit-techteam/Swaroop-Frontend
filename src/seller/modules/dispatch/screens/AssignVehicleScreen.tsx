import { memo, useEffect, useMemo, useState } from 'react';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components';
import { SellerHeader } from '@/seller/components/SellerHeader';
import {
  AssignVehicleBottomSheet,
  VehicleCard,
} from '@/seller/modules/dispatch/components';
import { useDispatchStore } from '@/seller/modules/dispatch/store/dispatchStore';
import { ROUTES } from '@/navigation/routes';

export const AssignVehicleScreen = memo(function AssignVehicleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const orders = useDispatchStore((state) => state.dispatchOrders);
  const vehicles = useDispatchStore((state) => state.vehicles);
  const drivers = useDispatchStore((state) => state.drivers);
  const assignVehicle = useDispatchStore((state) => state.assignVehicle);
  const selectDispatch = useDispatchStore((state) => state.selectDispatch);
  const hydrateDispatchState = useDispatchStore((state) => state.hydrateDispatchState);
  const isHydrated = useDispatchStore((state) => state.isHydrated);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) {
      hydrateDispatchState();
    }
  }, [hydrateDispatchState, isHydrated]);

  const order = useMemo(() => orders.find((item) => item.id === orderId) ?? null, [orderId, orders]);

  useEffect(() => {
    if (order?.vehicleId) {
      setSelectedVehicleId(order.vehicleId);
    }
    if (order?.driverId) {
      setSelectedDriverId(order.driverId);
    }
  }, [order?.driverId, order?.vehicleId]);

  const selectedVehicle = vehicles.find((item) => item.id === selectedVehicleId) ?? null;
  const selectedDriver = drivers.find((item) => item.id === selectedDriverId) ?? null;

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-background px-lg">
        <Typography variant="roleTitle">Dispatch order not found.</Typography>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-background">
      <SellerHeader title="Assign Vehicle" showBack onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 132 }}
      >
        <View className="rounded-[22px] border border-brand-border bg-brand-white p-md">
          <Typography variant="fieldLabel">ORDER ID</Typography>
          <Typography variant="headingLeft" className="mt-xs text-[26px]">
            {order.id.replace('PT-', '#')}
          </Typography>
          <Typography variant="subheadingLeft" className="mt-sm text-brand-body">
            Select a fleet vehicle and driver to continue the dispatch workflow.
          </Typography>
        </View>

        <View className="mt-lg">
          <VehicleCard
            order={{
              ...order,
              vehicleId: selectedVehicle?.id ?? order.vehicleId,
              vehicleNumber: selectedVehicle?.vehicleNumber ?? order.vehicleNumber,
              vehicleType: selectedVehicle?.vehicleType ?? order.vehicleType,
              vehicleCapacity: selectedVehicle?.capacity ?? order.vehicleCapacity,
              driverId: selectedDriver?.id ?? order.driverId,
              driverName: selectedDriver?.name ?? order.driverName,
              driverPhone: selectedDriver?.phone ?? order.driverPhone,
            }}
          />
        </View>

        <View className="mt-lg gap-md">
          <Pressable
            onPress={() => setPickerVisible(true)}
            className="rounded-2xl border border-brand-border bg-brand-white px-md py-md"
          >
            <Typography variant="fieldLabel">Vehicle</Typography>
            <Typography variant="roleTitle" className="mt-xs">
              {selectedVehicle
                ? `${selectedVehicle.vehicleNumber} • ${selectedVehicle.vehicleType}`
                : 'Choose vehicle'}
            </Typography>
          </Pressable>

          <Pressable
            onPress={() => setPickerVisible(true)}
            className="rounded-2xl border border-brand-border bg-brand-white px-md py-md"
          >
            <Typography variant="fieldLabel">Driver</Typography>
            <Typography variant="roleTitle" className="mt-xs">
              {selectedDriver ? `${selectedDriver.name} • ${selectedDriver.phone}` : 'Choose driver'}
            </Typography>
          </Pressable>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="gap-sm">
          <Pressable
            onPress={() => {
              if (!selectedVehicleId || !selectedDriverId) {
                Toast.show({ type: 'info', text1: 'Select vehicle and driver first' });
                return;
              }
              const updated = assignVehicle(order.id, selectedVehicleId, selectedDriverId);
              if (!updated) {
                Toast.show({ type: 'error', text1: 'Vehicle assignment failed' });
                return;
              }
              selectDispatch(order.id);
              router.replace({
                pathname: ROUTES.SELLER.DISPATCH_MANAGEMENT,
                params: { orderId: order.id },
              } as unknown as Href);
            }}
            className="rounded-2xl bg-brand-navy px-lg py-md"
          >
            <Typography variant="button" className="text-center text-brand-white">
              Assign Vehicle
            </Typography>
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            className="rounded-2xl border border-brand-border bg-brand-white px-lg py-md"
          >
            <Typography variant="button" className="text-center text-brand-heading">
              Cancel
            </Typography>
          </Pressable>
        </View>
      </View>

      <AssignVehicleBottomSheet
        visible={pickerVisible}
        vehicles={vehicles}
        drivers={drivers}
        selectedVehicleId={selectedVehicleId}
        selectedDriverId={selectedDriverId}
        onSelectVehicle={setSelectedVehicleId}
        onSelectDriver={setSelectedDriverId}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  );
});
