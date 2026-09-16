import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { FlatList, Pressable, RefreshControl, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { ScreenWrapper, Typography } from '@/components';
import {
  CheckCircleIcon,
  ClockIcon,
  CurrencyIcon,
  ShieldCheckIcon,
  WalletIcon,
} from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  EmptyState,
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
import { formatSettlementAmount } from '@/seller/modules/settlement-payout/services/settlementService';
import { useSettlementStore } from '@/seller/modules/settlement-payout/store/settlementStore';
import type { Settlement, SettlementTabFilter } from '@/seller/modules/settlement-payout/types/settlement';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import { brandColors } from '@/theme/colors';
import { elevation } from '@/theme/shadows';

const STATUS_TABS: SettlementTabFilter[] = ['all', 'pending', 'processing', 'released', 'failed'];

const tabLabels: Record<SettlementTabFilter, string> = {
  all: 'All',
  pending: 'Pending',
  processing: 'Processing',
  released: 'Released',
  failed: 'Failed',
};

const AnimatedSection = Animated.View;

export const SettlementDashboardScreen = memo(function SettlementDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const summary = useSettlementStore((state) => state.summary);
  const settlements = useSettlementStore((state) => state.settlements);
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

  const pendingCount = useMemo(
    () => settlements.filter((item) => item.status === 'pending' || item.status === 'processing').length,
    [settlements],
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
      <Typography variant="headingLeft" className="mt-md text-[26px] leading-[32px]">
        Payouts
      </Typography>
      <Typography variant="legal" className="mt-xs text-left text-brand-body">
        Escrow-protected settlements from PetroTrade
      </Typography>

      <AnimatedSection entering={FadeInDown.duration(320)} className="mt-lg">
        <Pressable
          onPress={() => setActiveTab('pending')}
          accessibilityRole="button"
          accessibilityLabel={`Pending settlement ${formatSettlementAmount(summary.pendingSettlement, true)}`}
          className="overflow-hidden rounded-3xl bg-brand-navy p-lg"
          style={({ pressed }) => [elevation.md, { opacity: pressed ? 0.96 : 1 }]}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-row items-center">
              <View className="h-9 w-9 items-center justify-center rounded-2xl bg-white/15">
                <WalletIcon size={16} color={brandColors.white} />
              </View>
              <View className="ml-sm">
                <Typography variant="badge" className="text-[10px] text-brand-primary-light">
                  In escrow
                </Typography>
                <Typography variant="legal" className="mt-xs text-left text-brand-primary-light">
                  {pendingCount} awaiting release
                </Typography>
              </View>
            </View>
            <View className="flex-row items-center rounded-full bg-white/12 px-sm py-xs">
              <ShieldCheckIcon size={12} color={brandColors.white} />
              <Typography variant="badge" className="ml-xs text-[9px] text-brand-white">
                Protected
              </Typography>
            </View>
          </View>

          <Typography variant="legal" className="mt-lg text-left text-[11px] text-brand-primary-light">
            Pending settlement
          </Typography>
          <Typography
            variant="headingLeft"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.65}
            className="mt-xs text-[34px] leading-[40px] text-brand-white"
          >
            {formatSettlementAmount(summary.pendingSettlement, true)}
          </Typography>

          <View className="mt-lg flex-row gap-sm">
            <View className="flex-1 rounded-2xl bg-white/10 px-md py-sm">
              <Typography variant="legal" className="text-left text-[10px] uppercase tracking-wide text-brand-primary-light">
                Next release
              </Typography>
              <Typography variant="roleTitle" numberOfLines={1} className="mt-xs text-[13px] text-brand-white">
                {summary.nextReleaseLabel || '—'}
              </Typography>
            </View>
            <View className="flex-1 rounded-2xl bg-white/10 px-md py-sm">
              <Typography variant="legal" className="text-left text-[10px] uppercase tracking-wide text-brand-primary-light">
                This month
              </Typography>
              <Typography variant="roleTitle" numberOfLines={1} className="mt-xs text-[13px] text-brand-white">
                {formatSettlementAmount(summary.thisMonth, true)}
              </Typography>
            </View>
          </View>
        </Pressable>
      </AnimatedSection>

      <AnimatedSection entering={FadeInDown.duration(320).delay(60)} className="mt-sm">
        <View className="flex-row gap-sm">
          <View className="flex-1">
            <AmountCard
              title="Released today"
              value={formatSettlementAmount(summary.releasedToday, true)}
              accent="success"
              icon={<CheckCircleIcon size={15} color={brandColors.success} />}
              onPress={() => setActiveTab('released')}
            />
          </View>
          <View className="flex-1">
            <AmountCard
              title="Total earnings"
              value={formatSettlementAmount(summary.totalEarnings, true)}
              accent="navy"
              icon={<CurrencyIcon size={15} color={brandColors.white} />}
            />
          </View>
        </View>
      </AnimatedSection>

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
          placeholder="Search order, invoice, or settlement ID"
        />
      </View>

      <View className="mt-lg flex-row items-center justify-between">
        <Typography variant="roleTitle" className="text-[15px]">
          {filteredSettlements.length} {filteredSettlements.length === 1 ? 'settlement' : 'settlements'}
        </Typography>
        <Pressable
          onPress={() => router.push(ROUTES.SELLER.SETTLEMENT_HISTORY as Href)}
          className="flex-row items-center rounded-full bg-brand-primary-light px-md py-sm"
        >
          <ClockIcon size={13} color={brandColors.primaryDark} />
          <Typography variant="badge" className="ml-xs text-[11px] text-brand-primary-dark">
            History
          </Typography>
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
          title="PetroTrade"
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
            ListEmptyComponent={
              <View className="mt-md">
                <EmptyState
                  variant={query.trim() ? 'no_search_results' : 'no_orders'}
                  title={query.trim() ? 'No matching settlements' : 'No settlements yet'}
                  description={
                    query.trim() || activeTab !== 'all'
                      ? 'Try another order ID or clear the status filter.'
                      : 'Released and pending payouts will appear here after orders complete.'
                  }
                  ctaLabel={query.trim() || activeTab !== 'all' ? 'Clear filters' : undefined}
                  onCtaPress={
                    query.trim() || activeTab !== 'all'
                      ? () => {
                          setQuery('');
                          setActiveTab('all');
                        }
                      : undefined
                  }
                />
              </View>
            }
            ListFooterComponent={
              filteredSettlements.length > 0 ? (
                <Pressable
                  onPress={() => router.push(ROUTES.SELLER.SETTLEMENT_DOCUMENTS as Href)}
                  className="mt-lg flex-row items-center justify-between rounded-2xl border border-brand-border bg-brand-white px-lg py-md"
                  style={elevation.sm}
                >
                  <View className="flex-1 pr-md">
                    <Typography variant="roleTitle" className="text-[15px]">
                      Tax & documents
                    </Typography>
                    <Typography variant="legal" className="mt-xs text-left text-brand-body">
                      Invoices, GST reports, and TDS certificates
                    </Typography>
                  </View>
                  <Typography variant="badge" className="text-[11px] text-brand-navy">
                    Open
                  </Typography>
                </Pressable>
              ) : null
            }
          />
        )}

        <SellerBottomNavigation active="payouts" onNavigate={handleBottomNav} />
      </View>
    </ScreenWrapper>
  );
});
