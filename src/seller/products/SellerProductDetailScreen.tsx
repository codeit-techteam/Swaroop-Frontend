import { memo, useMemo } from 'react';

import { Alert, Image, Pressable, ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, SecondaryButton, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { DocumentCard } from '@/seller/components/analytics';
import { SellerCard, SellerHeader, SellerPrimaryButton } from '@/seller/components';
import {
  getProductDetail,
  simulateProductDocumentDownload,
} from '@/seller/services/productDetailService';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View className="mb-md w-1/2 pr-sm">
    <Typography variant="legal" className="text-left text-brand-body">
      {label}
    </Typography>
    <Typography variant="roleTitle" className="mt-xs">
      {value}
    </Typography>
  </View>
);

export const SellerProductDetailScreen = memo(function SellerProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const products = useSellerProductStore((state) => state.products);
  const editProduct = useSellerProductStore((state) => state.editProduct);

  const product = useMemo(
    () => products.find((item) => item.id === productId),
    [productId, products],
  );

  const detail = useMemo(
    () => getProductDetail(productId ?? ''),
    [productId],
  );

  if (!product) {
    return (
      <ScreenWrapper padded={false} className="bg-brand-background">
        <SellerHeader title="Product Detail" showBack onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-lg">
          <Typography variant="roleTitle">Product not found</Typography>
          <Pressable onPress={() => router.back()} className="mt-md">
            <Typography variant="link">Go back</Typography>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  const handleDownload = async (fileName: string) => {
    const message = await simulateProductDocumentDownload(fileName);
    Alert.alert('Download', message);
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader title="Product Detail" showBack showBell onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120, paddingTop: 8 }}
      >
        <View className="overflow-hidden rounded-2xl bg-brand-white">
          <Image
            source={{ uri: product.imageUrl }}
            className="h-48 w-full bg-brand-surface"
            resizeMode="cover"
          />
          <View className="px-lg py-lg">
            <Typography variant="headingLeft" className="text-[28px]">
              {product.form.name}
            </Typography>
            <Typography variant="legal" className="mt-xs text-left text-brand-body">
              {product.productId}
            </Typography>
            <View className="mt-lg flex-row flex-wrap">
              <DetailRow label="Grade" value={product.form.grade} />
              <DetailRow label="Category" value={product.form.category} />
              <DetailRow label="Origin" value={product.form.origin} />
              <DetailRow label="Brand" value={product.form.brand} />
            </View>
            <Typography variant="roleDescription" className="mt-sm">
              {product.form.description || 'No description provided.'}
            </Typography>
          </View>
        </View>

        <SellerCard title="Inventory" className="mt-lg">
          <View className="flex-row flex-wrap">
            <DetailRow label="Available" value={`${product.form.availableQty} MT`} />
            <DetailRow label="Reserved" value={`${detail.reservedQty} MT`} />
            <DetailRow label="MOQ" value={`${product.form.moq} MT`} />
            <DetailRow label="Warehouse" value={product.form.warehouseLocation} />
          </View>
        </SellerCard>

        <SellerCard title="Pricing" className="mt-lg">
          <View className="flex-row flex-wrap">
            <DetailRow label="Advance" value={`₹${product.pricing.advance}/kg`} />
            <DetailRow label="On Loading" value={`₹${product.pricing.onLoading}/kg`} />
            <DetailRow label="On Delivery" value={`₹${product.pricing.onDelivery}/kg`} />
            <DetailRow label="Credit 15" value={`₹${product.pricing.credit15Days}/kg`} />
            <DetailRow label="Credit 30" value={`₹${product.pricing.credit30Days}/kg`} />
          </View>
        </SellerCard>

        <SellerCard title="Specifications" className="mt-lg">
          <View className="flex-row flex-wrap">
            <DetailRow label="Density" value={product.technicalSpecs.density} />
            <DetailRow label="MFI" value={product.technicalSpecs.mfi} />
            <DetailRow label="Applications" value={detail.applications.join(', ')} />
            <DetailRow label="Packaging" value={detail.packaging} />
          </View>
        </SellerCard>

        <SellerCard title="Documents" className="mt-lg">
          {detail.documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              title={doc.title}
              fileName={doc.fileName}
              onDownload={() => void handleDownload(doc.fileName)}
            />
          ))}
        </SellerCard>

        <SellerCard title="Offer Status" className="mt-lg">
          <View className="flex-row flex-wrap">
            <DetailRow
              label="Offer Live"
              value={detail.offerStatus.isLive ? 'Yes' : 'No'}
            />
            <DetailRow label="Remaining Quantity" value={detail.offerStatus.remainingQuantity} />
            <DetailRow label="Views" value={String(detail.offerStatus.views)} />
            <DetailRow label="Orders" value={String(detail.offerStatus.orders)} />
          </View>
        </SellerCard>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="flex-row gap-md">
          <SecondaryButton
            label="Edit Product"
            variant="outline"
            className="flex-1"
            onPress={() => {
              editProduct(product.id);
              router.push({
                pathname: ROUTES.SELLER.EDIT_PRODUCT,
                params: { productId: product.id },
              } as unknown as Href);
            }}
          />
          <SellerPrimaryButton
            label="View Offer"
            className="flex-1"
            onPress={() => router.push(ROUTES.SELLER.OFFERS as Href)}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
});
