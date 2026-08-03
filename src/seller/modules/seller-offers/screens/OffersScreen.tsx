import { memo, useEffect, useMemo, useState } from 'react';

import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import {
  DeleteOfferBottomSheet,
  OfferCard,
  OfferFilters,
  OfferSearchBar,
} from '@/seller/modules/seller-offers/components';
import { useSellerOffersStore } from '@/seller/modules/seller-offers/store/sellerOffersStore';
import type { OfferTabFilter, SellerOffer } from '@/seller/modules/seller-offers/types/offers';
import { SellerBottomNavigation, SellerModuleTopBar, EmptyState, FilterBottomSheet, OfferSkeleton, ListFooterLoader } from '@/seller/components';
import { usePaginatedList } from '@/seller/hooks/usePaginatedList';
import { usePullToRefresh } from '@/seller/hooks/usePullToRefresh';
import { useSkeletonLoading } from '@/seller/hooks/useSkeletonLoading';

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
  const stats = useSellerOffersStore((state) => state.stats);

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<OfferTabFilter>('active');
  const [deleteTarget, setDeleteTarget] = useState<SellerOffer | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const isLoading = useSkeletonLoading();
  const { isRefreshing, refresh } = usePullToRefresh(async () => {
    refreshSellerOffersState();
  });

  useEffect(() => {
    refreshSellerOffersState();
  }, [refreshSellerOffersState]);

  const filteredOffers = useMemo(
    () => searchOffers(query, activeTab),
    [activeTab, query, searchOffers],
  );

  const { visibleItems, hasMore, isLoadingMore, loadMore } = usePaginatedList({
    items: filteredOffers,
  });

  const openCreate = () => {
    resetEditor();
    router.push(ROUTES.SELLER.CREATE_OFFER as Href);
  };

  const openEdit = (offer: SellerOffer) => {
    loadEditorFromOffer(offer.id);
    router.push(`${ROUTES.SELLER.EDIT_OFFER}?offerId=${offer.id}` as Href);
  };

  const openDuplicate = (offer: SellerOffer) => {
    const duplicated = duplicateOffer(offer.id);
    if (duplicated) {
      loadEditorFromOffer(duplicated.id);
      router.push(ROUTES.SELLER.CREATE_OFFER as Href);
    }
  };

  const handlePause = (offer: SellerOffer) => {
    pauseOffer(offer.id);
    router.push(`${ROUTES.SELLER.OFFER_PAUSED}?offerId=${offer.id}` as Href);
  };

  const handleResume = (offer: SellerOffer) => {
    resumeOffer(offer.id);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) {
      return;
    }
    deleteOffer(deleteTarget.id);
    setDeleteTarget(null);
  };

  const openDetails = (offer: SellerOffer) => {
    selectOffer(offer.id);
    router.push(`${ROUTES.SELLER.OFFER_DETAILS}?offerId=${offer.id}` as Href);
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <View className="flex-1">
        <SellerModuleTopBar title="PetroTrade Seller" showSearch={false} />

        <ScrollView
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />}
        >
          <Typography variant="headingLeft" className="mt-md text-[30px]">
            My Offers
          </Typography>
          <Typography variant="subheading" className="mt-xs text-brand-body">
            Manage and track your active bulk pricing agreements.
          </Typography>

          <View className="mt-md">
            <OfferFilters activeTab={activeTab} onTabChange={setActiveTab} />
          </View>

          <View className="mt-md flex-row items-center gap-sm">
            <View className="flex-1">
              <OfferSearchBar value={query} onChangeText={setQuery} />
            </View>
            <Pressable
              onPress={() => setShowFilters(true)}
              className="h-11 w-11 items-center justify-center rounded-2xl border border-brand-border bg-brand-white"
            >
              <Typography variant="badge">Filter</Typography>
            </Pressable>
          </View>

          {isLoading ? (
            <View className="mt-lg">
              <OfferSkeleton />
            </View>
          ) : (
            <>
          <View className="mt-md flex-row flex-wrap gap-sm">
            {[
              { label: 'Active', value: stats.active },
              { label: 'Paused', value: stats.paused },
              { label: 'Expired', value: stats.expired },
              { label: 'Draft', value: stats.draft },
            ].map((item) => (
              <View
                key={item.label}
                className="min-w-[22%] flex-1 rounded-xl border border-brand-border bg-brand-white px-sm py-sm"
              >
                <Typography variant="legal" className="text-left text-brand-body">
                  {item.label}
                </Typography>
                <Typography variant="roleTitle" className="mt-xs">
                  {item.value}
                </Typography>
              </View>
            ))}
          </View>

          <View className="mt-lg">
            {visibleItems.length === 0 ? (
              <EmptyState variant="no_offers" onCtaPress={openCreate} />
            ) : (
              visibleItems.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onPress={() => openDetails(offer)}
                  onEdit={() => openEdit(offer)}
                  onPause={() => handlePause(offer)}
                  onResume={() => handleResume(offer)}
                  onDuplicate={() => openDuplicate(offer)}
                  onDelete={() => setDeleteTarget(offer)}
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

        <Pressable
          onPress={openCreate}
          className="absolute bottom-[96px] right-lg h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy shadow-lg"
          style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
        >
          <Typography variant="headingLeft" className="text-[28px] text-brand-white">
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
        onApply={() => undefined}
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
