import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { FlatList, Pressable, RefreshControl, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import {
  FilterChipRow,
  SearchField,
  SellerBottomNavigation,
  SellerModuleTopBar,
} from '@/seller/components';
import {
  AmountCard,
  SettlementCard,
  SettlementListSkeleton,
  SettlementNotificationPanel,
} from '@/seller/modules/settlement-payout/components';
import {
  formatSettlementAmount,
} from '@/seller/modules/settlement-payout/services/settlementService';
import { useSettlementStore } from '@/seller/modules/settlement-payout/store/settlementStore';
import type { Settlement, SettlementTabFilter } from '@/seller/modules/settlement-payout/types/settlement';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';

const STATUS_TABS: SettlementTabFilter[] = ['all', 'pending', 'processing', 'released', 'failed'];

const tabLabels: Record<SettlementTabFilter, string> = {
  all: 'All',
  pending: 'Pending',
  processing: 'Processing',
  released: 'Released',
  failed: 'Failed',
};

export const SettlementDashboardScreen = memo(function SettlementDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const summary = useSettlementStore((state) => state.summary);
  const searchSettlements = useSettlementStore((state) => state.searchSettlements);
  const selectSettlement = useSettlementStore((state) => state.selectSettlement);
  const downloadDocument = useSettlementStore((state) => state.downloadDocument);
  const refreshSettlementState = useSettlementStore((state) => state.refreshSettlementState);
  const isHydrated = useSettlementStore((state) => state.isHydrated);
  const isRefreshing = useSettlementStore((state) => state.isRefreshing);
  const notifications = useSettlementStore((state) => state.notifications);
  const markNotificationRead = useSettlementStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useSettlementStore((state) => state.markAllNotificationsRead);

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SettlementTabFilter>('all');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!isHydrated) {
      useSettlementStore.getState().hydrateSettlementState();
    }
  }, [isHydrated]);

  const filteredSettlements = useMemo(
    () => searchSettlements(query, activeTab),
    [activeTab, query, searchSettlements],
  );

  const handleDownload = useCallback(
    (settlement: Settlement, type: 'invoice' | 'advice' = 'invoice') => {
      const document = settlement.documents.find((item) =>
        type === 'invoice' ? item.type === 'invoice' : item.type === 'settlement_advice',
      );
      if (!document) {
        Toast.show({ type: 'info', text1: 'Document not available yet' });
        return;
      }
      const name = downloadDocument(document.id);
      Toast.show({ type: 'success', text1: 'Download started', text2: name ?? document.name });
    },
    [downloadDocument],
  );

  const openDetails = useCallback(
    (settlement: Settlement) => {
      selectSettlement(settlement.settlementId);
      router.push(
        `${ROUTES.SELLER.SETTLEMENT_DETAILS}?settlementId=${settlement.settlementId}` as Href,
      );
    },
    [router, selectSettlement],
  );

  const handleBottomNav = useCallback(
    (target: Parameters<typeof navigateSellerBottomTab>[1]) => {
      navigateSellerBottomTab(router, target);
    },
    [router],
  );

  const listHeader = (
    <View>
      <Typography variant="headingLeft" className="mt-md text-[30px]">
        Settlement & Payout
      </Typography>
      <Typography variant="subheading" className="mt-xs text-brand-body">
        Escrow-protected settlements from PetroTrade
      </Typography>

      <View className="mt-lg flex-row flex-wrap gap-md">
        <AmountCard title="Pending Settlement" value={formatSettlementAmount(summary.pendingSettlement)} accent="warning" />
        <AmountCard title="Released Today" value={formatSettlementAmount(summary.releasedToday)} accent="success" />
        <AmountCard title="This Month" value={formatSettlementAmount(summary.thisMonth)} />
        <AmountCard title="Total Earnings" value={formatSettlementAmount(summary.totalEarnings, true)} accent="navy" />
      </View>

      <View className="mt-lg">
        <FilterChipRow
          options={STATUS_TABS.map((tab) => tabLabels[tab])}
          selected={tabLabels[activeTab]}
          onSelect={(label) => {
            const next = STATUS_TABS.find((tab) => tabLabels[tab] === label) ?? 'all';
            setActiveTab(next);
          }}
        />
      </View>

      <View className="mt-md">
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Search Order ID, Invoice, PO, Settlement ID"
        />
      </View>

      <View className="mt-lg flex-row items-center justify-between">
        <Typography variant="roleTitle">{filteredSettlements.length} settlements</Typography>
        <Pressable onPress={() => router.push(ROUTES.SELLER.SETTLEMENT_HISTORY as Href)}>
          <Typography variant="link">View History</Typography>
        </Pressable>
      </View>

      {showNotifications ? (
        <View className="mt-md">
          <SettlementNotificationPanel
            notifications={notifications}
            onMarkAllRead={markAllNotificationsRead}
            onMarkRead={markNotificationRead}
          />
        </View>
      ) : null}
    </View>
  );

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <View className="flex-1">
        <SellerModuleTopBar
          title="PetroTrade Seller"
          showSearch={false}
          onBellPress={() => setShowNotifications((value) => !value)}
        />

        {!isHydrated ? (
          <View className="flex-1 px-lg pt-md">
            <SettlementListSkeleton />
          </View>
        ) : (
          <FlatList
            data={filteredSettlements}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: insets.bottom + 120,
            }}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={() => void refreshSettlementState()} />
            }
            ListHeaderComponent={listHeader}
            ItemSeparatorComponent={() => <View className="h-md" />}
            renderItem={({ item }) => (
              <SettlementCard
                settlement={item}
                onViewDetails={openDetails}
                onDownloadInvoice={(settlement) => handleDownload(settlement, 'invoice')}
              />
            )}
            ListFooterComponent={
              <View className="mt-lg gap-sm">
                <Pressable
                  onPress={() => router.push(ROUTES.SELLER.SETTLEMENT_DOCUMENTS as Href)}
                  className="rounded-2xl border border-brand-border bg-brand-white px-lg py-md"
                >
                  <Typography variant="roleTitle" className="text-center text-brand-primary">
                    Tax & Documents
                  </Typography>
                </Pressable>
              </View>
            }
          />
        )}

        <SellerBottomNavigation active="payouts" onNavigate={handleBottomNav} />
      </View>
    </ScreenWrapper>
  );
});
