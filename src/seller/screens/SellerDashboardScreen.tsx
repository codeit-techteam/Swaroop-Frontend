import { memo, useEffect, useMemo } from 'react';

import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import {
  AnalyticsPreviewCard,
  AttentionStatsGrid,
  DashboardQuickActions,
  DashboardSearchButton,
  DashboardShipmentCard,
  DashboardSkeleton,
  OverdueBanner,
  RevenueHeroCard,
  SellerBottomNavigation,
  SellerHomeHeader,
  SettlementSummaryCard,
} from '@/seller/components';
import { usePullToRefresh } from '@/seller/hooks/usePullToRefresh';
import { useSellerShipments } from '@/seller/hooks/useSellerShipments';
import { useSkeletonLoading } from '@/seller/hooks/useSkeletonLoading';
import { useSellerOffersStore } from '@/seller/modules/seller-offers/store/sellerOffersStore';
import { useSellerOrdersStore } from '@/seller/modules/seller-orders/store/sellerOrdersStore';
import { formatSettlementAmount } from '@/seller/modules/settlement-payout/services/settlementService';
import { useSettlementStore } from '@/seller/modules/settlement-payout/store/settlementStore';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import { getRevenueSeries, getSellerAnalytics } from '@/seller/services/analyticsService';
import {
  getActiveShipmentCount,
  getSellerNotificationsSnapshot,
} from '@/seller/services/sellerMockService';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';
import { useSellerStore } from '@/seller/store/sellerStore';
import type { SellerShipment } from '@/seller/types';

const AnimatedSection = Animated.View;

