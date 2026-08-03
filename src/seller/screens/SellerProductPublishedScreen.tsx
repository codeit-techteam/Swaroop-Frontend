import { memo, useMemo } from 'react';

import { View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { SellerPrimaryButton, SuccessBanner } from '@/seller/components';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';

export const SellerProductPublishedScreen = memo(function SellerProductPublishedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const publishedProducts = useSellerProductStore((state) => state.publishedProducts);
  const clearSelection = useSellerProductStore((state) => state.clearSelection);

  const product = useMemo(
    () => publishedProducts.find((item) => item.id === params.id) ?? publishedProducts[0],
    [params.id, publishedProducts],
  );

  return (
    <ScreenWrapper className="bg-brand-background">
      <SuccessBanner
        title="Product Published Successfully"
        subtitle="Your product is now available in the mock seller catalog and visible in Products."
      />

      <View className="mt-lg rounded-[28px] bg-brand-white p-lg">
        <Typography variant="fieldLabel">Product ID</Typography>
        <Typography variant="headingLeft" className="mt-xs text-[22px]">
          {product?.productId ?? 'PT-PROD-000000'}
        </Typography>

        <View className="mt-lg gap-md">
          <DetailRow label="Category" value={product?.form.category ?? 'Polymers'} />
          <DetailRow label="Price" value={`₹${product?.pricing.advance ?? '145'}/MT`} />
          <DetailRow label="MOQ" value={`${product?.form.moq ?? '10'} MT`} />
        </View>
      </View>

      <View className="mt-auto gap-md">
        <SellerPrimaryButton
          label="Go To Products"
          onPress={() => router.replace(ROUTES.SELLER.PRODUCTS as Href)}
        />
        <SellerPrimaryButton
          label="Add Another Product"
          className="bg-brand-primaryDark"
          onPress={() => {
            clearSelection();
            router.replace(ROUTES.SELLER.ADD_PRODUCT as Href);
          }}
        />
      </View>
    </ScreenWrapper>
  );
});

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row items-center justify-between rounded-2xl bg-brand-surface px-md py-md">
    <Typography variant="roleDescription">{label}</Typography>
    <Typography variant="roleTitle">{value}</Typography>
  </View>
);
