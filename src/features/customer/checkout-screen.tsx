import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';

import {
  AddressBottomSheet,
  CheckoutBottomBar,
  CheckoutHeader,
  CheckoutOrderSummaryCard,
  IndustrialBanner,
  PaymentProtocolCard,
  ShippingCard,
} from '@/components/checkout';
import { Typography } from '@/components/ui/typography';
import { formatCheckoutPackaging } from '@/constants/checkout';
import { ROUTES } from '@/navigation/routes';
import {
  checkoutErrorMessage,
  checkoutLatestQuote,
  fetchCheckoutAddresses,
  fetchCheckoutQuote,
  placePurchaseRequestFromQuote,
} from '@/services/checkout';
import { useOrderStore } from '@/store/order-store';
import type { CheckoutAddress, CheckoutQuote } from '@/types/checkout-quote';
import type { CheckoutProductLine, CheckoutShippingAddress } from '@/types/checkout';

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

export const CustomerCheckoutScreen = memo(function CustomerCheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ quoteId?: string | string[] }>();
  const quoteId = typeof params.quoteId === 'string' ? params.quoteId : params.quoteId?.[0];
  const addressSheetRef = useRef<BottomSheetModal>(null);
  const placingRef = useRef(false);
  const hydrateOrders = useOrderStore((state) => state.hydrateOrder);

  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [addresses, setAddresses] = useState<CheckoutShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [priceChanged, setPriceChanged] = useState(false);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const [nextQuote, nextAddresses] = await Promise.all([
        fetchCheckoutQuote(id),
        fetchCheckoutAddresses(),
      ]);
      setQuote(nextQuote);
      const mapped = nextAddresses.map(mapAddress);
      setAddresses(mapped);
      setSelectedAddressId(
        nextQuote.shippingAddressId ?? mapped.find((row) => row.id)?.id ?? null,
      );
    } catch (cause) {
      setQuote(null);
      setError(checkoutErrorMessage(cause, 'Unable to load latest pricing'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!quoteId) {
      setLoading(false);
      setError('No active quote. Return to product details to get the latest price.');
      return;
    }
    void load(quoteId);
  }, [load, quoteId]);

  const shippingAddress = useMemo(
    () => addresses.find((row) => row.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const orderSummary = useMemo(() => {
    if (!quote) {
      return null;
    }
    return {
      baseSubtotal: Number(quote.baseAmount),
      discount: Number(quote.discountAmount),
      freight: Number(quote.freightAmount),
      freightLabel: shippingAddress ? `Freight (${shippingAddress.cityShort})` : 'Freight',
      gst: Number(quote.taxAmount),
      gstLabel: `GST (${quote.taxRate}%)`,
      platformFee: Number(quote.platformFee),
      insuranceIncluded: quote.insuranceIncluded,
      insuranceAmount: Number(quote.insuranceAmount),
      totalPayable: Number(quote.totalAmount),
      totalQuantityMt: Number(quote.quantity),
    };
  }, [quote, shippingAddress]);

  const productLines = useMemo<CheckoutProductLine[]>(() => {
    if (!quote) {
      return [];
    }
    return [
      {
        id: quote.productId,
        title: quote.product.name,
        subtitle: quote.grade?.displayName ?? quote.grade?.name ?? quote.product.code,
        quantityMt: Number(quote.quantity),
        packaging: formatCheckoutPackaging(quote.product.packaging ?? 'Bulk', Number(quote.quantity)),
      },
    ];
  }, [quote]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.MARKET as Href);
  }, [router]);

  const handleEditAddress = useCallback(() => {
    if (addresses.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'No saved addresses',
        text2: 'Add a shipping address in profile to apply destination-specific freight.',
      });
      return;
    }
    addressSheetRef.current?.present();
  }, [addresses.length]);

  const handleSelectAddress = useCallback((addressId: string) => {
    setSelectedAddressId(addressId);
    addressSheetRef.current?.dismiss();
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    if (!quote || placingRef.current) {
      return;
    }
    placingRef.current = true;
    setSubmitting(true);
    setPriceChanged(false);
    try {
      const pr = await placePurchaseRequestFromQuote({
        quoteId: quote.quoteId,
        shippingAddressId: selectedAddressId ?? undefined,
        idempotencyKey: quote.quoteId,
      });
      hydrateOrders();
      router.replace({
        pathname: ROUTES.CUSTOMER.PURCHASE_REQUEST_SUCCESS,
        params: {
          prId: pr.id,
          referenceNumber: pr.referenceNumber,
          status: pr.status,
          paymentOption: quote.paymentLabel,
          quantity: quote.quantity,
          unit: quote.unit,
          amount: quote.totalAmount,
          productName: quote.product.name,
          deadline: pr.responseDeadline ?? '',
        },
      } as unknown as Href);
    } catch (cause) {
      const latest = checkoutLatestQuote(cause);
      if (latest) {
        setQuote(latest);
        setPriceChanged(true);
        Toast.show({
          type: 'info',
          text1: 'Price Updated',
          text2: 'Availability or pricing has changed. Please review the latest quote.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Unable to place purchase request',
          text2: checkoutErrorMessage(cause, 'Please try again.'),
        });
      }
    } finally {
      placingRef.current = false;
      setSubmitting(false);
    }
  }, [hydrateOrders, quote, router, selectedAddressId]);

  return (
    <View className="flex-1 bg-brand-background">
      <CheckoutHeader onBackPress={handleBack} />

      {loading ? (
        <View className="flex-1 items-center justify-center px-lg">
          <Typography variant="roleTitle" className="text-center text-[16px] text-brand-heading">
            Loading latest price...
          </Typography>
        </View>
      ) : error || !quote || !orderSummary ? (
        <View className="flex-1 items-center justify-center px-lg">
          <Typography variant="roleTitle" className="text-center text-[16px] text-brand-heading">
            Unable to load latest pricing
          </Typography>
          <Typography variant="roleDescription" className="mt-sm text-center text-[13px] text-brand-body">
            {error ?? 'Return to product details and generate a new quote.'}
          </Typography>
          <Pressable
            onPress={handleBack}
            className="mt-lg rounded-xl bg-brand-primary px-lg py-md"
            accessibilityRole="button"
          >
            <Typography variant="roleTitle" className="text-brand-white">
              Back to Product
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
            {priceChanged ? (
              <View className="mx-lg rounded-xl border border-amber-200 bg-amber-50 px-md py-md">
                <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                  Price Updated
                </Typography>
                <Typography variant="roleDescription" className="mt-xs text-[12px] text-brand-body">
                  Availability or pricing has changed. Please review the latest quote.
                </Typography>
              </View>
            ) : null}
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
      />
    </View>
  );
});
