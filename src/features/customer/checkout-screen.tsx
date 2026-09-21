import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import type { BottomSheetModal } from '@gorhom/bottom-sheet';

import {
  AddressBottomSheet,
  CheckoutBottomBar,
  CheckoutHeader,
  CheckoutOrderSummaryCard,
  CheckoutSkeleton,
  CheckoutValidationModal,
  IndustrialBanner,
  NetworkErrorModal,
  PaymentProtocolCard,
  PriceUpdatedModal,
  QuoteExpiredModal,
  ShippingCard,
} from '@/components/checkout';
import { Typography } from '@/components/ui/typography';
import { formatCheckoutPackaging } from '@/constants/checkout';
import { useDeliveryLocation } from '@/hooks/use-delivery-location';
import { ROUTES } from '@/navigation/routes';
import { fetchCustomerCart, mapBackendCartItems } from '@/services/cart';
import {
  checkoutErrorCode,
  checkoutErrorMessage,
  checkoutLatestQuote,
  createCheckoutQuote,
  fetchCheckoutAddresses,
  fetchCheckoutQuote,
  placePurchaseRequestFromQuote,
} from '@/services/checkout';
import { useCartStore } from '@/store/cart-store';
import { useOrderStore } from '@/store/order-store';
import type { CartPriceChange, CheckoutAddress, CheckoutQuote } from '@/types/checkout-quote';
import type { CheckoutProductLine, CheckoutShippingAddress } from '@/types/checkout';
import { commerceErrorCopy } from '@/utils/commerce-errors';

function mapAddress(row: CheckoutAddress): CheckoutShippingAddress {
  return {
    id: row.id,
    warehouseName: row.label,
    line1: row.line1,
    line2: row.line2 ?? row.city,
    state: row.state,
    pincode: row.postalCode,
    zoneLabel: row.landmark ?? `${row.city} delivery`,
    cityShort: row.city,
    freightAmount: 0,
    etaLabel: '',
  };
}

function uniqueQuoteIds(primary?: string, extra?: string): string[] {
  const ids = [primary, ...(extra ? extra.split(',') : [])].filter(
    (value): value is string => Boolean(value && value.trim()),
  );
  return [...new Set(ids)];
}

