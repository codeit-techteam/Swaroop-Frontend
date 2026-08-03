import { memo, useEffect, useMemo, useState } from 'react';

import { type Href, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { SearchField, FilterChipRow } from '@/seller/components';
import {
  DispatchOrderCard,
  DispatchSummaryCard,
} from '@/seller/modules/dispatch/components';
import type {
  DispatchOrder,
  DispatchStageFilter,
} from '@/seller/modules/dispatch/types/dispatch';
import { useDispatchStore } from '@/seller/modules/dispatch/store/dispatchStore';
import { SellerHeader } from '@/seller/components/SellerHeader';

const filterOptions: DispatchStageFilter[] = ['All', 'Ready', 'Loading', 'Dispatched', 'Delivered'];

const matchesFilter = (order: DispatchOrder, filter: DispatchStageFilter): boolean => {
  switch (filter) {
    case 'Ready':
      return (
        order.stage === 'ready_to_dispatch' ||
        order.stage === 'invoice_generated' ||
        order.stage === 'vehicle_assigned' ||
        order.stage === 'dispatch_ready'
      );
    case 'Loading':
      return order.stage === 'loading';
    case 'Dispatched':
      return (
        order.stage === 'dispatched' || order.stage === 'in_transit' || order.stage === 'delayed'
      );
    case 'Delivered':
      return order.stage === 'delivered';
    default:
      return true;
  }
};

export const DispatchOrdersScreen = memo(function DispatchOrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<DispatchStageFilter>('All');
  const orders = useDispatchStore((state) => state.dispatchOrders);
  const summary = useDispatchStore((state) => state.summary);
  const isHydrated = useDispatchStore((state) => state.isHydrated);
  const hydrateDispatchState = useDispatchStore((state) => state.hydrateDispatchState);
  const generateInvoice = useDispatchStore((state) => state.generateInvoice);
  const selectDispatch = useDispatchStore((state) => state.selectDispatch);

  useEffect(() => {
    if (!isHydrated) {
      hydrateDispatchState();
    }
  }, [hydrateDispatchState, isHydrated]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        order.id.toLowerCase().includes(normalizedQuery) ||
        order.customerName.toLowerCase().includes(normalizedQuery) ||
        order.material.toLowerCase().includes(normalizedQuery) ||
        (order.vehicleNumber ?? '').toLowerCase().includes(normalizedQuery);
      return matchesSearch && matchesFilter(order, filter);
    });
  }, [filter, orders, query]);

  const openDispatch = (order: DispatchOrder) => {
    selectDispatch(order.id);
    router.push({
      pathname: ROUTES.SELLER.DISPATCH_DETAIL,
      params: { orderId: order.id },
    } as unknown as Href);
  };

  const handlePrimaryAction = (order: DispatchOrder) => {
    if (!order.invoiceNumber) {
      generateInvoice(order.id);
      router.push({ pathname: ROUTES.SELLER.INVOICE_GENERATED, params: { orderId: order.id } } as unknown as Href);
      return;
    }
    if (!order.vehicleNumber) {
      router.push({ pathname: ROUTES.SELLER.ASSIGN_VEHICLE, params: { orderId: order.id } } as unknown as Href);
      return;
    }
    router.push({ pathname: ROUTES.CUSTOMER.SHIPMENT_TRACKING, params: { orderId: order.id } } as unknown as Href);
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader title="Dispatch Orders" showBack onBack={() => router.back()} showBell />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
      >
        <View className="gap-md">
          <View className="flex-row gap-md">
            <DispatchSummaryCard title="Ready To Dispatch" value={summary.readyToDispatch} accent="navy" />
            <DispatchSummaryCard title="In Transit" value={summary.inTransit} accent="blue" />
          </View>
          <View className="flex-row gap-md">
            <DispatchSummaryCard title="Delivered" value={summary.delivered} accent="green" />
            <DispatchSummaryCard title="Delayed" value={summary.delayed} accent="red" />
          </View>
        </View>

        <View className="mt-lg">
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder="Search Order ID, Customer, Vehicle..."
          />
        </View>

        <View className="mt-lg">
          <FilterChipRow options={filterOptions} selected={filter} onSelect={(value) => setFilter(value as DispatchStageFilter)} />
        </View>

        <View className="mt-lg gap-lg">
          {filteredOrders.map((order) => (
            <DispatchOrderCard
              key={order.id}
              order={order}
              onPrimaryAction={handlePrimaryAction}
              onViewDispatch={openDispatch}
            />
          ))}

          {filteredOrders.length === 0 ? (
            <View className="rounded-2xl border border-brand-border bg-brand-white px-lg py-2xl">
              <Typography variant="roleTitle" className="text-center">
                No dispatch orders match your filters
              </Typography>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
});
