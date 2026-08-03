import { useEffect } from 'react';

import { useLocalSearchParams } from 'expo-router';

import { SellerAddProductScreen } from '@/seller/screens/SellerAddProductScreen';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';

export function SellerEditProductScreen() {
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const editProduct = useSellerProductStore((state) => state.editProduct);

  useEffect(() => {
    if (productId) {
      editProduct(productId);
    }
  }, [editProduct, productId]);

  return <SellerAddProductScreen mode="edit" />;
}
