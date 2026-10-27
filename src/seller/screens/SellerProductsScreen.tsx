import { memo, useEffect, useMemo, useState } from 'react';

import { Modal, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import Animated, { FadeInDown } from 'react-native-reanimated';

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

/** Per-tab empty copy so Draft/Inactive never reuse the Published “publish” prompt (S-12). */
const listingEmptyState: Record<
  SellerProductStatus,
  { title: string; description: string; ctaLabel?: string; cta: 'catalog' | 'add' | 'none' }
> = {
  published: {
    title: 'No published listings',
    description:
      'Published grades appear in the customer marketplace. Pick a catalog grade to list stock and price.',
    ctaLabel: 'Browse catalog',
    cta: 'catalog',
  },
  draft: {
    title: 'No draft listings',
    description: 'Saved drafts appear here. Finish listing details and publish when you are ready.',
    ctaLabel: 'Add listing',
    cta: 'add',
  },
  inactive: {
    title: 'No inactive listings',
    description: 'Listings you pause appear here. Edit and republish to make them visible again.',
    cta: 'none',
  },
};

type WorkspaceTab = 'catalog' | 'listings';

/** Approx. seller tab bar height (icons + labels + padding); FAB sits above it. */
const SELLER_TAB_BAR_HEIGHT = 88;
const FAB_SIZE = 56;
const FAB_GAP = 12;

const AnimatedSection = Animated.View;

export const SellerProductsScreen = memo(function SellerProductsScreen() {
  const router = useRouter();
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
        title="PolyStoreX"
        showSearch={false}
        onBellPress={() => router.push(ROUTES.SELLER.NOTIFICATIONS as Href)}
      />

      <View className="relative flex-1">
        <ScrollView
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: 16,
            // Clear tab bar + FAB so the last listing / empty state stays tappable.
            paddingBottom: SELLER_TAB_BAR_HEIGHT + FAB_SIZE + FAB_GAP + 24,
          }}
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
                    title={listingEmptyState[listingTab].title}
                    description={listingEmptyState[listingTab].description}
                    ctaLabel={listingEmptyState[listingTab].ctaLabel}
                    onCtaPress={
                      listingEmptyState[listingTab].cta === 'catalog'
                        ? () => setWorkspace('catalog')
                        : listingEmptyState[listingTab].cta === 'add'
                          ? () => openAddProduct(undefined, selectedCategory?.code)
                          : undefined
                    }
                  />
                )}
              </View>
            </AnimatedSection>
          )}
        </ScrollView>

        <SellerBottomNavigation
          active="products"
          onNavigate={(target) => navigateSellerBottomTab(router, target)}
        />

        {workspace === 'listings' ? (
          <Pressable
            onPress={() => openAddProduct(undefined, selectedCategory?.code)}
            accessibilityRole="button"
            accessibilityLabel="Add listing"
            hitSlop={8}
            className="items-center justify-center rounded-full bg-brand-navy"
            style={({ pressed }) => [
              elevation.lg,
              {
                position: 'absolute',
                right: 16,
                // ScreenWrapper already applies bottom safe-area padding; clear the tab bar only.
                bottom: SELLER_TAB_BAR_HEIGHT + FAB_GAP,
                width: FAB_SIZE,
                height: FAB_SIZE,
                zIndex: 30,
                opacity: pressed ? 0.92 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
          >
            <Typography
              variant="headingLeft"
              className="text-[28px] leading-[28px] text-brand-white"
            >
              +
            </Typography>
          </Pressable>
        ) : null}
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
