import { memo, useMemo, useState } from 'react';

import { Modal, Pressable, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { blindGradesMock } from '@/constants/blind-grades';
import { BackArrowIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  EmptyState,
  FilterChipRow,
  SearchField,
  SellerBottomNavigation,
  SellerModuleTopBar,
  SellerPrimaryButton,
} from '@/seller/components';
import {
  SellerCatalogGradeRow,
  SellerListingCard,
  SellerMaterialTile,
} from '@/seller/components/SellerCatalogComponents';
import {
  SELLER_CATALOG_PARENT_FILTERS,
  getCatalogGradesForFamily,
  getMaterialsByParentGroup,
  searchCatalogGrades,
  type SellerMaterialFamily,
} from '@/constants/materials-taxonomy';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';
import type { SellerProduct, SellerProductStatus } from '@/seller/types';
import { findSellerListingForCatalog } from '@/seller/utils/catalog';
import { brandColors } from '@/theme/colors';
import { elevation } from '@/theme/shadows';

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

  const [workspace, setWorkspace] = useState<WorkspaceTab>('catalog');
  const [parentGroup, setParentGroup] = useState<(typeof SELLER_CATALOG_PARENT_FILTERS)[number]>('All');
  const [selectedFamily, setSelectedFamily] = useState<SellerMaterialFamily | null>(null);
  const [subCategory, setSubCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [listingTab, setListingTab] = useState<SellerProductStatus>('published');
  const [pendingDelete, setPendingDelete] = useState<SellerProduct | null>(null);

  const families = useMemo(() => getMaterialsByParentGroup(parentGroup), [parentGroup]);

  const listedCountByFamily = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((product) => {
      const key = product.form.category;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }, [products]);

  const catalogGrades = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed) {
      return searchCatalogGrades(trimmed).filter((product) => {
        if (parentGroup === 'All') {
          return true;
        }
        const familyName = product.materialType || product.category;
        const family = families.find((item) => item.name === familyName);
        return family?.parentGroup === parentGroup;
      });
    }
    if (!selectedFamily) {
      return [];
    }
    return getCatalogGradesForFamily(selectedFamily.name, subCategory);
  }, [families, parentGroup, query, selectedFamily, subCategory]);

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

  const handleGradePress = (catalogId: string, gradeCode?: string) => {
    const listing = findSellerListingForCatalog(products, catalogId, gradeCode);
    if (listing) {
      router.push({
        pathname: ROUTES.SELLER.PRODUCT_DETAIL,
        params: { productId: listing.id },
      } as unknown as Href);
      return;
    }
    openAddProduct(catalogId);
  };

  const showTiles = workspace === 'catalog' && !query.trim() && !selectedFamily;

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
          contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 120 }}
        >
          <View className="flex-row rounded-2xl bg-brand-white p-xs">
            {([
              { id: 'catalog', label: 'Catalog' },
              { id: 'listings', label: 'My listings' },
            ] as const).map((tab) => {
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

          {workspace === 'catalog' ? (
            <AnimatedSection entering={FadeInDown.duration(280)} className="mt-lg">
              <Typography variant="headingLeft" className="text-[26px] leading-[32px]">
                Marketplace catalog
              </Typography>
              <Typography variant="legal" className="mt-xs text-left text-brand-body">
                {blindGradesMock.length} grades live in the customer app. Tap a material to list it.
              </Typography>

              <View className="mt-lg">
                <SearchField
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search HDPE, Melamine, PE100..."
                />
              </View>

              <View className="mt-md">
                <FilterChipRow
                  options={[...SELLER_CATALOG_PARENT_FILTERS]}
                  selected={parentGroup}
                  onSelect={(value) => {
                    setParentGroup(value as (typeof SELLER_CATALOG_PARENT_FILTERS)[number]);
                    setSelectedFamily(null);
                    setSubCategory('All');
                  }}
                />
              </View>

              {selectedFamily && !query.trim() ? (
                <View className="mt-lg">
                  <Pressable
                    onPress={() => {
                      setSelectedFamily(null);
                      setSubCategory('All');
                    }}
                    className="flex-row items-center"
                    accessibilityRole="button"
                    accessibilityLabel="Back to materials"
                  >
                    <BackArrowIcon size={16} color={brandColors.navy} />
                    <Typography variant="roleTitle" className="ml-sm text-[14px] text-brand-navy">
                      All materials
                    </Typography>
                  </Pressable>
                  <Typography variant="headingLeft" className="mt-sm text-[22px]">
                    {selectedFamily.code}
                  </Typography>
                  <Typography variant="legal" className="mt-xs text-left text-brand-body">
                    {selectedFamily.gradeCount} grades · {selectedFamily.parentGroup}
                  </Typography>
                  {selectedFamily.subCategories.length > 1 ? (
                    <View className="mt-md">
                      <FilterChipRow
                        options={['All', ...selectedFamily.subCategories]}
                        selected={subCategory}
                        onSelect={setSubCategory}
                      />
                    </View>
                  ) : null}
                </View>
              ) : null}

              {showTiles ? (
                <View className="mt-lg flex-row flex-wrap justify-between">
                  {families.map((family) => (
                    <View key={family.id} className="mb-md" style={{ width: '48.5%' }}>
                      <SellerMaterialTile
                        family={family}
                        listedCount={listedCountByFamily.get(family.name) ?? 0}
                        onPress={() => {
                          setSelectedFamily(family);
                          setSubCategory('All');
                        }}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <View className="mt-lg gap-md">
                  {catalogGrades.length > 0 ? (
                    catalogGrades.map((product) => (
                      <SellerCatalogGradeRow
                        key={product.id}
                        product={product}
                        listing={findSellerListingForCatalog(
                          products,
                          product.id,
                          product.gradeCode,
                        )}
                        onPress={() => handleGradePress(product.id, product.gradeCode)}
                      />
                    ))
                  ) : (
                    <EmptyState
                      variant="no_search_results"
                      title="No matching grades"
                      description="Try another material, grade code, or clear the search."
                      ctaLabel="Clear search"
                      onCtaPress={() => setQuery('')}
                    />
                  )}
                </View>
              )}
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
                    title={`No ${listingTab} listings`}
                    description="Pick a grade from the marketplace catalog to publish it with your stock and price."
                    ctaLabel="Browse catalog"
                    onCtaPress={() => setWorkspace('catalog')}
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

      <Pressable
        onPress={() => openAddProduct(undefined, selectedFamily?.name)}
        className="absolute bottom-24 right-6 rounded-2xl bg-brand-navy px-lg py-md"
        style={elevation.md}
      >
        <Typography variant="button">Add listing</Typography>
      </Pressable>
    </ScreenWrapper>
  );
});