export const SellerDashboardScreen = memo(function SellerDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isLoading = useSkeletonLoading();
  const refreshSellerOrdersState = useSellerOrdersStore((state) => state.refreshSellerOrdersState);
  const refreshSellerOffersState = useSellerOffersStore((state) => state.refreshSellerOffersState);
  const hydrateSettlementState = useSettlementStore((state) => state.hydrateSettlementState);
  const settlementHydrated = useSettlementStore((state) => state.isHydrated);
  const hydrateSellerOrdersState = useSellerOrdersStore((state) => state.hydrateSellerOrdersState);
  const ordersHydrated = useSellerOrdersStore((state) => state.isHydrated);
  const hydrateSellerOffersState = useSellerOffersStore((state) => state.hydrateSellerOffersState);
  const offersHydrated = useSellerOffersStore((state) => state.isHydrated);
  const { isRefreshing, refresh } = usePullToRefresh(async () => {
    refreshSellerOffersState();
    refreshSellerOrdersState();
  });
  const sellerName = useSellerStore(
    (state) => state.company.companyName || state.profile.ownerName,
  );
  const initials = useSellerStore((state) => state.profile.companyInitials || 'PT');
  const stats = useSellerProductStore((state) => state.dashboardStats);
  const orderSummary = useSellerOrdersStore((state) => state.summary);
  const offerStats = useSellerOffersStore((state) => state.stats);
  const { dashboardPreviews } = useSellerShipments();
  const revenueToday = useSellerProductStore((state) => state.revenueToday);
  const revenueDelta = useSellerProductStore((state) => state.revenueDelta);
  const overdueCount = useSellerProductStore((state) => state.overdueCount);
  const pendingSettlement = useSellerProductStore((state) => state.pendingSettlement);
  const clearSelection = useSellerProductStore((state) => state.clearSelection);
  const settlementSummary = useSettlementStore((state) => state.summary);

  useEffect(() => {
    if (!settlementHydrated) {
      hydrateSettlementState();
    }
    if (!ordersHydrated) {
      hydrateSellerOrdersState();
    }
    if (!offersHydrated) {
      hydrateSellerOffersState();
    }
  }, [
    hydrateSellerOffersState,
    hydrateSellerOrdersState,
    hydrateSettlementState,
    offersHydrated,
    ordersHydrated,
    settlementHydrated,
  ]);

  const goToAddProduct = () => {
    clearSelection();
    router.push(ROUTES.SELLER.ADD_PRODUCT as Href);
  };

  const unreadCount = useMemo(() => {
    const snapshot = getSellerNotificationsSnapshot();
    return [...snapshot.criticalActions, ...snapshot.recentActivity].filter((item) => !item.isRead)
      .length;
  }, []);

  const analytics = useMemo(() => getSellerAnalytics(), []);
  const sparklineValues = useMemo(() => getRevenueSeries('7d'), []);

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

  const handleQuickAction = (id: 'add' | 'stock' | 'offers' | 'dispatch') => {
    if (id === 'add') {
      goToAddProduct();
      return;
    }
    if (id === 'stock') {
      router.push(ROUTES.SELLER.INVENTORY as Href);
      return;
    }
    if (id === 'offers') {
      router.push(ROUTES.SELLER.OFFERS as Href);
      return;
    }
    router.push(ROUTES.SELLER.DISPATCH as Href);
  };

  const handleStatPress = (statId: string) => {
    if (statId === 'active-offers') {
      router.push(ROUTES.SELLER.OFFERS as Href);
      return;
    }
    if (statId === 'dispatched') {
      router.push(ROUTES.SELLER.DISPATCH as Href);
      return;
    }
    router.push(ROUTES.SELLER.ORDERS as Href);
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <View className="flex-1">
        <ScrollView
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 108 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />
          }
        >
          <SellerHomeHeader
            sellerName={sellerName}
            initials={initials}
            unreadCount={unreadCount}
            onNotificationPress={() => router.push(ROUTES.SELLER.NOTIFICATIONS as Href)}
          />

          <DashboardSearchButton onPress={() => router.push(ROUTES.SELLER.SEARCH as Href)} />

          {isLoading ? (
            <View className="mt-lg">
              <DashboardSkeleton />
            </View>
          ) : (
            <>
              <AnimatedSection entering={FadeInDown.duration(380).delay(40)}>
                <RevenueHeroCard
                  revenueToday={revenueToday}
                  revenueDelta={revenueDelta}
                  monthlyRevenue={analytics.revenue.monthly}
                  sparklineValues={sparklineValues}
                  onPress={() => router.push(ROUTES.SELLER.ANALYTICS as Href)}
                />
              </AnimatedSection>

              <AnimatedSection entering={FadeInDown.duration(380).delay(90)}>
                <OverdueBanner
                  overdueCount={overdueCount}
                  pendingSettlement={pendingSettlement}
                  onPress={() => router.push(ROUTES.SELLER.SETTLEMENTS as Href)}
                />
              </AnimatedSection>

              <AnimatedSection entering={FadeInDown.duration(380).delay(120)}>
                <AttentionStatsGrid stats={dashboardStats} onPress={handleStatPress} />
              </AnimatedSection>

              <AnimatedSection entering={FadeInDown.duration(380).delay(160)}>
                <DashboardQuickActions onPress={handleQuickAction} />
              </AnimatedSection>

              <AnimatedSection entering={FadeInDown.duration(380).delay(200)}>
                <SettlementSummaryCard
                  pendingAmount={formatSettlementAmount(settlementSummary.pendingSettlement)}
                  nextReleaseLabel={settlementSummary.nextReleaseLabel}
                  releasedToday={formatSettlementAmount(settlementSummary.releasedToday, true)}
                  onPress={() => router.push(ROUTES.SELLER.SETTLEMENTS as Href)}
                />
              </AnimatedSection>

              <AnimatedSection entering={FadeInDown.duration(380).delay(240)}>
                <AnalyticsPreviewCard
                  completedOrders={analytics.orders.completed}
                  inventoryValue={analytics.inventory.value}
                  liveShipments={analytics.shipments.live}
                  onPress={() => router.push(ROUTES.SELLER.ANALYTICS as Href)}
                />
              </AnimatedSection>

              <AnimatedSection entering={FadeInDown.duration(380).delay(280)} className="mt-lg">
                <View className="mb-sm flex-row items-center justify-between">
                  <Typography variant="roleTitle" className="text-[15px]">
                    Active shipments
                  </Typography>
                  <Pressable
                    onPress={() => router.push(ROUTES.SELLER.SHIPMENTS as Href)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="View all shipments"
                  >
                    <Typography variant="link" className="text-[13px]">
                      View all
                    </Typography>
                  </Pressable>
                </View>
                <View className="mt-md gap-sm">
                  {dashboardShipments.length > 0 ? (
                    dashboardShipments.map((shipment) => (
                      <DashboardShipmentCard
                        key={shipment.id}
                        shipment={shipment}
                        onPress={() =>
                          router.push({
                            pathname: ROUTES.SELLER.SHIPMENT_DETAILS,
                            params: { shipmentId: shipment.id },
                          } as unknown as Href)
                        }
                      />
                    ))
                  ) : (
                    <View className="rounded-2xl border border-dashed border-brand-border bg-brand-white px-lg py-xl">
                      <Typography variant="roleTitle" className="text-center">
                        No live shipments
                      </Typography>
                      <Typography variant="legal" className="mt-xs text-center text-brand-body">
                        Dispatched loads will appear here with live ETAs.
                      </Typography>
                    </View>
                  )}
                </View>
              </AnimatedSection>
            </>
          )}
        </ScrollView>

        <SellerBottomNavigation
          active="dashboard"
          onNavigate={(target) => navigateSellerBottomTab(router, target)}
        />
      </View>
    </ScreenWrapper>
  );
});
