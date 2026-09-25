import { memo, useEffect, useMemo, useState } from 'react';

import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { LightningIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  EmptyState,
  FilterBottomSheet,
  ListFooterLoader,
  OfferSkeleton,
  SellerBottomNavigation,
  SellerModuleTopBar,
} from '@/seller/components';
import { usePaginatedList } from '@/seller/hooks/usePaginatedList';
import { usePullToRefresh } from '@/seller/hooks/usePullToRefresh';
import { useSkeletonLoading } from '@/seller/hooks/useSkeletonLoading';
import {
  DeleteOfferBottomSheet,
  OfferCard,
  OfferFilters,
  OfferSearchBar,
} from '@/seller/modules/seller-offers/components';
import { useSellerOffersStore } from '@/seller/modules/seller-offers/store/sellerOffersStore';
import type { OfferTabFilter, SellerOffer } from '@/seller/modules/seller-offers/types/offers';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import {
  getFilterPreferences,
  type FilterPreferences,
} from '@/seller/services/documentsService';
import { brandColors } from '@/theme/colors';
import { elevation } from '@/theme/shadows';

const AnimatedSection = Animated.View;

const EMPTY_COPY: Record<OfferTabFilter, { title: string; description: string }> = {
  all: {
    title: 'No offers yet',
    description: 'Create a bulk pricing agreement to start receiving quotes from verified buyers.',
  },
  active: {
    title: 'No live offers',
    description: 'Activate a draft or resume a paused offer to appear on the marketplace.',
  },
  paused: {
    title: 'Nothing paused',
    description: 'Paused offers stay hidden from buyers until you resume trading.',
  },
  expired: {
    title: 'No expired offers',
    description: 'Expired agreements will land here so you can renew pricing quickly.',
  },
  draft: {
    title: 'No drafts',
    description: 'Save an offer as a draft to finish pricing and inventory later.',
  },
};

const applySheetFilters = (offers: SellerOffer[], prefs: FilterPreferences): SellerOffer[] => {
  const warehouses = prefs.warehouse ?? [];
  if (warehouses.length === 0) {
    return offers;
  }

  return offers.filter((offer) =>
    warehouses.some((value) => {
      const needle = value.toLowerCase();
      return (
        offer.warehouse.toLowerCase().includes(needle) ||
        offer.warehouseLocation.toLowerCase().includes(needle)
      );
    }),
  );
};

