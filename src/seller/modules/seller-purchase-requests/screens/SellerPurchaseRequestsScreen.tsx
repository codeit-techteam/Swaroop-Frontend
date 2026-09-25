import { memo, useEffect, useMemo, useState } from 'react';

import { Pressable, RefreshControl, ScrollView, TextInput, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, ScreenWrapper, SecondaryButton, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import {
  ConfirmationBottomSheet,
  RejectReasonSheet,
} from '@/seller/modules/seller-orders/components';
import type { SellerRejectReason } from '@/seller/modules/seller-orders/types/sellerOrders';
import { PurchaseRequestCard } from '@/seller/modules/seller-purchase-requests/components/PurchaseRequestCard';
import {
  type PurchaseRequestTabFilter,
  useSellerPurchaseRequestsStore,
} from '@/seller/modules/seller-purchase-requests/store/sellerPurchaseRequestsStore';
import type { SellerPurchaseRequest } from '@/services/seller-purchase-requests';
import {
  EmptyState,
  ListFooterLoader,
  OrderCardSkeleton,
  SearchBar,
  SellerBottomNavigation,
  SellerModuleTopBar,
  SellerSheetShell,
} from '@/seller/components';
import { usePaginatedList } from '@/seller/hooks/usePaginatedList';
import { usePullToRefresh } from '@/seller/hooks/usePullToRefresh';
import { useSkeletonLoading } from '@/seller/hooks/useSkeletonLoading';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

const TABS: Array<{ label: string; value: PurchaseRequestTabFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Counter', value: 'counter_sent' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
];

export const SellerPurchaseRequestsScreen = memo(function SellerPurchaseRequestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const search = useSellerPurchaseRequestsStore((state) => state.search);
  const hydrate = useSellerPurchaseRequestsStore((state) => state.hydrate);
  const refresh = useSellerPurchaseRequestsStore((state) => state.refresh);
  const accept = useSellerPurchaseRequestsStore((state) => state.accept);
  const reject = useSellerPurchaseRequestsStore((state) => state.reject);
  const counter = useSellerPurchaseRequestsStore((state) => state.counter);
  const select = useSellerPurchaseRequestsStore((state) => state.select);
  const isHydrated = useSellerPurchaseRequestsStore((state) => state.isHydrated);
  const isSubmitting = useSellerPurchaseRequestsStore((state) => state.isSubmitting);
  const error = useSellerPurchaseRequestsStore((state) => state.error);

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<PurchaseRequestTabFilter>('all');
  const [acceptTarget, setAcceptTarget] = useState<SellerPurchaseRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<SellerPurchaseRequest | null>(null);
  const [counterTarget, setCounterTarget] = useState<SellerPurchaseRequest | null>(null);
  const [rejectReason, setRejectReason] = useState<SellerRejectReason>('Insufficient Inventory');
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQty, setCounterQty] = useState('');

  const isLoading = useSkeletonLoading(isHydrated);
  const { isRefreshing, refresh: pullRefresh } = usePullToRefresh(async () => {
    await refresh();
  });

  useEffect(() => {
    if (!isHydrated) {
      void hydrate();
    }
  }, [hydrate, isHydrated]);

  const filtered = useMemo(() => search(query, activeTab), [activeTab, query, search]);
  const { visibleItems, hasMore, isLoadingMore, loadMore } = usePaginatedList({ items: filtered });

  const openDetail = (request: SellerPurchaseRequest) => {
    select(request.id);
    router.push(`${ROUTES.SELLER.PURCHASE_REQUEST_DETAIL}?id=${request.id}` as Href);
  };

  const handleAcceptConfirm = async () => {
    if (!acceptTarget) return;
    const ok = await accept(acceptTarget.id);
    setAcceptTarget(null);
    if (ok) openDetail(acceptTarget);
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    const ok = await reject(rejectTarget.id, rejectReason, rejectRemarks.trim() || undefined);
    setRejectTarget(null);
    setRejectRemarks('');
    if (ok) openDetail(rejectTarget);
  };

  const handleCounterConfirm = async () => {
    if (!counterTarget) return;
    const unitPrice = Number(counterPrice);
    const quantity = Number(counterQty);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0 || !Number.isFinite(quantity) || quantity <= 0) {
      return;
    }
    const ok = await counter(counterTarget.id, unitPrice, quantity);
    setCounterTarget(null);
    setCounterPrice('');
    setCounterQty('');
    if (ok) openDetail(counterTarget);
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <View className="flex-1">
        <SellerModuleTopBar title="Purchase Requests" showSearch={false} />

        <ScrollView
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => void pullRefresh()} />
          }
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-md"
            contentContainerStyle={{ gap: 20 }}
          >
            {TABS.map((tab) => {
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
              placeholder="Search by request, grade, buyer label"
            />
          </View>

          {error ? (
            <Typography variant="legal" className="mt-md text-[#B91C1C]">
              {error}
            </Typography>
          ) : null}

          {isLoading ? (
            <View className="mt-lg">
              <OrderCardSkeleton />
            </View>
          ) : (
            <View className="mt-lg gap-md">
              {visibleItems.length === 0 ? (
                <EmptyState
                  variant="no_orders"
                  onCtaPress={() => router.push(ROUTES.SELLER.OFFERS as Href)}
                />
              ) : (
                visibleItems.map((request) => (
                  <PurchaseRequestCard
                    key={request.id}
                    request={request}
                    actionsDisabled={isSubmitting}
                    onAccept={setAcceptTarget}
                    onReject={setRejectTarget}
                    onViewDetails={openDetail}
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
          )}
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0">
          <SellerBottomNavigation
            active="orders"
            onNavigate={(target) => navigateSellerBottomTab(router, target)}
          />
        </View>
      </View>

      <ConfirmationBottomSheet
        visible={Boolean(acceptTarget)}
        title="Accept this request?"
        message="Confirm you can fulfill this purchase request."
        onCancel={() => setAcceptTarget(null)}
        onConfirm={() => void handleAcceptConfirm()}
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
        onReject={() => void handleRejectConfirm()}
      />

      <SellerSheetShell
        visible={Boolean(counterTarget)}
        onClose={() => {
          setCounterTarget(null);
          setCounterPrice('');
          setCounterQty('');
        }}
      >
        <Typography variant="headingLeft" className="text-[22px]">
          Counter Offer
        </Typography>
        <Typography variant="subheading" className="mt-sm text-brand-body">
          Propose a unit price and quantity for {counterTarget?.buyerLabel ?? 'buyer'}.
        </Typography>
        <View className="mt-lg gap-md">
          <View>
            <Typography variant="fieldLabel">UNIT PRICE (₹)</Typography>
            <TextInput
              value={counterPrice}
              onChangeText={setCounterPrice}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={brandColors.footer}
              className="mt-xs rounded-2xl border border-brand-border bg-brand-white px-md py-md font-sans text-[16px] text-brand-heading"
            />
          </View>
          <View>
            <Typography variant="fieldLabel">QUANTITY (MT)</Typography>
            <TextInput
              value={counterQty}
              onChangeText={setCounterQty}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={brandColors.footer}
              className="mt-xs rounded-2xl border border-brand-border bg-brand-white px-md py-md font-sans text-[16px] text-brand-heading"
            />
          </View>
        </View>
        <View className="mt-xl flex-row gap-sm">
          <View className="flex-1">
            <SecondaryButton
              label="Cancel"
              variant="outline"
              onPress={() => {
                setCounterTarget(null);
                setCounterPrice('');
                setCounterQty('');
              }}
            />
          </View>
          <View className="flex-1">
            <PrimaryButton
              label={isSubmitting ? 'Sending…' : 'Send Counter'}
              onPress={() => void handleCounterConfirm()}
            />
          </View>
        </View>
      </SellerSheetShell>
    </ScreenWrapper>
  );
});
