import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {
  BottomActionBar,
  BuyingSummary,
  DeliveryCard,
  DocumentDownloads,
  InfoGrid,
  PaymentOptionsCard,
  PricingTiersCard,
  ProductApplications,
  ProductBreadcrumb,
  ProductFeatures,
  ProductHeader,
  ProductHero,
  ProductHighlights,
  ProductInfoCard,
  ProductSkeleton,
  ProductSpecs,
  RelatedProducts,
  SpotPriceCard,
  TrustCard,
} from '@/components/product';
import { Typography } from '@/components/ui/typography';
import { buildBlindProductName, buildProductTypeBadge } from '@/constants/cart';
import {
  getProductDetailsById,
  getTierForQuantity,
  priceForQuantity,
} from '@/constants/productDetails';
import { useMarketplaceCatalogQuery } from '@/hooks/use-marketplace-catalog';
import { useProductQuote } from '@/hooks/use-product-quote';
import { BackArrowIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { useCartStore } from '@/store/cart-store';
import { brandColors } from '@/theme/colors';
import type { PaymentMethodId } from '@/types/payment';

export const CustomerProductDetailsScreen = memo(function CustomerProductDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string | string[] }>();

  const {
    products: catalog,
    loading: catalogLoading,
    error: catalogError,
    refetch,
  } = useMarketplaceCatalogQuery();

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
    () => (productId ? getProductDetailsById(productId, catalog) : null),
    [catalog, productId],
  );

  const [quantityMt, setQuantityMt] = useState(25);
  const [selectedTierId, setSelectedTierId] = useState<string>('');
  const [paymentId, setPaymentId] = useState<PaymentMethodId>('advance');

  const {
    quote,
    paymentOptions: backendPaymentOptions,
    loading: quoteLoading,
    error: quoteError,
  } = useProductQuote({
    productId,
    offerId: product?.offerId,
    quantity: quantityMt,
    paymentId,
    enabled: Boolean(product),
  });

  const paymentOptions = backendPaymentOptions;

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

  const selectedPayment = useMemo(() => {
    return (
      paymentOptions.find((option) => option.id === paymentId) ??
      paymentOptions.find((option) => option.eligible) ??
      null
    );
  }, [paymentId, paymentOptions]);

  useEffect(() => {
    if (!selectedPayment || selectedPayment.eligible) {
      return;
    }
    const next = paymentOptions.find((option) => option.eligible);
    if (next && next.id !== paymentId) {
      setPaymentId(next.id);
    }
  }, [paymentId, paymentOptions, selectedPayment]);

  const displayPricePerMt = useMemo(() => {
    if (quote) {
      return Number(quote.unitPrice);
    }
    if (!product) {
      return 0;
    }
    return priceForQuantity(product.pricingTiers, quantityMt) ?? product.spotPrice.pricePerMt;
  }, [product, quantityMt, quote]);

  const displaySpotPrice = useMemo(() => {
    if (!product) {
      return null;
    }
    if (displayPricePerMt === product.spotPrice.pricePerMt) {
      return product.spotPrice;
    }
    return { ...product.spotPrice, pricePerMt: displayPricePerMt };
  }, [displayPricePerMt, product]);

  const estimatedTotal = Number(quote?.totalAmount ?? 0);

  const canPurchase = Boolean(
    product &&
      quote &&
      !quoteError &&
      product.stock > 0 &&
      quantityMt >= product.moq &&
      quantityMt <= product.stock,
  );

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
      const maxQty = product.stock > 0 ? Math.max(product.stock, product.moq) : product.moq;
      const next = Math.min(maxQty, current + product.quantityIncrement);
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
      const next = Math.min(product.stock, Math.max(product.moq, tier.minMt));
      setQuantityMt(next);
    },
    [product],
  );

  const addCurrentItemToCart = useCallback(() => {
    if (!product || !selectedTier) {
      return false;
    }

    if (!canPurchase) {
      Toast.show({
        type: 'error',
        text1: product.stock <= 0 ? 'Out of stock' : 'Unable to add',
        text2:
          product.stock <= 0
            ? 'This grade is currently unavailable.'
            : `Order between ${product.moq} MT and ${product.stock} MT.`,
        visibilityTime: 2200,
      });
      return false;
    }

    const cartName = product.name || buildBlindProductName(product.grade, product.nameLine2);

    useCartStore.getState().addItem({
      productId: product.id,
      name: cartName,
      productType: buildProductTypeBadge(product.materialType || product.breadcrumbCategory),
      grade: product.grade,
      quantityMt,
      unitPricePerMt: displayPricePerMt,
      tierId: selectedTier.id,
      imageUrl: '',
      moq: product.moq,
      quantityIncrement: product.quantityIncrement,
      packaging: product.packaging,
      warehouseRegion: product.warehouseRegion,
      eta: product.eta,
    });

    return true;
  }, [canPurchase, displayPricePerMt, product, quantityMt, selectedTier]);

  const handleAddToCart = useCallback(() => {
    if (!product) {
      return;
    }

    const added = addCurrentItemToCart();
    if (!added) {
      return;
    }

    const cartName = product.name || buildBlindProductName(product.grade, product.nameLine2);
    Toast.show({
      type: 'success',
      text1: 'Added to cart',
      text2: `${quantityMt} MT of ${cartName} added.`,
      visibilityTime: 2200,
    });
  }, [addCurrentItemToCart, product, quantityMt]);

  const handleOpenCart = useCallback(() => {
    router.push(ROUTES.CUSTOMER.CART as Href);
  }, [router]);

  const handleBuyNow = useCallback(() => {
    if (!quote || !canPurchase) {
      Toast.show({
        type: 'error',
        text1: 'Unable to load latest pricing',
        text2: quoteError ?? 'Please wait for the latest quote before placing a request.',
        visibilityTime: 2200,
      });
      return;
    }

    router.push({
      pathname: ROUTES.CUSTOMER.CHECKOUT,
      params: { quoteId: quote.quoteId },
    } as unknown as Href);
  }, [canPurchase, quote, quoteError, router]);

  const handleContinueShopping = useCallback(() => {
    router.replace(ROUTES.CUSTOMER.MARKET as Href);
  }, [router]);

  const handleRelatedSelect = useCallback(
    (relatedId: string) => {
      router.push({
        pathname: ROUTES.CUSTOMER.PRODUCT_DETAILS,
        params: { id: relatedId },
      } as unknown as Href);
    },
    [router],
  );

  if (catalogLoading) {
    return (
      <View className="flex-1 bg-brand-background" accessibilityState={{ busy: true }}>
        <ProductHeader onBackPress={handleBack} onCartPress={handleOpenCart} />
        <ProductSkeleton />
      </View>
    );
  }

  if (catalogError) {
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
          Unable to load product
        </Typography>
        <Typography variant="subheadingLeft" className="mt-sm">
          {catalogError}
        </Typography>
        <Pressable
          onPress={() => {
            void refetch();
          }}
          accessibilityRole="button"
          className="mt-lg self-start rounded-xl bg-brand-primary px-lg py-md"
        >
          <Typography variant="roleTitle" className="text-brand-white">
            Retry
          </Typography>
        </Pressable>
      </View>
    );
  }

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
      <ProductHeader onBackPress={handleBack} onCartPress={handleOpenCart} />
      <ProductBreadcrumb
        category={product.breadcrumbCategory}
        productName={product.breadcrumbProduct}
      />

      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          className="flex-1"
        >
          <View className="pt-md" style={{ gap: 16 }}>
            <ProductHero
              grade={product.grade}
              sku={product.sku}
              accessibilityLabel={`${product.name} grade`}
            />
            <ProductInfoCard product={product} />
            <ProductHighlights highlights={product.highlights} />
            <InfoGrid items={product.infoItems} />
            <DeliveryCard
              origin={product.originRegion}
              eta={product.eta}
              logistics={product.logistics}
            />
            <ProductFeatures features={product.features} />
            <ProductApplications applications={product.applications} industry={product.industry} />
            <ProductSpecs product={product} />
            <DocumentDownloads documents={product.documents} />
            {displaySpotPrice ? <SpotPriceCard spotPrice={displaySpotPrice} /> : null}
            <PricingTiersCard
              tiers={product.pricingTiers}
              selectedTierId={selectedTierId}
              onSelectTier={handleSelectTier}
            />
            <PaymentOptionsCard
              options={paymentOptions}
              selectedId={paymentId}
              onSelect={setPaymentId}
            />
            <View className="mx-lg flex-row" style={{ gap: 10 }}>
              <View className="flex-1 rounded-lg border border-brand-border bg-brand-white px-md py-md">
                <Typography
                  variant="fieldLabel"
                  className="text-[10px] tracking-[0.8px] text-brand-muted"
                >
                  Availability
                </Typography>
                <Typography
                  variant="roleTitle"
                  className="mt-xs text-[13px] text-brand-success"
                  numberOfLines={1}
                >
                  {product.availabilityLabel}
                </Typography>
              </View>
              <View className="flex-1 rounded-lg border border-brand-border bg-brand-white px-md py-md">
                <Typography
                  variant="fieldLabel"
                  className="text-[10px] tracking-[0.8px] text-brand-muted"
                >
                  Delivery ETA
                </Typography>
                <Typography
                  variant="roleTitle"
                  className="mt-xs text-[13px] text-brand-heading"
                  numberOfLines={1}
                >
                  {product.eta}
                </Typography>
              </View>
            </View>
            <BuyingSummary
              quote={quote}
              loading={quoteLoading}
              error={quoteError}
            />
            {quoteError ? (
              <Typography
                variant="caption"
                className="mx-lg font-sans text-[12px] normal-case leading-[16px] tracking-normal text-red-600"
              >
                {quoteError}
              </Typography>
            ) : (
              <Typography
                variant="caption"
                className="mx-lg font-sans text-[11px] normal-case leading-[16px] tracking-normal text-brand-muted"
              >
                Prices include platform freight and GST from the latest PetroTrade quote.
              </Typography>
            )}
            <TrustCard product={product} />
            <Pressable
              onPress={handleContinueShopping}
              accessibilityRole="button"
              accessibilityLabel="Continue shopping"
              className="mx-lg h-11 items-center justify-center rounded-lg"
            >
              <Typography variant="link" className="text-[13px] text-brand-muted">
                Continue Shopping
              </Typography>
            </Pressable>
            <RelatedProducts products={product.relatedProducts} onSelect={handleRelatedSelect} />
          </View>
        </ScrollView>

        <BottomActionBar
          quantityMt={quantityMt}
          minMt={product.moq}
          maxMt={Math.max(product.moq, product.stock)}
          increment={product.quantityIncrement}
          estimatedTotal={estimatedTotal}
          disabled={!canPurchase}
          quoting={quoteLoading || !quote}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      </View>
    </View>
  );
});
