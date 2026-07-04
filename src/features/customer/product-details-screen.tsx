import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {
  BottomActionBar,
  InfoGrid,
  PricingTiersCard,
  ProductBreadcrumb,
  ProductHeader,
  ProductHero,
  ProductInfoCard,
  ProductSkeleton,
  ProductSpecs,
  TrustCard,
} from '@/components/product';
import { Typography } from '@/components/ui/typography';
import {
  getProductDetailsById,
  getTierForQuantity,
  PRODUCT_DETAILS_SKELETON_MS,
} from '@/constants/productDetails';
import { BackArrowIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { addToCart } from '@/services/cart';
import { brandColors } from '@/theme/colors';

export const CustomerProductDetailsScreen = memo(function CustomerProductDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string | string[] }>();

  const productId = useMemo(() => {
    if (typeof params.id === 'string') {
      return params.id;
    }
    if (Array.isArray(params.id) && params.id[0]) {
      return params.id[0];
    }
    return null;
  }, [params.id]);

  const product = useMemo(
    () => (productId ? getProductDetailsById(productId) : null),
    [productId],
  );

  const [isLoading, setIsLoading] = useState(true);
  const [quantityMt, setQuantityMt] = useState(25);
  const [selectedTierId, setSelectedTierId] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, PRODUCT_DETAILS_SKELETON_MS);

    return () => clearTimeout(timer);
  }, [productId]);

  useEffect(() => {
    if (!product) {
      return;
    }

    setQuantityMt(product.moq);
    const initialTier = getTierForQuantity(product.pricingTiers, product.moq);
    setSelectedTierId(initialTier.id);
  }, [product]);

  const selectedTier = useMemo(() => {
    if (!product) {
      return null;
    }
    return (
      product.pricingTiers.find((tier) => tier.id === selectedTierId) ??
      getTierForQuantity(product.pricingTiers, quantityMt)
    );
  }, [product, quantityMt, selectedTierId]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.MARKET as Href);
  }, [router]);

  const handleIncrement = useCallback(() => {
    if (!product) {
      return;
    }
    setQuantityMt((current) => {
      const next = current + product.quantityIncrement;
      const tier = getTierForQuantity(product.pricingTiers, next);
      setSelectedTierId(tier.id);
      return next;
    });
  }, [product]);

  const handleDecrement = useCallback(() => {
    if (!product) {
      return;
    }
    setQuantityMt((current) => {
      const next = Math.max(product.moq, current - product.quantityIncrement);
      const tier = getTierForQuantity(product.pricingTiers, next);
      setSelectedTierId(tier.id);
      return next;
    });
  }, [product]);

  const handleSelectTier = useCallback(
    (tierId: string) => {
      if (!product) {
        return;
      }

      const tier = product.pricingTiers.find((entry) => entry.id === tierId);
      if (!tier) {
        return;
      }

      setSelectedTierId(tier.id);
      setQuantityMt((current) => {
        if (current >= tier.minMt && (tier.maxMt === null || current <= tier.maxMt)) {
          return current;
        }
        return Math.max(product.moq, tier.minMt);
      });
    },
    [product],
  );

  const handleAddToCart = useCallback(() => {
    if (!product || !selectedTier) {
      return;
    }

    addToCart({
      productId: product.id,
      name: `${product.name} ${product.nameLine2}`.trim(),
      grade: product.grade,
      quantityMt,
      unitPricePerKg: selectedTier.unitPrice,
      tierId: selectedTier.id,
    });

    Toast.show({
      type: 'success',
      text1: 'Added to cart',
      text2: `${quantityMt} MT of ${product.breadcrumbProduct} saved locally.`,
      visibilityTime: 2200,
    });
  }, [product, quantityMt, selectedTier]);

  const handleBuyNow = useCallback(() => {
    if (!product || !selectedTier) {
      return;
    }

    router.push({
      pathname: ROUTES.CUSTOMER.CHECKOUT,
      params: {
        productId: product.id,
        quantityMt: String(quantityMt),
        tierId: selectedTier.id,
        unitPrice: String(selectedTier.unitPrice),
      },
    } as unknown as Href);
  }, [product, quantityMt, router, selectedTier]);

  if (!product) {
    return (
      <View className="flex-1 bg-brand-white px-lg" style={{ paddingTop: insets.top + 16 }}>
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-10 w-10 items-center justify-center"
        >
          <BackArrowIcon color={brandColors.heading} />
        </Pressable>
        <Typography variant="headingLeft" className="mt-lg text-brand-heading">
          Product not found
        </Typography>
        <Typography variant="subheadingLeft" className="mt-sm">
          Return to the marketplace and select a material grade.
        </Typography>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-background">
      <ProductHeader onBackPress={handleBack} />
      <ProductBreadcrumb
        category={product.breadcrumbCategory}
        productName={product.breadcrumbProduct}
      />

      {isLoading ? (
        <ProductSkeleton />
      ) : (
        <Animated.View entering={FadeIn.duration(280)} className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            className="flex-1"
          >
            <View className="pt-md" style={{ gap: 16 }}>
              <ProductHero
                imageUrl={product.heroImage}
                accessibilityLabel={`${product.name} product image`}
              />
              <ProductInfoCard product={product} />
              <InfoGrid items={product.infoItems} />
              <ProductSpecs product={product} />
              <PricingTiersCard
                tiers={product.pricingTiers}
                selectedTierId={selectedTierId}
                procurementTerms={product.procurementTerms}
                onSelectTier={handleSelectTier}
              />
              <TrustCard product={product} />
            </View>
          </ScrollView>

          <BottomActionBar
            quantityMt={quantityMt}
            minMt={product.moq}
            increment={product.quantityIncrement}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        </Animated.View>
      )}
    </View>
  );
});
