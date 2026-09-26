import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {
  AddedToCartBanner,
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
import { buildBlindProductName } from '@/constants/cart';
import {
  getProductDetailsById,
  getTierForQuantity,
  priceForQuantity,
} from '@/constants/productDetails';
import { useMarketplaceCatalogQuery } from '@/hooks/use-marketplace-catalog';
import { useNotificationBadge } from '@/hooks/use-notifications';
import { useProductQuote } from '@/hooks/use-product-quote';
import { BackArrowIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { addCustomerCartItem, mapBackendCartItems } from '@/services/cart';
import { fetchCustomerMarketplaceProduct } from '@/services/catalog';
import { checkoutErrorMessage, toBackendPaymentOption } from '@/services/checkout';
import { useCartStore } from '@/store/cart-store';
import { brandColors } from '@/theme/colors';
import type { MarketProduct } from '@/types/market';
import type { PaymentMethodId } from '@/types/payment';
import {
  DEFAULT_ADVANCE_DISCOUNT_RATE,
  buyingSummaryFromQuote,
  estimateProductQuote,
  quoteMatchesSelection,
} from '@/utils/product-quote-estimate';

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

  const [detailProduct, setDetailProduct] = useState<MarketProduct | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);
    void fetchCustomerMarketplaceProduct(productId)
      .then((item) => {
        if (!cancelled) {
          setDetailProduct(item);
          setDetailLoading(false);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setDetailProduct(null);
          setDetailLoading(false);
          setDetailError(
            error instanceof Error ? error.message : 'Unable to load product',
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const product = useMemo(() => {
    if (!productId) return null;
    if (detailProduct) {
      return getProductDetailsById(productId, [detailProduct, ...catalog]);
    }
    return getProductDetailsById(productId, catalog);
  }, [catalog, detailProduct, productId]);

  const loading = catalogLoading || detailLoading;
  const loadError = detailError ?? catalogError;

  const [quantityMt, setQuantityMt] = useState(25);
  const [selectedTierId, setSelectedTierId] = useState<string>('');
  const [paymentId, setPaymentId] = useState<PaymentMethodId>('advance');
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedBanner, setAddedBanner] = useState<{
    quantityMt: number;
    productName: string;
  } | null>(null);
  const addingLock = useRef(false);
  const pendingCheckout = useRef(false);
  const [awaitingQuote, setAwaitingQuote] = useState(false);

  const {
    quote,
    paymentOptions: backendPaymentOptions,
    loading: quoteLoading,
    refreshing: quoteRefreshing,
    error: quoteError,
  } = useProductQuote({
    productId,
    offerId: product?.offerId,
    quantity: quantityMt,
    paymentId,
    enabled: Boolean(product),
  });

  const paymentOptions = useMemo(
    () =>
      backendPaymentOptions.length > 0 ? backendPaymentOptions : (product?.paymentOptions ?? []),
    [backendPaymentOptions, product?.paymentOptions],
  );

  useEffect(() => {
    if (!product) {
      return;
    }

    setQuantityMt(product.moq);
    const initialTier = getTierForQuantity(product.pricingTiers, product.moq);
    setSelectedTierId(initialTier?.id ?? '');
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

  const matchingQuote = quoteMatchesSelection(quote, quantityMt, paymentId) ? quote : null;

  const displayPricePerMt = useMemo(() => {
    if (matchingQuote) {
      return Number(matchingQuote.unitPrice);
    }
    if (!product) {
      return 0;
    }
    return priceForQuantity(product.pricingTiers, quantityMt) ?? product.spotPrice.pricePerMt;
  }, [matchingQuote, product, quantityMt]);

  const displaySpotPrice = useMemo(() => {
    if (!product) {
      return null;
    }
    if (displayPricePerMt === product.spotPrice.pricePerMt) {
      return product.spotPrice;
    }
    return { ...product.spotPrice, pricePerMt: displayPricePerMt };
  }, [displayPricePerMt, product]);

  const buyingSummary = useMemo(() => {
    if (matchingQuote) {
      return buyingSummaryFromQuote(matchingQuote);
    }
    if (!product || !(displayPricePerMt > 0)) {
      return null;
    }
    const discountRate =
      selectedPayment?.discountRate ??
      (paymentId === 'advance' ? DEFAULT_ADVANCE_DISCOUNT_RATE : 0);
    return estimateProductQuote({
      unitPrice: displayPricePerMt,
      quantity: quantityMt,
      discountRate,
      freightPerMt: product.logistics.freightPerMt,
    });
  }, [
    displayPricePerMt,
    matchingQuote,
    paymentId,
    product,
    quantityMt,
    selectedPayment?.discountRate,
  ]);

  const estimatedTotal = buyingSummary?.grandTotal ?? 0;
  const confirmingPrice = Boolean(product) && !matchingQuote && !quoteError;

  const canPurchase = Boolean(
    product && product.stock > 0 && quantityMt >= product.moq && quantityMt <= product.stock,
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
      setSelectedTierId(tier?.id ?? '');
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
      setSelectedTierId(tier?.id ?? '');
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

  const addCurrentItemToCart = useCallback(async () => {
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

    const offerId = matchingQuote?.offerId ?? product.offerId;
    if (!offerId) {
      Toast.show({
        type: 'error',
        text1: 'Unable to add',
        text2: 'Latest market pricing is still loading. Please try again.',
      });
      return false;
    }

    if (addingLock.current) {
      return false;
    }
    addingLock.current = true;
    setAddingToCart(true);
    try {
      const result = await addCustomerCartItem({
        offerId,
        quantity: quantityMt,
        paymentMethod: toBackendPaymentOption(paymentId),
      });
      useCartStore.getState().replaceItems(mapBackendCartItems(result.cart));
      return true;
    } catch (cause) {
      Toast.show({
        type: 'error',
        text1: 'Unable to add to cart',
        text2: checkoutErrorMessage(cause, 'Please check your connection and try again.'),
      });
      return false;
    } finally {
      addingLock.current = false;
      setAddingToCart(false);
    }
  }, [canPurchase, matchingQuote?.offerId, paymentId, product, quantityMt, selectedTier]);

  const handleAddToCart = useCallback(async () => {
    if (!product) {
      return;
    }

    const added = await addCurrentItemToCart();
    if (!added) {
      return;
    }

    const cartName = product.name || buildBlindProductName(product.grade, product.nameLine2);
    setAddedBanner({ quantityMt, productName: cartName });
  }, [addCurrentItemToCart, product, quantityMt]);

  const handleOpenCart = useCallback(() => {
    router.push(ROUTES.CUSTOMER.CART as Href);
  }, [router]);

  const unreadCount = useNotificationBadge();

  const handleNotifications = useCallback(() => {
    router.push(ROUTES.CUSTOMER.NOTIFICATIONS as Href);
  }, [router]);

  const goToCheckout = useCallback(
    (quoteId: string) => {
      pendingCheckout.current = false;
      setAwaitingQuote(false);
      router.push({
        pathname: ROUTES.CUSTOMER.CHECKOUT,
        params: { quoteId },
      } as unknown as Href);
    },
    [router],
  );

  const handleBuyNow = useCallback(() => {
    if (!canPurchase) {
      Toast.show({
        type: 'error',
        text1: product?.stock === 0 ? 'Out of stock' : 'Unable to buy',
        text2: 'Please choose an available quantity before placing a request.',
        visibilityTime: 2200,
      });
      return;
    }

    if (matchingQuote) {
      goToCheckout(matchingQuote.quoteId);
      return;
    }

    if (quoteError && !quoteLoading && !quoteRefreshing) {
      Toast.show({
        type: 'error',
        text1: 'Unable to load latest pricing',
        text2: quoteError,
        visibilityTime: 2200,
      });
      return;
    }

    pendingCheckout.current = true;
    setAwaitingQuote(true);
  }, [
    canPurchase,
    goToCheckout,
    matchingQuote,
    product?.stock,
    quoteError,
    quoteLoading,
    quoteRefreshing,
  ]);

  useEffect(() => {
    if (!pendingCheckout.current) {
      return;
    }
    if (matchingQuote) {
      goToCheckout(matchingQuote.quoteId);
      return;
    }
    if (quoteError && !quoteLoading && !quoteRefreshing) {
      pendingCheckout.current = false;
      setAwaitingQuote(false);
      Toast.show({
        type: 'error',
        text1: 'Unable to load latest pricing',
        text2: quoteError,
        visibilityTime: 2200,
      });
    }
  }, [goToCheckout, matchingQuote, quoteError, quoteLoading, quoteRefreshing]);

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

  if (loading && !product) {
    return (
      <View className="flex-1 bg-brand-background" accessibilityState={{ busy: true }}>
        <ProductHeader
          onBackPress={handleBack}
          onCartPress={handleOpenCart}
          onNotificationPress={handleNotifications}
          hasNotification={unreadCount > 0}
        />
        <ProductSkeleton />
      </View>
    );
  }

  if (loadError && !product) {
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
          {loadError}
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
      <ProductHeader
        onBackPress={handleBack}
        onCartPress={handleOpenCart}
        onNotificationPress={handleNotifications}
        hasNotification={unreadCount > 0}
      />
      <ProductBreadcrumb
        category={product.breadcrumbCategory}
        productName={product.breadcrumbProduct}
      />

      <View className="flex-1">
        <AddedToCartBanner
          visible={Boolean(addedBanner)}
          quantityLabel={addedBanner ? `${addedBanner.quantityMt} MT` : undefined}
          message={addedBanner?.productName ?? ''}
          onDismiss={() => setAddedBanner(null)}
          onViewCart={handleOpenCart}
        />
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
            <DocumentDownloads
              documents={product.documents}
              productId={product.id}
            />
            {displaySpotPrice ? <SpotPriceCard spotPrice={displaySpotPrice} /> : null}
            {product.pricingTiers.length > 0 ? (
              <PricingTiersCard
                tiers={product.pricingTiers}
                selectedTierId={selectedTierId}
                onSelectTier={handleSelectTier}
              />
            ) : null}
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
              summary={buyingSummary}
              refreshing={confirmingPrice}
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
                {confirmingPrice
                  ? 'Showing an estimated total while we confirm freight, GST, and the latest market price.'
                  : 'Prices include platform freight and GST from the latest PetroTrade quote.'}
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
          refreshing={confirmingPrice}
          lockingPrice={awaitingQuote}
          adding={addingToCart}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onAddToCart={() => {
            void handleAddToCart();
          }}
          onBuyNow={handleBuyNow}
        />
      </View>
    </View>
  );
});
