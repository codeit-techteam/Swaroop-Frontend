import { memo, useMemo, useState } from 'react';

import { Modal, Pressable, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import {
  SectionHeader,
  SellerBottomNavigation,
  SellerHeader,
  SellerPrimaryButton,
  SellerProductCard,
} from '@/seller/components';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';
import type { SellerProduct, SellerProductStatus } from '@/seller/types';

const tabs: { id: SellerProductStatus; label: string }[] = [
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Draft' },
  { id: 'inactive', label: 'Inactive' },
];

export const SellerProductsScreen = memo(function SellerProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const publishedProducts = useSellerProductStore((state) => state.publishedProducts);
  const draftProducts = useSellerProductStore((state) => state.draftProducts);
  const inactiveProducts = useSellerProductStore((state) => state.inactiveProducts);
  const editProduct = useSellerProductStore((state) => state.editProduct);
  const duplicateProduct = useSellerProductStore((state) => state.duplicateProduct);
  const deactivateProduct = useSellerProductStore((state) => state.deactivateProduct);
  const deleteProduct = useSellerProductStore((state) => state.deleteProduct);
  const clearSelection = useSellerProductStore((state) => state.clearSelection);

  const [activeTab, setActiveTab] = useState<SellerProductStatus>('published');
  const [pendingDelete, setPendingDelete] = useState<SellerProduct | null>(null);

  const products = useMemo(() => {
    if (activeTab === 'draft') {
      return draftProducts;
    }
    if (activeTab === 'inactive') {
      return inactiveProducts;
    }
    return publishedProducts;
  }, [activeTab, draftProducts, inactiveProducts, publishedProducts]);

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader showBack showBell title="Products" onBack={() => router.back()} />

      <View className="flex-1">
        <ScrollView
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 120 }}
        >
          <SectionHeader title="Products Module" />
          <Typography variant="subheadingLeft" className="mt-xs">
            Manage published listings, drafts, and inactive products from one place.
          </Typography>

          <View className="mt-lg flex-row rounded-2xl bg-brand-white p-xs">
            {tabs.map((tab) => {
              const active = tab.id === activeTab;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  className={`flex-1 rounded-2xl px-md py-md ${active ? 'bg-brand-primary-light' : ''}`}
                >
                  <Typography
                    variant="roleTitle"
                    className={`text-center text-[14px] ${active ? 'text-brand-primary' : 'text-brand-body'}`}
                  >
                    {tab.label}
                  </Typography>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-lg gap-lg">
            {products.length > 0 ? (
              products.map((product) => (
                <SellerProductCard
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
                  onDuplicate={() => duplicateProduct(product.id)}
                  onDeactivate={() => deactivateProduct(product.id)}
                  onDelete={() => setPendingDelete(product)}
                />
              ))
            ) : (
              <View className="rounded-3xl bg-brand-white px-lg py-2xl">
                <Typography variant="roleTitle" className="text-center">
                  No {activeTab} products yet
                </Typography>
                <Typography variant="subheading" className="mt-sm">
                  Add a product or save a draft to populate this module.
                </Typography>
              </View>
            )}
          </View>
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
              Delete Product?
            </Typography>
            <Typography variant="subheadingLeft" className="mt-sm">
              This removes the product from the local seller catalog immediately.
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
        onPress={() => {
          clearSelection();
          router.push(ROUTES.SELLER.ADD_PRODUCT as Href);
        }}
        className="absolute bottom-24 right-6 rounded-2xl bg-brand-navy px-lg py-md"
      >
        <Typography variant="button">Add Product</Typography>
      </Pressable>
    </ScreenWrapper>
  );
});
