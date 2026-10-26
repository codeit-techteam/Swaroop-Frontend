import { memo, useEffect, useMemo, useState } from 'react';

import { Modal, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import {
  EmptyState,
  SellerBottomNavigation,
  SellerModuleTopBar,
  SellerPrimaryButton,
} from '@/seller/components';
import { SellerListingCard } from '@/seller/components/SellerCatalogComponents';
import { SellerGradePicker } from '@/seller/components/SellerGradePicker';
import { usePullToRefresh } from '@/seller/hooks/usePullToRefresh';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';
import type { SellerProduct, SellerProductStatus } from '@/seller/types';
import { findSellerListingForCatalog } from '@/seller/utils/catalog';
import { elevation } from '@/theme/shadows';
import type { GradeFacetCategory } from '@/types/grade-master';
import type { MarketProduct } from '@/types/market';

const listingTabs: { id: SellerProductStatus; label: string }[] = [
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Draft' },
  { id: 'inactive', label: 'Inactive' },
];

type WorkspaceTab = 'catalog' | 'listings';

const AnimatedSection = Animated.View;

export const SellerProductsScreen = memo(function SellerProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const products = useSellerProductStore((state) => state.products);
  const publishedProducts = useSellerProductStore((state) => state.publishedProducts);
  const draftProducts = useSellerProductStore((state) => state.draftProducts);
  const inactiveProducts = useSellerProductStore((state) => state.inactiveProducts);
  const editProduct = useSellerProductStore((state) => state.editProduct);
  const deactivateProduct = useSellerProductStore((state) => state.deactivateProduct);
  const deleteProduct = useSellerProductStore((state) => state.deleteProduct);
  const clearSelection = useSellerProductStore((state) => state.clearSelection);
  const hydrateFromApi = useSellerProductStore((state) => state.hydrateFromApi);
  const refreshFromApi = useSellerProductStore((state) => state.refreshFromApi);
  const productsHydrated = useSellerProductStore((state) => state.isHydrated);

  const [workspace, setWorkspace] = useState<WorkspaceTab>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<GradeFacetCategory | null>(null);

  useEffect(() => {
    if (!productsHydrated) {
      void hydrateFromApi();
    }
  }, [hydrateFromApi, productsHydrated]);

  const { isRefreshing, refresh } = usePullToRefresh(async () => {
    await refreshFromApi();
  });

  const [listingTab, setListingTab] = useState<SellerProductStatus>('published');
  const [pendingDelete, setPendingDelete] = useState<SellerProduct | null>(null);

  const listingProducts = useMemo(() => {
    if (listingTab === 'draft') {
      return draftProducts;
    }
    if (listingTab === 'inactive') {
      return inactiveProducts;
    }
    return publishedProducts;
  }, [draftProducts, inactiveProducts, listingTab, publishedProducts]);

  const openAddProduct = (catalogId?: string, materialType?: string) => {
    clearSelection();
    if (catalogId) {
      router.push({
        pathname: ROUTES.SELLER.ADD_PRODUCT,
        params: { catalogId },
      } as unknown as Href);
      return;
    }
    if (materialType) {
      router.push({
        pathname: ROUTES.SELLER.ADD_PRODUCT,
        params: { materialType },
      } as unknown as Href);
      return;
    }
    router.push(ROUTES.SELLER.ADD_PRODUCT as Href);
  };

  const handleGradePress = (grade: MarketProduct) => {
    const listing = findSellerListingForCatalog(products, grade.id, grade.gradeCode);
    if (listing) {
      router.push({
        pathname: ROUTES.SELLER.PRODUCT_DETAIL,
        params: { productId: listing.id },
      } as unknown as Href);
      return;
    }
    openAddProduct(grade.id);
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerModuleTopBar
        title="PetroTrade"
        showSearch={false}
        onBellPress={() => router.push(ROUTES.SELLER.NOTIFICATIONS as Href)}
      />

      <View className="flex-1">
        <ScrollView
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 140 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />
          }
        >
          <View className="flex-row rounded-2xl bg-brand-white p-xs">
            {(
              [
                { id: 'catalog', label: 'Catalog' },
                { id: 'listings', label: 'My listings' },
              ] as const
            ).map((tab) => {
              const active = workspace === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setWorkspace(tab.id)}
                  className={`flex-1 rounded-2xl px-md py-md ${active ? 'bg-brand-navy' : ''}`}
                >
                  <Typography
                    variant="roleTitle"
                    className={`text-center text-[14px] ${active ? 'text-brand-white' : 'text-brand-body'}`}
                  >
                    {tab.label}
                  </Typography>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => router.push(ROUTES.SELLER.OFFERS as Href)}
            accessibilityRole="button"
            accessibilityLabel="Open My Offers"
            className="mt-md flex-row items-center justify-between rounded-2xl border border-brand-border bg-brand-white px-md py-md"
            style={({ pressed }) => [elevation.sm, { opacity: pressed ? 0.96 : 1 }]}
          >
            <View className="flex-1 pr-md">
              <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
                My Offers
              </Typography>
              <Typography variant="legal" className="mt-xs text-left text-[11px] text-brand-body">
                Manage live bulk pricing and marketplace visibility.
              </Typography>
            </View>
            <Typography variant="badge" className="text-[11px] text-brand-primary-dark">
              Open →
            </Typography>
          </Pressable>

          {workspace === 'catalog' ? (
            <AnimatedSection entering={FadeInDown.duration(280)} className="mt-lg">
              <Typography variant="headingLeft" className="text-[26px] leading-[32px]">
                Marketplace catalog
              </Typography>
              <Typography variant="legal" className="mt-xs text-left text-brand-body">
                Grades from the central Grade Master. Pick a category, narrow by grade group, or
                search to list a grade.
              </Typography>

              <View className="mt-lg">
                <SellerGradePicker
                  listings={products}
                  onSelectGrade={handleGradePress}
                  onCategoryChange={setSelectedCategory}
                />
              </View>
            </AnimatedSection>
          ) : (
            <AnimatedSection entering={FadeInDown.duration(280)} className="mt-lg">
              <Typography variant="headingLeft" className="text-[26px] leading-[32px]">
                Your listings
              </Typography>
              <Typography variant="legal" className="mt-xs text-left text-brand-body">
                Published grades appear in the customer marketplace.
              </Typography>

              <View className="mt-lg flex-row rounded-2xl bg-brand-white p-xs">
                {listingTabs.map((tab) => {
                  const active = listingTab === tab.id;
                  return (
                    <Pressable
                      key={tab.id}
                      onPress={() => setListingTab(tab.id)}
                      className={`flex-1 rounded-2xl px-md py-md ${active ? 'bg-brand-primary-light' : ''}`}
                    >
                      <Typography
                        variant="roleTitle"
                        className={`text-center text-[13px] ${active ? 'text-brand-navy' : 'text-brand-body'}`}
                      >
                        {tab.label}
                      </Typography>
                    </Pressable>
                  );
                })}
              </View>

              <View className="mt-lg gap-md">
                {listingProducts.length > 0 ? (
                  listingProducts.map((product) => (
                    <SellerListingCard
                      key={product.id}
                      product={product}
                      onPress={() => {
                        router.push({
                          pathname: ROUTES.SELLER.PRODUCT_DETAIL,
                          params: { productId: product.id },
                        } as unknown as Href);
                      }}
                      onEdit={() => {
                        editProduct(product.id);
                        router.push({
                          pathname: ROUTES.SELLER.EDIT_PRODUCT,
                          params: { productId: product.id },
                        } as unknown as Href);
                      }}
                      onDeactivate={() => deactivateProduct(product.id)}
                      onDelete={() => setPendingDelete(product)}
                    />
                  ))
                ) : (
                  <EmptyState
                    variant="no_products"
                    title={
                      listingTab === 'draft'
                        ? 'No draft listings'
                        : listingTab === 'inactive'
                          ? 'No inactive listings'
                          : 'No published listings'
                    }
                    description={
                      listingTab === 'draft'
                        ? 'Saved drafts appear here. Finish offer details and publish when you are ready.'
                        : listingTab === 'inactive'
                          ? 'Deactivated listings move here. Edit and republish to make them visible again.'
                          : 'Published grades appear in the customer marketplace. Pick a catalog grade to list stock and price.'
                    }
                    ctaLabel={listingTab === 'published' ? 'Browse catalog' : 'Add listing'}
                    onCtaPress={() =>
                      listingTab === 'published'
                        ? setWorkspace('catalog')
                        : openAddProduct(undefined, selectedCategory?.code)
                    }
                  />
                )}
              </View>
            </AnimatedSection>
          )}
        </ScrollView>

        <Pressable
          onPress={() => openAddProduct(undefined, selectedCategory?.code)}
          accessibilityRole="button"
          accessibilityLabel="Add listing"
          className="absolute right-lg h-14 w-14 items-center justify-center rounded-full bg-brand-navy"
          style={({ pressed }) => [
            elevation.lg,
            {
              // Sit above the bottom tab bar + home-indicator safe area.
              bottom: Math.max(insets.bottom, 8) + 72,
              opacity: pressed ? 0.92 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
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

      <Modal transparent visible={Boolean(pendingDelete)} animationType="fade">
        <View className="flex-1 items-center justify-end bg-black/35 px-lg pb-8">
          <View className="w-full rounded-[28px] bg-brand-white p-lg">
            <Typography variant="headingLeft" className="text-[22px]">
              Delete listing?
            </Typography>
            <Typography variant="subheadingLeft" className="mt-sm">
              This removes the grade from your seller catalog. Buyers will no longer see it.
            </Typography>
            <View className="mt-lg flex-row gap-md">
              <SellerPrimaryButton
                label="Cancel"
                className="flex-1 bg-brand-disabled"
                onPress={() => setPendingDelete(null)}
              />
              <SellerPrimaryButton
                label="Delete"
                className="flex-1 bg-brand-primary-dark"
                onPress={() => {
                  if (pendingDelete) {
                    deleteProduct(pendingDelete.id);
                  }
                  setPendingDelete(null);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
});