export const CustomerCheckoutScreen = memo(function CustomerCheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    quoteId?: string | string[];
    quoteIds?: string | string[];
  }>();
  const quoteId = typeof params.quoteId === 'string' ? params.quoteId : params.quoteId?.[0];
  const extraIds = typeof params.quoteIds === 'string' ? params.quoteIds : params.quoteIds?.[0];
  const addressSheetRef = useRef<BottomSheetModal>(null);
  const placingRef = useRef(false);
  const hydrateOrders = useOrderStore((state) => state.hydrateOrder);
  const { openAddressForm, refreshAddresses } = useDeliveryLocation();

  const [quotes, setQuotes] = useState<CheckoutQuote[]>([]);
  const [addresses, setAddresses] = useState<CheckoutShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [priceChanges, setPriceChanges] = useState<CartPriceChange[]>([]);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [validationIssue, setValidationIssue] = useState<{ title: string; message: string } | null>(
    null,
  );

  const quote = quotes[0] ?? null;

  const load = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setLoading(false);
      setError('No active quote. Return to the product or cart to get the latest price.');
      return;
    }
    setLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      const [loadedQuotes, nextAddresses] = await Promise.all([
        Promise.all(ids.map((id) => fetchCheckoutQuote(id))),
        fetchCheckoutAddresses(),
      ]);
      setQuotes(loadedQuotes);
      const mapped = nextAddresses.map(mapAddress);
      setAddresses(mapped);
      setSelectedAddressId(
        loadedQuotes[0]?.shippingAddressId ?? mapped.find((row) => row.id)?.id ?? null,
      );
      void refreshAddresses();
    } catch (cause) {
      const code = checkoutErrorCode(cause);
      setErrorCode(code);
      setError(checkoutErrorMessage(cause, 'Unable to load latest pricing'));
      if (code !== 'QUOTE_EXPIRED') {
        setQuotes([]);
      }
      if (code === 'QUOTE_EXPIRED') {
        setShowExpiredModal(true);
      } else if (code === 'NETWORK_ERROR') {
        setShowNetworkModal(true);
      }
    } finally {
      setLoading(false);
    }
  }, [refreshAddresses]);

  useEffect(() => {
    void load(uniqueQuoteIds(quoteId, extraIds));
  }, [extraIds, load, quoteId]);

  const shippingAddress = useMemo(
    () => addresses.find((row) => row.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const orderSummary = useMemo(() => {
    if (quotes.length === 0) {
      return null;
    }
    const sum = (pick: (entry: CheckoutQuote) => string) =>
      quotes.reduce((total, entry) => total + Number(entry ? pick(entry) : 0), 0);
    return {
      baseSubtotal: sum((entry) => entry.baseAmount),
      discount: sum((entry) => entry.discountAmount),
      freight: sum((entry) => entry.freightAmount),
      freightLabel: shippingAddress ? `Freight (${shippingAddress.cityShort})` : 'Freight',
      gst: sum((entry) => entry.taxAmount),
      gstLabel: `GST (${quotes[0].taxRate}%)`,
      platformFee: sum((entry) => entry.platformFee),
      insuranceIncluded: quotes.every((entry) => entry.insuranceIncluded),
      insuranceAmount: sum((entry) => entry.insuranceAmount),
      totalPayable: sum((entry) => entry.totalAmount),
      totalQuantityMt: sum((entry) => entry.quantity),
    };
  }, [quotes, shippingAddress]);

  const productLines = useMemo<CheckoutProductLine[]>(
    () =>
      quotes.map((entry) => ({
        id: entry.quoteId,
        title: entry.product.name,
        subtitle: entry.grade?.displayName ?? entry.grade?.name ?? entry.product.code,
        quantityMt: Number(entry.quantity),
        packaging: formatCheckoutPackaging(entry.product.packaging ?? 'Bulk', Number(entry.quantity)),
      })),
    [quotes],
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.CART as Href);
  }, [router]);

  const handleEditAddress = useCallback(() => {
    if (addresses.length === 0) {
      openAddressForm();
      return;
    }
    addressSheetRef.current?.present();
  }, [addresses.length, openAddressForm]);

  const handleSelectAddress = useCallback((addressId: string) => {
    setSelectedAddressId(addressId);
    addressSheetRef.current?.dismiss();
  }, []);

  const refreshPricing = useCallback(async () => {
    const source = quote;
    if (!source) {
      handleBack();
      return;
    }
    setRefreshing(true);
    try {
      const next = await createCheckoutQuote({
        productId: source.productId,
        offerId: source.offerId,
        quantity: Number(source.quantity),
        paymentOption: source.paymentOption,
        shippingAddressId: selectedAddressId ?? undefined,
      });
      setQuotes([next]);
      setShowExpiredModal(false);
      setError(null);
      setErrorCode(null);
      router.replace({
        pathname: ROUTES.CUSTOMER.CHECKOUT,
        params: { quoteId: next.quoteId, quoteIds: next.quoteId },
      } as unknown as Href);
    } catch (cause) {
      const code = checkoutErrorCode(cause);
      setErrorCode(code);
      setError(checkoutErrorMessage(cause, 'Unable to refresh pricing'));
      if (code === 'NETWORK_ERROR') {
        setShowNetworkModal(true);
      }
    } finally {
      setRefreshing(false);
    }
  }, [handleBack, quote, router, selectedAddressId]);

  const handlePlaceOrder = useCallback(async () => {
    if (quotes.length === 0 || placingRef.current) {
      return;
    }
    placingRef.current = true;
    setSubmitting(true);
    try {
      const results = [];
      for (const entry of quotes) {
        const pr = await placePurchaseRequestFromQuote({
          quoteId: entry.quoteId,
          shippingAddressId: selectedAddressId ?? undefined,
          idempotencyKey: entry.quoteId,
        });
        results.push({ pr, quote: entry });
      }
      const first = results[0];
      hydrateOrders();
      void fetchCustomerCart()
        .then((cart) => useCartStore.getState().replaceItems(mapBackendCartItems(cart)))
        .catch(() => undefined);
      router.replace({
        pathname: ROUTES.CUSTOMER.PURCHASE_REQUEST_SUCCESS,
        params: {
          prId: first.pr.id,
          referenceNumber: first.pr.referenceNumber,
          status: first.pr.status,
          paymentOption: first.quote.paymentLabel,
          quantity: first.quote.quantity,
          unit: first.quote.unit,
          amount: first.quote.totalAmount,
          productName: first.quote.product.name,
          deadline: first.pr.responseDeadline ?? '',
        },
      } as unknown as Href);
    } catch (cause) {
      const latest = checkoutLatestQuote(cause);
      const code = checkoutErrorCode(cause);
      if (latest) {
        const previous = quotes[0];
        setQuotes([latest, ...quotes.slice(1)]);
        if (previous && Number(previous.unitPrice) !== Number(latest.unitPrice)) {
          setPriceChanges([
            {
              cartItemId: latest.quoteId,
              productId: latest.productId,
              productName: latest.product.name,
              gradeName: latest.grade?.displayName ?? latest.grade?.name ?? null,
              oldUnitPrice: Number(previous.unitPrice),
              newUnitPrice: Number(latest.unitPrice),
              quantity: Number(latest.quantity),
              unit: latest.unit,
            },
          ]);
          setShowPriceModal(true);
        }
      } else if (code === 'QUOTE_EXPIRED') {
        setShowExpiredModal(true);
      } else if (code === 'NETWORK_ERROR') {
        setShowNetworkModal(true);
      } else {
        const copy = commerceErrorCopy(code, checkoutErrorMessage(cause, 'Please try again.'));
        setValidationIssue({ title: copy.title, message: copy.message });
      }
    } finally {
      placingRef.current = false;
      setSubmitting(false);
    }
  }, [hydrateOrders, quotes, router, selectedAddressId]);

  return (
    <View className="flex-1 bg-brand-background">
      <CheckoutHeader onBackPress={handleBack} />

      {loading ? (
        <CheckoutSkeleton />
      ) : error || !quote || !orderSummary ? (
        <View className="flex-1 items-center justify-center px-lg">
          <Typography variant="roleTitle" className="text-center text-[16px] text-brand-heading">
            Unable to load latest pricing
          </Typography>
          <Typography variant="roleDescription" className="mt-sm text-center text-[13px] text-brand-body">
            {error ?? 'Return to cart or product details and generate a new quote.'}
          </Typography>
          <Pressable
            onPress={() => {
              void load(uniqueQuoteIds(quoteId, extraIds));
            }}
            className="mt-lg rounded-xl bg-brand-heading px-lg py-md"
            accessibilityRole="button"
          >
            <Typography variant="roleTitle" className="text-brand-white">
              Retry
            </Typography>
          </Pressable>
        </View>
      ) : (
        <View className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 24, gap: 16 }}
            className="flex-1"
          >
            {shippingAddress ? (
              <ShippingCard address={shippingAddress} onEditPress={handleEditAddress} />
            ) : (
              <View className="mx-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
                <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
                  Shipping address
                </Typography>
                <Typography variant="roleDescription" className="mt-xs text-[13px] text-brand-body">
                  No saved address yet. Freight uses the platform estimate until a destination is added.
                </Typography>
                <Pressable
                  onPress={() => openAddressForm()}
                  className="mt-md self-start rounded-lg bg-brand-heading px-md py-sm"
                  accessibilityRole="button"
                >
                  <Typography variant="roleTitle" className="text-[13px] text-brand-white">
                    Add delivery address
                  </Typography>
                </Pressable>
              </View>
            )}
            <CheckoutOrderSummaryCard products={productLines} summary={orderSummary} />
            <PaymentProtocolCard />
            <IndustrialBanner />
          </ScrollView>

          <CheckoutBottomBar
            enabled={!submitting}
            loading={submitting}
            onPlaceOrder={() => {
              void handlePlaceOrder();
            }}
          />
        </View>
      )}

      <AddressBottomSheet
        ref={addressSheetRef}
        selectedId={selectedAddressId ?? ''}
        addresses={addresses}
        onSelect={handleSelectAddress}
        onAddAddress={() => {
          addressSheetRef.current?.dismiss();
          openAddressForm();
        }}
      />
      <PriceUpdatedModal
        visible={showPriceModal}
        changes={priceChanges}
        onClose={() => setShowPriceModal(false)}
        onReview={() => setShowPriceModal(false)}
      />
      <QuoteExpiredModal
        visible={showExpiredModal}
        refreshing={refreshing}
        onClose={() => setShowExpiredModal(false)}
        onRefresh={() => {
          void refreshPricing();
        }}
      />
      <NetworkErrorModal
        visible={showNetworkModal}
        retrying={loading || refreshing}
        onClose={() => setShowNetworkModal(false)}
        onRetry={() => {
          setShowNetworkModal(false);
          void load(uniqueQuoteIds(quoteId, extraIds));
        }}
      />
      <CheckoutValidationModal
        visible={Boolean(validationIssue)}
        title={validationIssue?.title ?? 'Unable to continue'}
        message={validationIssue?.message ?? 'Please try again.'}
        confirmLabel="OK"
        onClose={() => setValidationIssue(null)}
        onConfirm={() => setValidationIssue(null)}
      />
    </View>
  );
});
