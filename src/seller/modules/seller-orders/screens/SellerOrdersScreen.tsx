import { memo, useEffect, useMemo, useState } from 'react';

import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import {
  ConfirmationBottomSheet,
  RejectReasonSheet,
  SellerOrderCard,
} from '@/seller/modules/seller-orders/components';
import { useSellerOrdersStore } from '@/seller/modules/seller-orders/store/sellerOrdersStore';
import type {
  SellerOrder,
  SellerOrderTabFilter,
  SellerRejectReason,
} from '@/seller/modules/seller-orders/types/sellerOrders';
import {
  EmptyState,
  FilterBottomSheet,
  ListFooterLoader,
  OrderCardSkeleton,
  SearchBar,
  SellerBottomNavigation,
  SellerModuleTopBar,
} from '@/seller/components';
import { usePaginatedList } from '@/seller/hooks/usePaginatedList';
import { usePullToRefresh } from '@/seller/hooks/usePullToRefresh';
import { useSkeletonLoading } from '@/seller/hooks/useSkeletonLoading';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import { cn } from '@/utils/cn';

const ORDER_TABS: Array<{ label: string; value: SellerOrderTabFilter }> = [
  { label: 'All Orders', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Dispatch Pending', value: 'dispatch_pending' },
  { label: 'Delivered', value: 'delivered' },
];

export const SellerOrdersScreen = memo(function SellerOrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const summary = useSellerOrdersStore((state) => state.summary);
  const searchOrders = useSellerOrdersStore((state) => state.searchOrders);
  const selectOrder = useSellerOrdersStore((state) => state.selectOrder);
  const acceptOrder = useSellerOrdersStore((state) => state.acceptOrder);
  const rejectOrder = useSellerOrdersStore((state) => state.rejectOrder);
  const syncFromDispatch = useSellerOrdersStore((state) => state.syncFromDispatch);
  const refreshSellerOrdersState = useSellerOrdersStore((state) => state.refreshSellerOrdersState);
  const hydrateSellerOrdersState = useSellerOrdersStore((state) => state.hydrateSellerOrdersState);
  const ordersHydrated = useSellerOrdersStore((state) => state.isHydrated);

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SellerOrderTabFilter>('all');
  const [acceptTarget, setAcceptTarget] = useState<SellerOrder | null>(null);
  const [rejectTarget, setRejectTarget] = useState<SellerOrder | null>(null);
  const [rejectReason, setRejectReason] = useState<SellerRejectReason>('Insufficient Inventory');
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const isLoading = useSkeletonLoading(ordersHydrated);
  const { isRefreshing, refresh } = usePullToRefresh(async () => {
    refreshSellerOrdersState();
    syncFromDispatch();
  });

  useEffect(() => {
    if (!ordersHydrated) {
      hydrateSellerOrdersState();
    }
    syncFromDispatch();
  }, [hydrateSellerOrdersState, ordersHydrated, syncFromDispatch]);

  const filteredOrders = useMemo(
    () => searchOrders(query, activeTab),
    [activeTab, query, searchOrders],
  );

  const { visibleItems, hasMore, isLoadingMore, loadMore } = usePaginatedList({
    items: filteredOrders,
  });

  const openEligibility = (order: SellerOrder) => {
    selectOrder(order.id);
    router.push(`${ROUTES.SELLER.ORDER_ELIGIBILITY}?orderId=${order.id}` as Href);
  };

  const handleAcceptConfirm = () => {
    if (!acceptTarget) {
      return;
    }
    const accepted = acceptOrder(acceptTarget.id);
    setAcceptTarget(null);
    if (accepted) {
      router.push(`${ROUTES.SELLER.ORDER_ACCEPTED}?orderId=${accepted.id}` as Href);
    }
  };

  const handleRejectConfirm = () => {
    if (!rejectTarget) {
      return;
    }
    const rejected = rejectOrder(rejectTarget.id, rejectReason, rejectRemarks);
    setRejectTarget(null);
    setRejectRemarks('');
    if (rejected) {
      router.push(`${ROUTES.SELLER.ORDER_REJECTED}?orderId=${rejected.id}` as Href);
    }
  };

  const handleBottomNav = (target: Parameters<typeof navigateSellerBottomTab>[1]) => {
    navigateSellerBottomTab(router, target);
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <View className="flex-1">
        <SellerModuleTopBar title="PetroTrade" showSearch={false} />

        <ScrollView
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-md"
            contentContainerStyle={{ gap: 20 }}
          >
            {ORDER_TABS.map((tab) => {
              const selected = activeTab === tab.value;
              return (
                <Pressable key={tab.value} onPress={() => setActiveTab(tab.value)} className="pb-sm">
                  <Typography
                    variant="roleTitle"
                    className={cn(selected ? 'text-brand-primary' : 'text-brand-body')}
                  >
                    {tab.label}
                  </Typography>
                  {selected ? <View className="mt-sm h-0.5 rounded-full bg-brand-primary" /> : null}
                </Pressable>
              );
            })}
          </ScrollView>

          <View className="mt-md">
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search by Order ID, Buyer, Material, Destination"
              showFilter
              onFilterPress={() => setShowFilters(true)}
            />
          </View>

          {isLoading ? (
            <View className="mt-lg">
              <OrderCardSkeleton />
            </View>
          ) : (
            <>
          <View className="mt-md flex-row flex-wrap gap-sm">
            {[
              { label: 'Pending', value: summary.pending },
              { label: 'Accepted', value: summary.accepted },
              { label: 'Dispatch', value: summary.dispatchPending },
              { label: 'Delivered', value: summary.delivered },
            ].map((item) => (
              <View
                key={item.label}
                className="rounded-full border border-brand-border bg-brand-white px-md py-xs"
              >
                <Typography variant="legal" className="text-brand-body">
                  {item.label}: {item.value}
                </Typography>
              </View>
            ))}
          </View>

          <View className="mt-lg gap-md">
            {visibleItems.length === 0 ? (
              <EmptyState
                variant="no_orders"
                onCtaPress={() => router.push(ROUTES.SELLER.OFFERS as Href)}
              />
            ) : (
              visibleItems.map((order) => (
                <SellerOrderCard
                  key={order.id}
                  order={order}
                  onAccept={setAcceptTarget}
                  onReject={setRejectTarget}
                  onViewDetails={openEligibility}
                  onUploadLorryReceipt={(item) =>
                    router.push(
                      `${ROUTES.SELLER.DISPATCH_MANAGEMENT}?orderId=${item.dispatchLinkId}` as Href,
                    )
                  }
                />
              ))
            )}
            {hasMore || isLoadingMore ? <ListFooterLoader /> : null}
            {hasMore && !isLoadingMore ? (
              <Pressable onPress={() => void loadMore()} className="items-center py-sm">
                <Typography variant="link">Load More</Typography>
              </Pressable>
            ) : null}
          </View>
            </>
          )}
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0">
          <SellerBottomNavigation active="orders" onNavigate={handleBottomNav} />
        </View>
      </View>

      <FilterBottomSheet
        visible={showFilters}
        module="orders"
        onClose={() => setShowFilters(false)}
        onApply={() => undefined}
      />

      <ConfirmationBottomSheet
        visible={Boolean(acceptTarget)}
        title="Accept this order?"
        message="Inventory is available. Proceed?"
        onCancel={() => setAcceptTarget(null)}
        onConfirm={handleAcceptConfirm}
      />

      <RejectReasonSheet
        visible={Boolean(rejectTarget)}
        reason={rejectReason}
        remarks={rejectRemarks}
        onReasonChange={setRejectReason}
        onRemarksChange={setRejectRemarks}
        onCancel={() => {
          setRejectTarget(null);
          setRejectRemarks('');
        }}
        onReject={handleRejectConfirm}
      />
    </ScreenWrapper>
  );
});
