import { memo } from 'react';

import { FlatList, RefreshControl, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import {
  ActivityTimeline,
  AnalyticsSkeleton,
  KpiCard,
  OrderAnalyticsCard,
  ProductPerformanceCard,
  RevenueChart,
  WarehouseCard,
} from '@/seller/components/analytics';
import { QuickActionCard, SellerHeader } from '@/seller/components';
import { useSellerAnalytics } from '@/seller/hooks/useSellerAnalytics';

const AnimatedView = Animated.createAnimatedComponent(View);

export const SellerAnalyticsScreen = memo(function SellerAnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    data,
    revenuePeriod,
    revenueSeries,
    chartKey,
    isLoading,
    isRefreshing,
    changeRevenuePeriod,
    refresh,
  } = useSellerAnalytics();

  const sections = [
    { id: 'kpis-1', type: 'kpis-1' as const },
    { id: 'kpis-2', type: 'kpis-2' as const },
    { id: 'chart', type: 'chart' as const },
    { id: 'orders', type: 'orders' as const },
    { id: 'products', type: 'products' as const },
    { id: 'warehouses', type: 'warehouses' as const },
    { id: 'shipments', type: 'shipments' as const },
    { id: 'financial', type: 'financial' as const },
    { id: 'activities', type: 'activities' as const },
    { id: 'actions', type: 'actions' as const },
  ];

  const renderSection = ({ item }: { item: (typeof sections)[number] }) => {
    switch (item.type) {
      case 'kpis-1':
        return (
          <AnimatedView entering={FadeInDown.duration(300)} className="flex-row flex-wrap gap-md">
            <KpiCard label="Today's Revenue" value={data.revenue.today} accent="navy" />
            <KpiCard label="Monthly Revenue" value={data.revenue.monthly} accent="navy" />
            <KpiCard label="Orders Completed" value={String(data.orders.completed)} />
            <KpiCard label="Active Products" value={String(data.products.active)} />
          </AnimatedView>
        );
      case 'kpis-2':
        return (
          <AnimatedView entering={FadeInDown.delay(50).duration(300)} className="mt-lg flex-row flex-wrap gap-md">
            <KpiCard label="Inventory Value" value={data.inventory.value} />
            <KpiCard label="Offers Live" value={String(data.inventory.offersLive)} />
            <KpiCard label="Conversion Rate" value={data.inventory.conversionRate} accent="success" />
            <KpiCard label="Customer Rating" value={data.inventory.customerRating} accent="success" />
          </AnimatedView>
        );
      case 'chart':
        return (
          <AnimatedView entering={FadeInDown.delay(100).duration(300)} className="mt-lg">
            <RevenueChart
              values={revenueSeries}
              selectedPeriod={revenuePeriod}
              onPeriodChange={changeRevenuePeriod}
              chartKey={chartKey}
            />
          </AnimatedView>
        );
      case 'orders':
        return (
          <AnimatedView entering={FadeInDown.delay(150).duration(300)} className="mt-lg">
            <Typography variant="roleTitle" className="mb-md text-brand-heading">
              Orders Analytics
            </Typography>
            <View className="flex-row flex-wrap gap-md">
              {data.orders.breakdown.map((order) => (
                <OrderAnalyticsCard
                  key={order.id}
                  label={order.label}
                  count={order.count}
                  percentage={order.percentage}
                />
              ))}
            </View>
          </AnimatedView>
        );
      case 'products':
        return (
          <AnimatedView entering={FadeInDown.delay(200).duration(300)} className="mt-lg">
            <Typography variant="roleTitle" className="mb-md text-brand-heading">
              Top Selling Products
            </Typography>
            {data.products.topSelling.map((product) => (
              <ProductPerformanceCard key={product.id} product={product} />
            ))}
          </AnimatedView>
        );
      case 'warehouses':
        return (
          <AnimatedView entering={FadeInDown.delay(250).duration(300)} className="mt-lg">
            <Typography variant="roleTitle" className="mb-md text-brand-heading">
              Warehouse Analytics
            </Typography>
            {data.warehouses.map((warehouse) => (
              <WarehouseCard key={warehouse.id} warehouse={warehouse} />
            ))}
          </AnimatedView>
        );
      case 'shipments':
        return (
          <AnimatedView entering={FadeInDown.delay(300).duration(300)} className="mt-lg">
            <Typography variant="roleTitle" className="mb-md text-brand-heading">
              Shipment Analytics
            </Typography>
            <View className="flex-row flex-wrap gap-md">
              <KpiCard label="Live" value={String(data.shipments.live)} />
              <KpiCard label="Delayed" value={String(data.shipments.delayed)} />
              <KpiCard label="Delivered" value={String(data.shipments.delivered)} />
              <KpiCard label="Average ETA" value={data.shipments.averageEta} />
            </View>
            <View className="mt-md">
              <KpiCard label="Average Transit Time" value={data.shipments.averageTransitTime} />
            </View>
          </AnimatedView>
        );
      case 'financial':
        return (
          <AnimatedView entering={FadeInDown.delay(350).duration(300)} className="mt-lg rounded-2xl border border-brand-border bg-brand-white px-md py-md">
            <Typography variant="roleTitle" className="text-brand-heading">
              Financial Summary
            </Typography>
            {[
              { label: 'Pending Settlement', value: data.settlement.pending },
              { label: 'Released', value: data.settlement.released },
              { label: 'TDS', value: data.settlement.tds },
              { label: 'Platform Fees', value: data.settlement.platformFees },
              { label: 'Net Earnings', value: data.settlement.netEarnings },
            ].map((row) => (
              <View key={row.label} className="mt-md flex-row items-center justify-between border-b border-brand-border pb-sm">
                <Typography variant="roleDescription">{row.label}</Typography>
                <Typography variant="roleTitle" className="text-[#0B4A8B]">
                  {row.value}
                </Typography>
              </View>
            ))}
          </AnimatedView>
        );
      case 'activities':
        return (
          <AnimatedView entering={FadeInDown.delay(400).duration(300)} className="mt-lg">
            <ActivityTimeline activities={data.activities} />
          </AnimatedView>
        );
      case 'actions':
        return (
          <AnimatedView entering={FadeInDown.delay(450).duration(300)} className="mt-lg">
            <Typography variant="roleTitle" className="mb-md text-brand-heading">
              Quick Actions
            </Typography>
            <View className="flex-row flex-wrap gap-md">
              <QuickActionCard
                label="Add Product"
                icon="add"
                onPress={() => router.push(ROUTES.SELLER.ADD_PRODUCT as Href)}
              />
              <QuickActionCard
                label="Create Offer"
                icon="offers"
                onPress={() => router.push(ROUTES.SELLER.CREATE_OFFER as Href)}
              />
              <QuickActionCard
                label="Update Inventory"
                icon="stock"
                onPress={() => router.push(ROUTES.SELLER.INVENTORY as Href)}
              />
              <QuickActionCard
                label="View Orders"
                icon="dispatch"
                onPress={() => router.push(ROUTES.SELLER.ORDERS as Href)}
              />
            </View>
          </AnimatedView>
        );
      default:
        return null;
    }
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader title="Analytics" showBack showBell onBack={() => router.back()} />

      {isLoading ? (
        <View className="flex-1 px-lg pt-md">
          <AnalyticsSkeleton />
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderSection}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 32, paddingTop: 12 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />}
        />
      )}
    </ScreenWrapper>
  );
});
