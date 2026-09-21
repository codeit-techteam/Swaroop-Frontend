import { memo, useMemo } from 'react';

import { Alert, Pressable, ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, SecondaryButton, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { SellerCard, SellerHeader, SellerPrimaryButton } from '@/seller/components';
import { DocumentCard } from '@/seller/components/analytics';
import {
  getProductDetail,
  simulateProductDocumentDownload,
} from '@/seller/services/productDetailService';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';
import { formatSellerSellingPrice, PETROTRADE_CREDIT_NOTE } from '@/seller/utils/pricing';

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

  const detail = useMemo(() => getProductDetail(productId ?? ''), [productId]);

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
        <View className="overflow-hidden rounded-2xl bg-brand-navy px-lg py-lg">
          <Typography
            variant="badge"
            className="text-[11px] tracking-[1px] text-brand-primary-light"
          >
            {(product.form.category || 'GRADE').toUpperCase()}
          </Typography>
          <Typography variant="headingLeft" className="mt-sm text-[26px] text-brand-white">
            {product.form.name}
          </Typography>
          <Typography variant="legal" className="mt-xs text-left text-brand-primary-light">
            {product.productId}
            {product.form.catalogProductId ? ` · ${product.form.grade}` : ''}
          </Typography>
          <View className="mt-lg rounded-2xl bg-brand-white px-md py-md">
            <View className="flex-row flex-wrap">
              <DetailRow label="Grade Name" value={product.form.name} />
              <DetailRow label="Grade Code" value={product.form.grade} />
              <DetailRow label="Category" value={product.form.category} />
              <DetailRow label="Manufacturer" value={product.form.brand} />
              <DetailRow label="Origin" value={product.form.origin} />
              <DetailRow label="Material" value={product.form.polymerType || '—'} />
              <DetailRow label="Packaging" value={product.form.packagingType || detail.packaging} />
              <DetailRow label="Unit" value={product.form.unit || 'MT'} />
              <DetailRow
                label="GST"
                value={product.form.gstPercent ? `${product.form.gstPercent}%` : '—'}
              />
              <DetailRow label="Currency" value={product.form.currency || 'INR'} />
            </View>
            <Typography variant="roleDescription" className="mt-sm">
              {product.form.description || 'No description provided.'}
            </Typography>
          </View>
        </View>

        <SellerCard title="Inventory" className="mt-lg">
          <View className="flex-row flex-wrap">
            <DetailRow
              label="Available"
              value={`${product.form.availableQty} ${product.form.unit || 'MT'}`}
            />
            <DetailRow
              label="Reserved"
              value={`${product.form.reservedQty || detail.reservedQty} ${product.form.unit || 'MT'}`}
            />
            <DetailRow label="MOQ" value={`${product.form.moq} ${product.form.unit || 'MT'}`} />
            <DetailRow label="Warehouse" value={product.form.warehouseLocation} />
          </View>
        </SellerCard>

        <SellerCard title="Commercial" className="mt-lg">
          <View className="flex-row flex-wrap">
            <DetailRow
              label="Selling Price"
              value={formatSellerSellingPrice(product.pricing, product.form.unit || 'MT')}
            />
            <DetailRow label="Currency" value={product.form.currency || 'INR'} />
          </View>
          <Typography variant="legal" className="mt-sm text-left text-brand-body">
            Payment: Platform-managed. {PETROTRADE_CREDIT_NOTE}
          </Typography>
        </SellerCard>

        {product.tiers.length > 0 ? (
          <SellerCard title="Bulk Pricing Tiers" className="mt-lg">
            <View className="gap-sm">
              {product.tiers.map((tier) => (
                <View key={tier.id} className="mb-sm flex-row items-center justify-between">
                  <Typography variant="roleDescription">
                    {tier.minQty}
                    {tier.maxQty ? `-${tier.maxQty}` : '+'} {product.form.unit || 'MT'}
                    {tier.discountLabel ? ` · ${tier.discountLabel}` : ''}
                  </Typography>
                  <Typography variant="roleTitle">
                    ₹{Number(tier.price).toLocaleString('en-IN')}/MT
                  </Typography>
                </View>
              ))}
            </View>
          </SellerCard>
        ) : null}

        <SellerCard title="Specifications" className="mt-lg">
          <View className="flex-row flex-wrap">
            <DetailRow label="Density" value={product.technicalSpecs.density} />
            <DetailRow label="MFI" value={product.technicalSpecs.mfi} />
            <DetailRow
              label="Applications"
              value={product.technicalSpecs.primaryApplication || detail.applications.join(', ')}
            />
            <DetailRow label="Packaging" value={product.form.packagingType || detail.packaging} />
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
            <DetailRow label="Offer Live" value={detail.offerStatus.isLive ? 'Yes' : 'No'} />
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
