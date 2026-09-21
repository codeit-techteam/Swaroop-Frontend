import { memo, useMemo } from 'react';

import { View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { SellerPrimaryButton, SuccessBanner } from '@/seller/components';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';
import { formatSellerSellingPrice } from '@/seller/utils/pricing';

export const SellerProductPublishedScreen = memo(function SellerProductPublishedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const publishedProducts = useSellerProductStore((state) => state.publishedProducts);
  const clearSelection = useSellerProductStore((state) => state.clearSelection);

  const product = useMemo(
    () => publishedProducts.find((item) => item.id === params.id) ?? publishedProducts[0],
    [params.id, publishedProducts],
  );

  const sellingPrice = formatSellerSellingPrice(product?.pricing, product?.form.unit || 'MT');

  return (
    <ScreenWrapper className="bg-brand-background">
      <SuccessBanner
        title="Listing is live"
        subtitle="Buyers can now see this grade in the customer marketplace."
      />

      <View className="mt-lg overflow-hidden rounded-3xl bg-brand-navy p-lg">
        <Typography variant="badge" className="text-[10px] text-brand-primary-light">
          {product?.form.category || 'GRADE'}
        </Typography>
        <Typography variant="headingLeft" className="mt-sm text-[24px] text-brand-white">
          {product?.form.name ?? 'Marketplace grade'}
        </Typography>
        <Typography variant="legal" className="mt-xs text-left text-brand-primary-light">
          {product?.productId ?? 'PT-PROD-000000'} · {product?.form.grade}
        </Typography>
      </View>

      <View className="mt-lg gap-sm">
        <DetailRow label="Brand" value={product?.form.brand || '—'} />
        <DetailRow label="Selling price" value={sellingPrice} />
        <DetailRow
          label="Stock"
          value={`${product?.form.availableQty || '0'} ${product?.form.unit || 'MT'}`}
        />
        <DetailRow
          label="MOQ"
          value={`${product?.form.moq || '—'} ${product?.form.unit || 'MT'}`}
        />
      </View>

      <View className="mt-auto gap-md">
        <SellerPrimaryButton
          label="Go to products"
          onPress={() => router.replace(ROUTES.SELLER.PRODUCTS as Href)}
        />
        <SellerPrimaryButton
          label="Add another listing"
          className="bg-brand-primary-dark"
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
  <View className="flex-row items-center justify-between rounded-2xl bg-brand-white px-md py-md">
    <Typography variant="roleDescription">{label}</Typography>
    <Typography variant="roleTitle" className="text-[14px]">
      {value}
    </Typography>
  </View>
);
