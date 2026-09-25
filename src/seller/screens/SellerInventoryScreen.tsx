import { memo, useEffect, useMemo, useState } from 'react';

import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { AlertCircleIcon, ClipboardCheckIcon, CurrencyIcon, StoreIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  EmptyState,
  FilterChipRow,
  InventoryProductCard,
  InventorySkeleton,
  InventorySummaryCard,
  SearchField,
  SellerBottomNavigation,
  SellerModuleTopBar,
  UpdateStockBottomSheet,
  inventoryCategoryOptions,
} from '@/seller/components';
import { usePullToRefresh } from '@/seller/hooks/usePullToRefresh';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import { useInventoryStore } from '@/seller/store/inventoryStore';
import type { InventoryCategory, InventoryProduct, StockAdjustmentReason } from '@/seller/types';
import { brandColors } from '@/theme/colors';

const STOCK_REASONS: StockAdjustmentReason[] = [
  'New Procurement',
  'Inventory Adjustment',
  'Quality Hold',
  'Damage',
  'Manual Correction',
];

type InventoryLens = 'all' | 'offers' | 'low_stock' | 'out_of_stock';

const AnimatedSection = Animated.View;

export const SellerInventoryScreen = memo(function SellerInventoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const products = useInventoryStore((state) => state.products);
  const summary = useInventoryStore((state) => state.inventorySummary);
  const warehouses = useInventoryStore((state) => state.warehouses);
  const selectProduct = useInventoryStore((state) => state.selectProduct);
  const hydrateFromApi = useInventoryStore((state) => state.hydrateFromApi);
  const refreshFromApi = useInventoryStore((state) => state.refreshFromApi);
  const isHydrated = useInventoryStore((state) => state.isHydrated);
  const updateStock = useInventoryStore((state) => state.updateStock);

  const [query, setQuery] = useState('');
  const [category, setCategory] =
    useState<(typeof inventoryCategoryOptions)[number]>('All Products');
  const [lens, setLens] = useState<InventoryLens>('all');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [warehouse, setWarehouse] = useState('');
  const [addStock, setAddStock] = useState('');
  const [reduceStock, setReduceStock] = useState('');
  const [reason, setReason] = useState<StockAdjustmentReason>('New Procurement');

  useEffect(() => {
    if (!isHydrated) {
      void hydrateFromApi();
    }
  }, [hydrateFromApi, isHydrated]);

  const { isRefreshing, refresh } = usePullToRefresh(async () => {
    await refreshFromApi();
  });

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        category === 'All Products' || product.category === (category as InventoryCategory);
      if (!matchesCategory) {
        return false;
      }
      if (lens === 'offers' && !product.activeOffer) {
        return false;
      }
      if (lens === 'low_stock' && product.status !== 'low_stock') {
        return false;
      }
      if (lens === 'out_of_stock' && product.status !== 'out_of_stock') {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }

      return [
        product.productName,
        product.grade,
        product.brand,
        product.category,
        product.subcategory,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [category, lens, products, query]);

  const openStockSheet = (product: InventoryProduct) => {
    setSelectedProduct(product);
    selectProduct(product.id);
    setWarehouse(product.warehouse);
    setAddStock('');
    setReduceStock('');
    setReason('New Procurement');
    setSheetVisible(true);
  };

  const handleSubmit = () => {
    if (!selectedProduct) {
      return;
    }

    const historyEntry = updateStock({
      productId: selectedProduct.id,
      warehouse: (warehouse || selectedProduct.warehouse) as InventoryProduct['warehouse'],
      addStock: Number(addStock || 0),
      reduceStock: Number(reduceStock || 0),
      reason,
      updatedBy: 'Seller Admin',
    });

    if (!historyEntry) {
      return;
    }

    setSheetVisible(false);
    router.push(`${ROUTES.SELLER.INVENTORY_SUCCESS}?historyId=${historyEntry.id}` as Href);
  };

  const toggleLens = (next: InventoryLens) => {
    setLens((current) => (current === next ? 'all' : next));
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerModuleTopBar
        title="Inventory"
        showSearch={false}
        onBellPress={() => router.push(ROUTES.SELLER.NOTIFICATIONS as Href)}
      />
      <View className="flex-1">
        {!isHydrated ? (
          <View className="flex-1 px-lg pt-md">
            <InventorySkeleton />
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-lg"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 108 }}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />
            }
          >
            <View className="flex-row items-end justify-between">
              <View className="flex-1 pr-md">
                <Typography variant="headingLeft" className="text-[26px] leading-[32px]">
                  Stock desk
                </Typography>
                <Typography variant="legal" className="mt-xs text-left text-brand-body">
                  Marketplace grades across {warehouses.length} warehouses
                </Typography>
              </View>
              <Pressable
                onPress={() => router.push(ROUTES.SELLER.INVENTORY_HISTORY as Href)}
                accessibilityRole="button"
                accessibilityLabel="View inventory history"
                className="rounded-full bg-brand-primary-light px-md py-sm"
              >
                <Typography variant="badge" className="text-[11px] text-brand-primary-dark">
                  History
                </Typography>
              </Pressable>
            </View>

            <AnimatedSection entering={FadeInDown.duration(360).delay(40)} className="mt-lg">
              <View className="flex-row gap-sm">
                <View className="flex-1">
                  <InventorySummaryCard
                    title="Total products"
                    value={summary.totalProducts}
                    accent="blue"
                    selected={false}
                    icon={<StoreIcon size={15} color={brandColors.primaryDark} />}
                    onPress={() => {
                      setLens('all');
                      setCategory('All Products');
                    }}
                  />
                </View>
                <View className="flex-1">
                  <InventorySummaryCard
                    title="Active offers"
                    value={summary.activeOffers}
                    accent="navy"
                    selected={lens === 'offers'}
                    icon={<CurrencyIcon size={15} color={brandColors.navy} />}
                    onPress={() => toggleLens('offers')}
                  />
                </View>
              </View>
              <View className="mt-sm flex-row gap-sm">
                <View className="flex-1">
                  <InventorySummaryCard
                    title="Low stock"
                    value={summary.lowStock}
                    accent="red"
                    selected={lens === 'low_stock'}
                    icon={<AlertCircleIcon size={15} color={brandColors.error} />}
                    onPress={() => toggleLens('low_stock')}
                  />
                </View>
                <View className="flex-1">
                  <InventorySummaryCard
                    title="Out of stock"
                    value={summary.outOfStock}
                    accent="gray"
                    selected={lens === 'out_of_stock'}
                    icon={<ClipboardCheckIcon size={15} color={brandColors.body} />}
                    onPress={() => toggleLens('out_of_stock')}
                  />
                </View>
              </View>
            </AnimatedSection>

            <AnimatedSection entering={FadeInDown.duration(360).delay(90)} className="mt-lg">
              <SearchField
                value={query}
                onChangeText={setQuery}
                placeholder="Search grade, material, or category"
              />
              <View className="mt-md">
                <FilterChipRow
                  options={inventoryCategoryOptions}
                  selected={category}
                  onSelect={(value) =>
                    setCategory(value as (typeof inventoryCategoryOptions)[number])
                  }
                />
              </View>
              <Typography variant="legal" className="mt-md text-left text-brand-body">
                {filteredProducts.length} of {products.length} grades
                {lens === 'offers'
                  ? ' with live offers'
                  : lens === 'low_stock'
                    ? ' running low'
                    : lens === 'out_of_stock'
                      ? ' out of stock'
                      : ''}
              </Typography>
            </AnimatedSection>

            <AnimatedSection
              entering={FadeInDown.duration(360).delay(140)}
              className="mt-md gap-md"
            >
              {filteredProducts.map((product) => (
                <InventoryProductCard
                  key={product.id}
                  product={product}
                  onUpdateStock={openStockSheet}
                />
              ))}
              {filteredProducts.length === 0 ? (
                <EmptyState
                  variant={query.trim() ? 'no_search_results' : 'no_inventory'}
                  title={query.trim() ? 'No matching grades' : 'No inventory items'}
                  description={
                    query.trim()
                      ? 'Try another grade, brand, or clear the stock filter.'
                      : 'Published products will show available, reserved, and offered stock here.'
                  }
                  ctaLabel={query.trim() || lens !== 'all' ? 'Clear filters' : 'Add Product'}
                  onCtaPress={() => {
                    if (query.trim() || lens !== 'all' || category !== 'All Products') {
                      setQuery('');
                      setLens('all');
                      setCategory('All Products');
                      return;
                    }
                    router.push(ROUTES.SELLER.ADD_PRODUCT as Href);
                  }}
                />
              ) : null}
            </AnimatedSection>
          </ScrollView>
        )}

        <SellerBottomNavigation
          active="products"
          onNavigate={(target) => navigateSellerBottomTab(router, target)}
        />
      </View>

      <UpdateStockBottomSheet
        visible={sheetVisible}
        product={selectedProduct}
        warehouse={warehouse}
        warehouses={warehouses}
        addStock={addStock}
        reduceStock={reduceStock}
        reason={reason}
        reasons={STOCK_REASONS}
        onClose={() => setSheetVisible(false)}
        onWarehouseChange={setWarehouse}
        onAddStockChange={setAddStock}
        onReduceStockChange={setReduceStock}
        onReasonChange={(value) => setReason(value as StockAdjustmentReason)}
        onSubmit={handleSubmit}
      />
    </ScreenWrapper>
  );
});
