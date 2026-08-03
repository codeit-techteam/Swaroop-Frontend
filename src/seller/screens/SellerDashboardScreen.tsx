import { memo, useMemo } from 'react';

import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { SearchIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  DashboardSkeleton,
  QuickActionCard,
  SectionHeader,
  SellerBottomNavigation,
  SellerDashboardHeader,
  ShipmentCard,
  StatsCard,
} from '@/seller/components';
import { usePullToRefresh } from '@/seller/hooks/usePullToRefresh';
import { useSkeletonLoading } from '@/seller/hooks/useSkeletonLoading';
import { useSellerShipments } from '@/seller/hooks/useSellerShipments';
import { formatSettlementAmount } from '@/seller/modules/settlement-payout/services/settlementService';
import { useSettlementStore } from '@/seller/modules/settlement-payout/store/settlementStore';
import { useSellerOrdersStore } from '@/seller/modules/seller-orders/store/sellerOrdersStore';
import { useSellerOffersStore } from '@/seller/modules/seller-offers/store/sellerOffersStore';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import { getActiveShipmentCount } from '@/seller/services/sellerMockService';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';
import { useSellerStore } from '@/seller/store/sellerStore';
import type { SellerShipment } from '@/seller/types';

export const SellerDashboardScreen = memo(function SellerDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isLoading = useSkeletonLoading();
  const refreshSellerOrdersState = useSellerOrdersStore((state) => state.refreshSellerOrdersState);
  const refreshSellerOffersState = useSellerOffersStore((state) => state.refreshSellerOffersState);
  const { isRefreshing, refresh } = usePullToRefresh(async () => {
    refreshSellerOffersState();
    refreshSellerOrdersState();
  });
  const sellerName = useSellerStore((state) => state.company.companyName || state.profile.ownerName);
  const stats = useSellerProductStore((state) => state.dashboardStats);
  const orderSummary = useSellerOrdersStore((state) => state.summary);
  const offerStats = useSellerOffersStore((state) => state.stats);
  const { dashboardPreviews } = useSellerShipments();
  const revenueToday = useSellerProductStore((state) => state.revenueToday);
  const revenueDelta = useSellerProductStore((state) => state.revenueDelta);
  const clearSelection = useSellerProductStore((state) => state.clearSelection);
  const settlementSummary = useSettlementStore((state) => state.summary);

  const goToAddProduct = () => {
    clearSelection();
    router.push(ROUTES.SELLER.ADD_PRODUCT as Href);
  };

  const dashboardStats = useMemo(
    () =>
      stats.map((stat) => {
        if (stat.id === 'new-orders') {
          return { ...stat, value: orderSummary.pending };
        }
        if (stat.id === 'active-offers') {
          return { ...stat, value: offerStats.active };
        }
        if (stat.id === 'dispatched') {
          return { ...stat, value: getActiveShipmentCount() };
        }
        return stat;
      }),
    [offerStats.active, orderSummary.pending, stats],
  );

  const dashboardShipments = useMemo<SellerShipment[]>(
    () =>
      dashboardPreviews.map((shipment) => ({
        id: shipment.id,
        shipmentId: shipment.shipmentId,
        route: shipment.route,
        status: shipment.status,
        eta: shipment.eta,
      })),
    [dashboardPreviews],
  );

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <View className="flex-1">
        <ScrollView
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 120 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />}
        >
          <SellerDashboardHeader
            sellerName={sellerName}
            onNotificationPress={() => router.push(ROUTES.SELLER.NOTIFICATIONS as Href)}
          />

          <Pressable
            onPress={() => router.push(ROUTES.SELLER.SEARCH as Href)}
            className="mt-md flex-row items-center rounded-2xl border border-brand-border bg-brand-white px-md py-md"
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            <SearchIcon size={18} />
            <Typography variant="subheading" className="ml-sm text-brand-footer">
              Search products, orders, offers...
            </Typography>
          </Pressable>

          {isLoading ? (
            <View className="mt-lg">
              <DashboardSkeleton />
            </View>
          ) : (
            <>

          <View className="mt-lg flex-row flex-wrap gap-md">
            <QuickActionCard label="Add Product" icon="add" onPress={goToAddProduct} />
            <QuickActionCard
              label="Update Stock"
              icon="stock"
              onPress={() => router.push(ROUTES.SELLER.INVENTORY as Href)}
            />
            <QuickActionCard
              label="My Offers"
              icon="offers"
              onPress={() => router.push(ROUTES.SELLER.OFFERS as Href)}
            />
            <QuickActionCard
              label="Dispatch"
              icon="dispatch"
              onPress={() => router.push(ROUTES.SELLER.DISPATCH as Href)}
            />
          </View>

          <View className="mt-lg flex-row flex-wrap gap-md">
            {dashboardStats.map((stat) => {
              const card = <StatsCard stat={stat} />;
              if (stat.id === 'active-offers') {
                return (
                  <Pressable
                    key={stat.id}
                    onPress={() => router.push(ROUTES.SELLER.OFFERS as Href)}
                    className="min-h-[84px] flex-1"
                    style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
                  >
                    {card}
                  </Pressable>
                );
              }
              return (
                <View key={stat.id} className="flex-1">
                  {card}
                </View>
              );
            })}
          </View>

          <Pressable
            onPress={() => router.push(ROUTES.SELLER.SETTLEMENTS as Href)}
            className="mt-lg rounded-[24px] border border-brand-border bg-brand-white px-lg py-lg"
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            <Typography variant="caption" className="text-left text-brand-body">
              Settlement Summary
            </Typography>
            <View className="mt-sm flex-row items-end justify-between">
              <View>
                <Typography variant="legal" className="text-left text-brand-body">
                  Pending Settlement
                </Typography>
                <Typography variant="headingLeft" className="mt-xs text-[34px] text-brand-primary">
                  {formatSettlementAmount(settlementSummary.pendingSettlement)}
                </Typography>
              </View>
              <View className="items-end">
                <Typography variant="legal" className="text-left text-brand-body">
                  Next Release
                </Typography>
                <Typography variant="roleTitle" className="mt-xs text-brand-heading">
                  {settlementSummary.nextReleaseLabel}
                </Typography>
                <Typography variant="link" className="mt-sm">
                  View Details →
                </Typography>
              </View>
            </View>
          </Pressable>

          <View className="mt-lg rounded-[24px] bg-brand-navy px-lg py-lg">
            <Typography variant="caption" className="text-left text-brand-white/80">
              Today&apos;s Revenue
            </Typography>
            <View className="mt-sm flex-row items-end">
              <Typography variant="headingLeft" className="text-[38px] text-brand-white">
                {revenueToday}
              </Typography>
              <Typography variant="roleDescription" className="mb-1 ml-sm text-brand-white/80">
                {revenueDelta} vs yesterday
              </Typography>
            </View>
          </View>

          <Pressable
            onPress={() => router.push(ROUTES.SELLER.ANALYTICS as Href)}
            className="mt-lg rounded-[24px] border border-brand-border bg-brand-white px-lg py-lg"
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Typography variant="caption" className="text-left text-brand-body">
                  Analytics Dashboard
                </Typography>
                <Typography variant="headingLeft" className="mt-xs text-[28px] text-[#0B4A8B]">
                  View Insights
                </Typography>
                <Typography variant="legal" className="mt-xs text-left text-brand-body">
                  Revenue, orders, inventory and shipment performance
                </Typography>
              </View>
              <Typography variant="link">Open →</Typography>
            </View>
          </Pressable>

          <View className="mt-xl">
            <SectionHeader
              title="Active Shipments"
              actionLabel="View All"
              onActionPress={() => router.push(ROUTES.SELLER.SHIPMENTS as Href)}
            />
            <View className="mt-md gap-md">
              {dashboardShipments.map((shipment) => (
                <ShipmentCard
                  key={shipment.id}
                  shipment={shipment}
                  onPress={() =>
                    router.push({
                      pathname: ROUTES.SELLER.SHIPMENT_DETAILS,
                      params: { shipmentId: shipment.id },
                    } as unknown as Href)
                  }
                />
              ))}
            </View>
          </View>
            </>
          )}
        </ScrollView>

        <Pressable
          onPress={goToAddProduct}
          className="absolute bottom-24 right-6 h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy shadow-sm"
        >
          <Typography variant="headingLeft" className="text-[28px] text-brand-white">
            +
          </Typography>
        </Pressable>

        <SellerBottomNavigation
          active="dashboard"
          onNavigate={(target) => navigateSellerBottomTab(router, target)}
        />
      </View>
    </ScreenWrapper>
  );
});
