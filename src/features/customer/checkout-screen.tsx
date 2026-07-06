import { memo, useCallback, useEffect, useMemo, useRef } from 'react';

import { ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import type { BottomSheetModal } from '@gorhom/bottom-sheet';

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
import {
  formatCheckoutPackaging,
  formatCheckoutProductSubtitle,
  formatCheckoutProductTitle,
} from '@/constants/checkout';
import { ROUTES } from '@/navigation/routes';
import { selectCartHydrated, selectCartItems, useCartStore } from '@/store/cart-store';
import {
  selectCheckoutAddress,
  selectCheckoutAddressId,
  selectCheckoutHydrated,
  useCheckoutStore,
} from '@/store/checkout-store';
import { usePaymentStore } from '@/store/payment-store';
import type { CheckoutProductLine } from '@/types/checkout';

export const CustomerCheckoutScreen = memo(function CustomerCheckoutScreen() {
  const router = useRouter();
  const addressSheetRef = useRef<BottomSheetModal>(null);

  const cartItems = useCartStore(selectCartItems);
  const isCartHydrated = useCartStore(selectCartHydrated);
  const hydrateCart = useCartStore((state) => state.hydrateCart);

  const selectedAddressId = useCheckoutStore(selectCheckoutAddressId);
  const shippingAddress = useCheckoutStore(selectCheckoutAddress);
  const isCheckoutHydrated = useCheckoutStore(selectCheckoutHydrated);
  const hydrateCheckout = useCheckoutStore((state) => state.hydrateCheckout);
  const changeAddress = useCheckoutStore((state) => state.changeAddress);
  const getOrderSummary = useCheckoutStore((state) => state.getOrderSummary);

  const orderSummary = useMemo(
    () => getOrderSummary(cartItems),
    [cartItems, getOrderSummary, selectedAddressId],
  );
  const setBaseAmount = usePaymentStore((state) => state.setBaseAmount);

  useEffect(() => {
    if (!isCartHydrated) {
      hydrateCart();
    }
  }, [hydrateCart, isCartHydrated]);

  useEffect(() => {
    if (!isCheckoutHydrated) {
      hydrateCheckout();
    }
  }, [hydrateCheckout, isCheckoutHydrated]);

  useEffect(() => {
    if (orderSummary.totalPayable > 0) {
      setBaseAmount(orderSummary.totalPayable);
    }
  }, [orderSummary.totalPayable, setBaseAmount]);

  const productLines = useMemo<CheckoutProductLine[]>(
    () =>
      cartItems.map((item) => ({
        id: item.id,
        title: formatCheckoutProductTitle(item.productType, item.grade),
        subtitle: formatCheckoutProductSubtitle(item.name),
        quantityMt: item.quantityMt,
        packaging: formatCheckoutPackaging(item.packaging, item.quantityMt),
      })),
    [cartItems],
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.CART as Href);
  }, [router]);

  const handleEditAddress = useCallback(() => {
    addressSheetRef.current?.present();
  }, []);

  const handleSelectAddress = useCallback(
    (addressId: string) => {
      changeAddress(addressId);
      addressSheetRef.current?.dismiss();
    },
    [changeAddress],
  );

  const handlePlaceOrder = useCallback(() => {
    if (cartItems.length === 0) {
      return;
    }
    setBaseAmount(orderSummary.totalPayable);
    router.push(ROUTES.CUSTOMER.PAYMENT as Href);
  }, [cartItems.length, orderSummary.totalPayable, router, setBaseAmount]);

  const isReady = isCartHydrated && isCheckoutHydrated;
  const hasItems = cartItems.length > 0;

  return (
    <View className="flex-1 bg-brand-background">
      <CheckoutHeader onBackPress={handleBack} />

      {isReady ? (
        <View className="flex-1">
          {hasItems ? (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 24, gap: 16 }}
                className="flex-1"
              >
                <ShippingCard address={shippingAddress} onEditPress={handleEditAddress} />
                <CheckoutOrderSummaryCard products={productLines} summary={orderSummary} />
                <PaymentProtocolCard />
                <IndustrialBanner />
              </ScrollView>

              <CheckoutBottomBar enabled={hasItems} onPlaceOrder={handlePlaceOrder} />
            </>
          ) : (
            <View className="flex-1 items-center justify-center px-lg">
              <Typography variant="roleTitle" className="text-center text-[16px] text-brand-heading">
                Your cart is empty
              </Typography>
              <Typography
                variant="roleDescription"
                className="mt-sm text-center text-[13px] text-brand-body"
              >
                Add materials from the marketplace to review your order.
              </Typography>
            </View>
          )}
        </View>
      ) : null}

      <AddressBottomSheet
        ref={addressSheetRef}
        selectedId={selectedAddressId}
        onSelect={handleSelectAddress}
      />
    </View>
  );
});
