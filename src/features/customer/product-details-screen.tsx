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
import { SecondaryButton } from '@/components/ui';
import { Typography } from '@/components/ui/typography';
import { buildBlindProductName } from '@/constants/cart';
import {
  getProductDetailsById,
  getTierForQuantity,
  priceForQuantity,
} from '@/constants/productDetails';
import { useDeliveryLocation } from '@/hooks/use-delivery-location';
import { useMarketplaceCatalogQuery } from '@/hooks/use-marketplace-catalog';
import { useMarketplacePricingEstimate } from '@/hooks/use-marketplace-pricing-estimate';
import { useNotificationBadge } from '@/hooks/use-notifications';
import { useProductQuote } from '@/hooks/use-product-quote';
import { BackArrowIcon } from '@/icons';
import { buildLoginHref } from '@/navigation/return-to';
import { ROUTES } from '@/navigation/routes';
import { addCustomerCartItem, mapBackendCartItems } from '@/services/cart';
import { fetchCustomerMarketplaceProduct, fetchProductDocuments } from '@/services/catalog';
import { checkoutErrorMessage, toBackendPaymentOption } from '@/services/checkout';
import { selectIsLoggedIn, useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { brandColors } from '@/theme/colors';
import type { MarketProduct } from '@/types/market';
import type { PaymentMethodId } from '@/types/payment';
import type { CreditCtaType } from '@/types/payment-eligibility';
import { guestCreditAccess } from '@/types/payment-eligibility';
import type { ComplianceDocument } from '@/types/product';
import {
  buyingSummaryFromQuote,
  estimateProductQuote,
  quoteMatchesSelection,
} from '@/utils/product-quote-estimate';

const mapApiDoc = (doc: {
  id: string;
  type: string;
  title: string;
  description?: string;
  version?: number;
  status?: string;
  fileName?: string;
  productId?: string;
}): ComplianceDocument => ({
  id: doc.id,
  type: (String(doc.type).toLowerCase() || 'other') as ComplianceDocument['type'],
  title: doc.title,
  description: doc.description ?? 'Verified product document',
  fileName: doc.fileName ?? `${doc.title}.pdf`,
  version: doc.version,
  status: doc.status,
  productId: doc.productId,
});

export const CustomerProductDetailsScreen = memo(function CustomerProductDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string | string[];
    qty?: string | string[];
    destination?: string | string[];
    notes?: string | string[];
    rfq?: string | string[];
  }>();
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const { selectedLocation, openAddressForm } = useDeliveryLocation();

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
  const [apiDocuments, setApiDocuments] = useState<ComplianceDocument[]>([]);
  const [docsUnavailableMessage, setDocsUnavailableMessage] = useState<string | null>(null);
  const [rfqNotes, setRfqNotes] = useState('');
  const [rfqDestination, setRfqDestination] = useState('');

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
          setDetailError(error instanceof Error ? error.message : 'Unable to load product');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    void fetchProductDocuments(productId)
      .then((docs) => {
        if (cancelled) return;
        const mapped = docs.map((doc) => mapApiDoc({ ...doc, productId }));
        setApiDocuments(mapped);
        setDocsUnavailableMessage(
          mapped.length === 0 ? 'TDS unavailable — no approved technical documents on file.' : null,
        );
      })
      .catch(() => {
        if (!cancelled) {
          setApiDocuments([]);
          setDocsUnavailableMessage('TDS unavailable — unable to load technical documents.');
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

  const initialQtyParam = useMemo(() => {
    const raw = typeof params.qty === 'string' ? params.qty : params.qty?.[0];
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [params.qty]);

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

  useEffect(() => {
    const dest =
      typeof params.destination === 'string' ? params.destination : params.destination?.[0];
    const notes = typeof params.notes === 'string' ? params.notes : params.notes?.[0];
    if (dest) setRfqDestination(dest);
    if (notes) setRfqNotes(notes);
  }, [params.destination, params.notes]);

  const estimatedAmountForEligibility = useMemo(() => {
    if (!product || !(quantityMt > 0)) return undefined;
    const unit = product.spotPrice.pricePerMt;
    return unit > 0 ? unit * quantityMt : undefined;
  }, [product, quantityMt]);

  const {
    quote,
    paymentOptions: backendPaymentOptions,
    creditAccess,
    creditStatus,
    refreshCredit,
    loading: quoteLoading,
    refreshing: quoteRefreshing,
    error: quoteError,
  } = useProductQuote({
    productId,
    offerId: product?.offerId,
    quantity: quantityMt,
    paymentId,
    enabled: Boolean(product) && isLoggedIn,
    amount: estimatedAmountForEligibility,
  });

  const paymentOptions = useMemo(
    () =>
      backendPaymentOptions.length > 0
        ? backendPaymentOptions
        : (product?.paymentOptions ?? []).filter((option) => option.title?.trim()),
    [backendPaymentOptions, product?.paymentOptions],
  );

  useEffect(() => {
    if (!product) {
      return;
    }

    const nextQty = initialQtyParam ?? product.moq;
    setQuantityMt(nextQty);
    const initialTier = getTierForQuantity(product.pricingTiers, nextQty);
    setSelectedTierId(initialTier?.id ?? '');
  }, [initialQtyParam, product]);

  const offerIdForEstimate = product?.offerId ?? null;
  const {
    estimate: pricingEstimate,
    loading: estimateLoading,
    error: estimateError,
  } = useMarketplacePricingEstimate({
    offerId: offerIdForEstimate,
    quantity: quantityMt,
    paymentId,
    enabled: Boolean(offerIdForEstimate),
  });

  const requireLoginForPurchase = useCallback(() => {
    if (!productId) return;
    const search = new URLSearchParams();
    search.set('qty', String(quantityMt));
    if (rfqDestination.trim()) search.set('destination', rfqDestination.trim());
    if (rfqNotes.trim()) search.set('notes', rfqNotes.trim());
    const returnTo = `/(customer)/product/${productId}?${search.toString()}`;
    Toast.show({
      type: 'info',
      text1: 'Sign in to continue',
      text2: 'Your quantity will be restored after login.',
      visibilityTime: 2200,
    });
    router.push(buildLoginHref(returnTo));
  }, [productId, quantityMt, rfqDestination, rfqNotes, router]);

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
    return estimateProductQuote({
      unitPrice: displayPricePerMt,
      quantity: quantityMt,
      discountRate: selectedPayment?.discountRate ?? 0,
      freightPerMt: product.logistics.freightPerMt,
    });
  }, [displayPricePerMt, matchingQuote, product, quantityMt, selectedPayment?.discountRate]);

  const estimatedTotal = buyingSummary?.grandTotal ?? 0;
  const confirmingPrice = Boolean(product) && !matchingQuote && !quoteError;

  const canPurchase = Boolean(
    product && product.stock > 0 && quantityMt >= product.moq && quantityMt <= product.stock,
  );
  const purchaseDisabledReason = !product
    ? null
    : product.stock <= 0
      ? 'This grade is currently out of stock.'
      : quantityMt < product.moq
        ? `Minimum order is ${product.moq} MT.`
        : quantityMt > product.stock
          ? `Only ${product.stock} MT available.`
          : null;

  const handleCreditCta = useCallback(
    (type: CreditCtaType) => {
      if (!isLoggedIn) {
        const returnTo = ROUTES.CUSTOMER.CREDIT_REQUEST;
        Toast.show({
          type: 'info',
          text1: 'Sign in to continue',
          text2: 'You can request business credit after signing in.',
        });
        router.push(buildLoginHref(returnTo));
        return;
      }
      if (type === 'VIEW_APPLICATION' && creditAccess?.application?.id) {
        router.push({
          pathname: ROUTES.CUSTOMER.CREDIT_APPLICATION_STATUS,
          params: { id: creditAccess.application.id },
        } as unknown as Href);
        return;
      }
      if (type === 'CONTACT_SUPPORT') {
        router.push(ROUTES.CUSTOMER.SUPPORT as Href);
        return;
      }
      router.push(ROUTES.CUSTOMER.CREDIT_REQUEST as Href);
    },
    [creditAccess?.application?.id, isLoggedIn, router],
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

    if (!isLoggedIn) {
      requireLoginForPurchase();
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
  }, [
    canPurchase,
    isLoggedIn,
    matchingQuote?.offerId,
    paymentId,
    product,
    quantityMt,
    requireLoginForPurchase,
    selectedTier,
  ]);

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

  const handleRequestQuote = useCallback(() => {
    if (!product || !productId) {
      return;
    }
    const search = new URLSearchParams();
    search.set('qty', String(quantityMt));
    search.set('rfq', '1');
    if (rfqDestination.trim()) search.set('destination', rfqDestination.trim());
    if (rfqNotes.trim()) search.set('notes', rfqNotes.trim());
    const returnTo = `/(customer)/product/${productId}?${search.toString()}`;

    if (!isLoggedIn) {
      Toast.show({
        type: 'info',
        text1: 'Sign in to submit a purchase request',
        text2: 'Your RFQ details will be available after you return.',
      });
      router.push(buildLoginHref(returnTo));
      return;
    }

    if (matchingQuote) {
      router.push({
        pathname: ROUTES.CUSTOMER.CHECKOUT,
        params: {
          quoteId: matchingQuote.quoteId,
          rfq: '1',
          ...(rfqDestination.trim() ? { destination: rfqDestination.trim() } : {}),
          ...(rfqNotes.trim() ? { notes: rfqNotes.trim() } : {}),
        },
      } as unknown as Href);
      return;
    }

    pendingCheckout.current = true;
    setAwaitingQuote(true);
    Toast.show({
      type: 'info',
      text1: 'Preparing purchase request',
      text2: 'Confirming latest pricing for your RFQ…',
    });
  }, [isLoggedIn, matchingQuote, product, productId, quantityMt, rfqDestination, rfqNotes, router]);

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
    if (!isLoggedIn) {
      requireLoginForPurchase();
      return;
    }

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
    isLoggedIn,
    matchingQuote,
    product?.stock,
    quoteError,
    quoteLoading,
    quoteRefreshing,
    requireLoginForPurchase,
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
              fulfilment={product.fulfilment}
              availabilityLabel={product.availabilityLabel}
              destinationPincode={selectedLocation.pincode}
              onRequestPincode={() => openAddressForm()}
            />
            <ProductFeatures features={product.features} />
            <ProductApplications applications={product.applications} industry={product.industry} />
            <ProductSpecs product={product} />
            <DocumentDownloads
              documents={apiDocuments.length > 0 ? apiDocuments : product.documents}
              productId={product.id}
              emptyMessage={docsUnavailableMessage}
              requireAuth={!isLoggedIn}
              onRequireAuth={requireLoginForPurchase}
            />
            {displaySpotPrice ? (
              <SpotPriceCard
                spotPrice={displaySpotPrice}
                unitPricePerMt={pricingEstimate?.unitPricePerMt}
                unitPricePerKg={pricingEstimate?.unitPricePerKg}
                currency={pricingEstimate?.currency}
              />
            ) : null}
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
              creditAccess={isLoggedIn ? creditAccess : guestCreditAccess(product.productCredit)}
              creditStatus={isLoggedIn ? creditStatus : ('ready' as const)}
              onRetryCredit={isLoggedIn ? refreshCredit : undefined}
              onCreditCta={handleCreditCta}
            />
            <BuyingSummary
              summary={
                pricingEstimate?.currency?.toUpperCase() === 'INR' && pricingEstimate.inclusiveTotal
                  ? buyingSummary
                  : pricingEstimate?.currency && pricingEstimate.currency.toUpperCase() !== 'INR'
                    ? null
                    : buyingSummary
              }
              unitPrices={
                pricingEstimate
                  ? {
                      currency: pricingEstimate.currency,
                      unitPricePerMt: pricingEstimate.unitPricePerMt,
                      unitPricePerKg: pricingEstimate.unitPricePerKg,
                      note: pricingEstimate.note,
                    }
                  : null
              }
              refreshing={confirmingPrice || estimateLoading}
              error={estimateError ?? quoteError}
            />
            {estimateError || quoteError ? (
              <Typography
                variant="caption"
                className="mx-lg font-sans text-[12px] normal-case leading-[16px] tracking-normal text-red-600"
              >
                {estimateError ?? quoteError}
              </Typography>
            ) : (
              <Typography
                variant="caption"
                className="mx-lg font-sans text-[11px] normal-case leading-[16px] tracking-normal text-brand-muted"
              >
                {confirmingPrice || estimateLoading
                  ? 'Showing an estimated total while we confirm freight, GST, and the latest market price.'
                  : '₹/MT and ₹/kg come from the marketplace estimate API. Checkout totals are recalculated server-side.'}
              </Typography>
            )}
            <View className="mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm">
              <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
                Request a quote
              </Typography>
              <Typography
                variant="caption"
                className="mt-xs font-sans text-[12px] normal-case tracking-normal text-brand-muted"
              >
                Opens the purchase request flow with this grade and quantity
                {rfqDestination ? ` · ${rfqDestination}` : ''}.
              </Typography>
              <SecondaryButton
                label="Request quote (RFQ)"
                variant="outline"
                className="mt-md"
                onPress={handleRequestQuote}
              />
            </View>
            <TrustCard product={product} />
            <Pressable
              onPress={handleContinueShopping}
              accessibilityRole="button"
              accessibilityLabel="Continue shopping"
              className="mx-lg flex-row items-center justify-center gap-sm rounded-xl border border-brand-border bg-brand-primary-tint px-lg py-md"
              style={({ pressed }) => ({
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
                borderColor: pressed ? brandColors.primary : brandColors.border,
              })}
            >
              <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-white">
                <BackArrowIcon size={16} color={brandColors.primary} />
              </View>
              <Typography
                variant="buttonSecondary"
                className="text-[14px] tracking-normal text-brand-primary"
              >
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
          disabled={!canPurchase || addingToCart || awaitingQuote}
          disabledReason={purchaseDisabledReason}
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
