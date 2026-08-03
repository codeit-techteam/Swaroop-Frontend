import { memo, useMemo, useState } from 'react';

import { ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import {
  SellerBottomNavigation,
  SellerBottomSheet,
  SellerHeader,
  SellerPrimaryButton,
  SellerTextField,
  SpecificationCard,
} from '@/seller/components';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';

export const SellerUpdateStockScreen = memo(function SellerUpdateStockScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const products = useSellerProductStore((state) => state.products);
  const updateStock = useSellerProductStore((state) => state.updateStock);
  const [productId, setProductId] = useState(products[0]?.id ?? '');
  const [newStock, setNewStock] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId) ?? products[0],
    [productId, products],
  );

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader showBack showBell title="Update Stock" onBack={() => router.back()} />

      <View className="flex-1">
        <ScrollView
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 120 }}
        >
          <Typography variant="headingLeft" className="text-[28px]">
            Update Stock
          </Typography>
          <Typography variant="subheadingLeft" className="mt-xs">
            Local inventory editor for the seller workspace. API-ready, mock-backed for now.
          </Typography>

          <View className="mt-lg">
            <SpecificationCard title="Stock Editor">
              <View className="gap-md">
                <SellerTextField
                  label="Select Product"
                  value={selectedProduct?.form.name ?? ''}
                  editable={false}
                  onPressIn={() => setPickerVisible(true)}
                />
                <SellerTextField
                  label="Current Stock"
                  value={selectedProduct?.form.availableQty ?? ''}
                  editable={false}
                />
                <SellerTextField
                  label="New Stock"
                  value={newStock}
                  onChangeText={setNewStock}
                  keyboardType="numeric"
                />
                <SellerTextField
                  label="Warehouse"
                  value={warehouse}
                  onChangeText={setWarehouse}
                  placeholder={selectedProduct?.form.warehouseLocation ?? 'Warehouse location'}
                />
              </View>
            </SpecificationCard>
          </View>

          <SellerPrimaryButton
            label="Update"
            className="mt-lg"
            onPress={() => {
              if (selectedProduct && newStock.trim()) {
                updateStock(
                  selectedProduct.id,
                  newStock.trim(),
                  warehouse.trim() || selectedProduct.form.warehouseLocation,
                );
                router.replace(ROUTES.SELLER.PRODUCTS as Href);
              }
            }}
          />
        </ScrollView>

        <SellerBottomNavigation
          active="products"
          onNavigate={(target) => navigateSellerBottomTab(router, target)}
        />
      </View>

      <SellerBottomSheet
        title="Select Product"
        items={products.map((product) => product.form.name)}
        selectedValue={selectedProduct?.form.name ?? ''}
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={(value) => {
          const nextProduct = products.find((product) => product.form.name === value);
          if (nextProduct) {
            setProductId(nextProduct.id);
          }
        }}
      />
    </ScreenWrapper>
  );
});