export const OffersScreen = memo(function OffersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const searchOffers = useSellerOffersStore((state) => state.searchOffers);
  const pauseOffer = useSellerOffersStore((state) => state.pauseOffer);
  const resumeOffer = useSellerOffersStore((state) => state.resumeOffer);
  const duplicateOffer = useSellerOffersStore((state) => state.duplicateOffer);
  const deleteOffer = useSellerOffersStore((state) => state.deleteOffer);
  const loadEditorFromOffer = useSellerOffersStore((state) => state.loadEditorFromOffer);
  const resetEditor = useSellerOffersStore((state) => state.resetEditor);
  const selectOffer = useSellerOffersStore((state) => state.selectOffer);
  const refreshSellerOffersState = useSellerOffersStore((state) => state.refreshSellerOffersState);
  const hydrateSellerOffersState = useSellerOffersStore((state) => state.hydrateSellerOffersState);
  const offersHydrated = useSellerOffersStore((state) => state.isHydrated);
  const stats = useSellerOffersStore((state) => state.stats);
  const offers = useSellerOffersStore((state) => state.offers);
  const loadError = useSellerOffersStore((state) => state.loadError);

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<OfferTabFilter>('active');
  const [deleteTarget, setDeleteTarget] = useState<SellerOffer | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterPreferences>(() =>
    getFilterPreferences('offers'),
  );
  const isLoading = useSkeletonLoading(offersHydrated);
  const { isRefreshing, refresh } = usePullToRefresh(async () => {
    await refreshSellerOffersState(query);
  });

  useEffect(() => {
    if (!offersHydrated) {
      void hydrateSellerOffersState();
      return;
    }
    void refreshSellerOffersState(query);
    // Initial / remount refresh only — typing uses client filter + pull-to-refresh for server search.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid refetch on every keystroke
  }, [hydrateSellerOffersState, offersHydrated, refreshSellerOffersState]);

  const filterCount = appliedFilters.warehouse?.length ?? 0;

  const liveMetrics = useMemo(() => {
    const active = offers.filter((offer) => offer.status === 'active');
    const quotes = active.reduce((sum, offer) => sum + offer.analytics.quotes, 0);
    const orders = active.reduce((sum, offer) => sum + offer.analytics.orders, 0);
    const avgCvr =
      active.length === 0
        ? 0
        : Number(
            (
              active.reduce((sum, offer) => sum + offer.analytics.conversionRate, 0) / active.length
            ).toFixed(1),
          );

    return { quotes, orders, avgCvr };
  }, [offers]);

  const tabCounts = useMemo(
    () => ({
      all: Math.max(stats.total - stats.draft - stats.pendingReview, 0),
      active: stats.active,
      paused: stats.paused,
      expired: stats.expired,
      draft: stats.draft,
    }),
    [stats],
  );

  const filteredOffers = useMemo(
    () => applySheetFilters(searchOffers(query, activeTab), appliedFilters),
    [activeTab, appliedFilters, query, searchOffers],
  );

  const { visibleItems, hasMore, isLoadingMore, loadMore, reset } = usePaginatedList({
    items: filteredOffers,
  });

  useEffect(() => {
    reset();
  }, [activeTab, appliedFilters, query, reset]);

  const openCreate = () => {
    resetEditor();
    router.push(ROUTES.SELLER.CREATE_OFFER as Href);
  };

  const openEdit = (offer: SellerOffer) => {
    loadEditorFromOffer(offer.id);
    router.push(`${ROUTES.SELLER.EDIT_OFFER}?offerId=${offer.id}` as Href);
  };

  const openDuplicate = async (offer: SellerOffer) => {
    const duplicated = await duplicateOffer(offer.id);
    if (duplicated) {
      loadEditorFromOffer(duplicated.id);
      router.push(ROUTES.SELLER.CREATE_OFFER as Href);
    }
  };

  const handlePause = async (offer: SellerOffer) => {
    const paused = await pauseOffer(offer.id);
    if (paused) {
      router.push(`${ROUTES.SELLER.OFFER_PAUSED}?offerId=${offer.id}` as Href);
    }
  };

  const handleResume = async (offer: SellerOffer) => {
    await resumeOffer(offer.id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return;
    }
    const ok = await deleteOffer(deleteTarget.id);
    if (ok) {
      setDeleteTarget(null);
    }
  };

  const openDetails = (offer: SellerOffer) => {
    selectOffer(offer.id);
    router.push(`${ROUTES.SELLER.OFFER_DETAILS}?offerId=${offer.id}` as Href);
  };

  const emptyCopy = EMPTY_COPY[activeTab];
  const hasSearchOrFilters = query.trim().length > 0 || filterCount > 0;

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <View className="flex-1">
        <SellerModuleTopBar
          title="PetroTrade"
          showSearch={false}
          onBellPress={() => router.push(ROUTES.SELLER.NOTIFICATIONS as Href)}
        />

        <ScrollView
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 128 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />}
        >
          <View className="flex-row items-end justify-between">
            <View className="flex-1 pr-md">
              <Typography variant="headingLeft" className="text-[26px] leading-[32px]">
                My Offers
              </Typography>
              <Typography variant="legal" className="mt-xs text-left text-brand-body">
                Live bulk pricing for verified buyers.
              </Typography>
            </View>
            <Pressable
              onPress={openCreate}
              accessibilityRole="button"
              accessibilityLabel="Create new offer"
              className="rounded-full bg-brand-navy px-md py-[10px]"
              style={({ pressed }) => [elevation.sm, { opacity: pressed ? 0.92 : 1 }]}
            >
              <Typography variant="badge" className="text-[12px] text-brand-white">
                New offer
              </Typography>
            </Pressable>
          </View>

          {loadError ? (
            <View className="mt-md rounded-xl border border-brand-error/30 bg-brand-error-light px-md py-sm">
              <Typography variant="legal" className="text-left text-brand-error">
                {loadError}
              </Typography>
            </View>
          ) : null}

          {isLoading ? (
            <View className="mt-lg">
              <OfferSkeleton />
            </View>
          ) : (
            <>
              <AnimatedSection entering={FadeInDown.duration(280)} className="mt-lg">
                <Pressable
                  onPress={() => setActiveTab('active')}
                  accessibilityRole="button"
                  accessibilityLabel={`${stats.active} live offers on the marketplace`}
                  className="overflow-hidden rounded-[22px] bg-brand-navy px-md py-md"
                  style={({ pressed }) => [elevation.md, { opacity: pressed ? 0.96 : 1 }]}
                >
                  <View className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10" />
                  <View className="flex-row items-center">
                    <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                      <LightningIcon size={18} color={brandColors.white} />
                    </View>
                    <View className="ml-sm flex-1 pr-sm">
                      <Typography variant="headingLeft" className="text-[22px] leading-[26px] text-brand-white">
                        {stats.active} live
                      </Typography>
                      <Typography variant="legal" className="mt-[2px] text-left text-[11px] text-brand-white/70">
                        {liveMetrics.quotes.toLocaleString('en-IN')} quotes ·{' '}
                        {liveMetrics.orders.toLocaleString('en-IN')} orders · {liveMetrics.avgCvr}% CVR
                      </Typography>
                    </View>
                    <View className="rounded-full bg-white/10 px-sm py-xs">
                      <Typography variant="badge" className="text-[10px] text-brand-white">
                        View
                      </Typography>
                    </View>
                  </View>
                </Pressable>
              </AnimatedSection>

              <AnimatedSection entering={FadeInDown.duration(280).delay(50)} className="mt-lg">
                <OfferSearchBar
                  value={query}
                  onChangeText={setQuery}
                  onFilterPress={() => setShowFilters(true)}
                  filterCount={filterCount}
                />
              </AnimatedSection>

              <AnimatedSection entering={FadeInDown.duration(280).delay(80)} className="mt-md">
                <OfferFilters activeTab={activeTab} onTabChange={setActiveTab} counts={tabCounts} />
              </AnimatedSection>

              <View className="mt-lg">
                {visibleItems.length === 0 ? (
                  <EmptyState
                    variant={hasSearchOrFilters ? 'no_search_results' : 'no_offers'}
                    title={hasSearchOrFilters ? 'No matching offers' : emptyCopy.title}
                    description={
                      hasSearchOrFilters
                        ? 'Try another search, switch tabs, or reset filters.'
                        : emptyCopy.description
                    }
                    ctaLabel={hasSearchOrFilters ? undefined : 'Create new offer'}
                    onCtaPress={hasSearchOrFilters ? undefined : openCreate}
                  />
                ) : (
                  visibleItems.map((offer, index) => (
                    <AnimatedSection
                      key={offer.id}
                      entering={FadeInDown.duration(280).delay(Math.min(index, 4) * 40)}
                    >
                      <OfferCard
                        offer={offer}
                        onPress={() => openDetails(offer)}
                        onEdit={() => openEdit(offer)}
                        onPause={() => handlePause(offer)}
                        onResume={() => handleResume(offer)}
                        onDuplicate={() => openDuplicate(offer)}
                        onDelete={() => setDeleteTarget(offer)}
                      />
                    </AnimatedSection>
                  ))
                )}
                {hasMore || isLoadingMore ? <ListFooterLoader /> : null}
                {hasMore && !isLoadingMore ? (
                  <Pressable onPress={() => void loadMore()} className="items-center py-sm">
                    <Typography variant="link">Load more</Typography>
                  </Pressable>
                ) : null}
              </View>
            </>
          )}
        </ScrollView>

        <Pressable
          onPress={openCreate}
          accessibilityRole="button"
          accessibilityLabel="Create offer"
          className="absolute bottom-[96px] right-lg h-14 w-14 items-center justify-center rounded-full bg-brand-navy"
          style={({ pressed }) => [elevation.lg, { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}
        >
          <Typography variant="headingLeft" className="text-[28px] leading-[28px] text-brand-white">
            +
          </Typography>
        </Pressable>

        <SellerBottomNavigation
          active="products"
          onNavigate={(target) => navigateSellerBottomTab(router, target)}
        />
      </View>

      <FilterBottomSheet
        visible={showFilters}
        module="offers"
        onClose={() => setShowFilters(false)}
        onApply={(prefs) => {
          setAppliedFilters(prefs);
          const statuses = prefs.status ?? [];
          if (statuses.length === 1) {
            const next = statuses[0];
            if (
              next === 'active' ||
              next === 'paused' ||
              next === 'expired' ||
              next === 'draft'
            ) {
              setActiveTab(next);
            }
          }
        }}
      />

      <DeleteOfferBottomSheet
        visible={Boolean(deleteTarget)}
        offerLabel={deleteTarget?.product ?? 'this offer'}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </ScreenWrapper>
  );
});
