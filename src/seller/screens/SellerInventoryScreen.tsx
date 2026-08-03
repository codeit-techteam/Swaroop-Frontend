import { memo, useEffect, useMemo, useState } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import {
  FilterChipRow,
  InventoryProductCard,
  InventorySummaryCard,
  SearchField,
  SellerBottomNavigation,
  SellerModuleTopBar,
  UpdateStockBottomSheet,
  inventoryCategoryOptions,
} from '@/seller/components';
import { useInventoryStore } from '@/seller/store/inventoryStore';
import type { InventoryCategory, InventoryProduct, StockAdjustmentReason } from '@/seller/types';

const STOCK_REASONS: StockAdjustmentReason[] = [
  'New Procurement',
  'Inventory Adjustment',
  'Quality Hold',
  'Damage',
  'Manual Correction',
];

export const SellerInventoryScreen = memo(function SellerInventoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const products = useInventoryStore((state) => state.products);
  const summary = useInventoryStore((state) => state.inventorySummary);
  const warehouses = useInventoryStore((state) => state.warehouses);
  const selectProduct = useInventoryStore((state) => state.selectProduct);
  const refreshInventoryCatalog = useInventoryStore((state) => state.refreshInventoryCatalog);
  const updateStock = useInventoryStore((state) => state.updateStock);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof inventoryCategoryOptions)[number]>('All Products');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [warehouse, setWarehouse] = useState('');
  const [addStock, setAddStock] = useState('');
  const [reduceStock, setReduceStock] = useState('');
  const [reason, setReason] = useState<StockAdjustmentReason>('New Procurement');

  useEffect(() => {
    refreshInventoryCatalog();
  }, [refreshInventoryCatalog]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        category === 'All Products' || product.category === (category as InventoryCategory);
      if (!matchesCategory) {
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
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [category, products, query]);

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

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerModuleTopBar title="PetroTrade" />
      <View className="flex-1">
        <ScrollView
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 18, paddingBottom: insets.bottom + 120 }}
        >
          <View className="flex-row flex-wrap gap-md">
            <View className="min-w-[47%] flex-1">
              <InventorySummaryCard title="Total Products" value={summary.totalProducts} accent="blue" />
            </View>
            <View className="min-w-[47%] flex-1">
              <InventorySummaryCard
                title="Active Offers"
                value={summary.activeOffers}
                accent="navy"
                meta={`${summary.activeOffers} active`}
              />
            </View>
            <View className="min-w-[47%] flex-1">
              <InventorySummaryCard title="Low Stock" value={summary.lowStock} accent="red" />
            </View>
            <View className="min-w-[47%] flex-1">
              <InventorySummaryCard title="Out Of Stock" value={summary.outOfStock} accent="gray" />
            </View>
          </View>

          <View className="mt-xl">
            <View className="flex-row items-center justify-between">
              <Typography variant="headingLeft" className="text-[28px]">
                Inventory Management
              </Typography>
              <Pressable onPress={() => router.push(ROUTES.SELLER.INVENTORY_HISTORY as Href)}>
                <Typography variant="link">History</Typography>
              </Pressable>
            </View>
            <Typography variant="subheadingLeft" className="mt-xs">
              Search by product name, grade, brand, or category.
            </Typography>
            <View className="mt-md">
              <SearchField
                value={query}
                onChangeText={setQuery}
                placeholder="Search product grades (e.g. HDPE, PE100)..."
              />
            </View>
            <View className="mt-md">
              <FilterChipRow
                options={inventoryCategoryOptions}
                selected={category}
                onSelect={(value) => setCategory(value as (typeof inventoryCategoryOptions)[number])}
              />
            </View>
          </View>

          <View className="mt-lg gap-lg">
            {filteredProducts.map((product) => (
              <InventoryProductCard
                key={product.id}
                product={product}
                onUpdateStock={openStockSheet}
              />
            ))}
            {filteredProducts.length === 0 ? (
              <View className="rounded-[22px] border border-brand-border bg-brand-white px-lg py-2xl">
                <Typography variant="roleTitle" className="text-center">
                  No inventory matches this search.
                </Typography>
              </View>
            ) : null}
          </View>
        </ScrollView>

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
