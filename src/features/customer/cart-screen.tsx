import { memo, useCallback, useEffect, useState } from 'react';

import { ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import {
  CartHeader,
  CartItemCard,
  CartSkeleton,
  CheckoutBar,
  DeliveryCard,
  EmptyCart,
  OrderSummaryCard,
  TrustFeatures,
} from '@/components/cart';
import { CART_SKELETON_MS, DEFAULT_CART_DELIVERY } from '@/constants/cart';
import { ROUTES } from '@/navigation/routes';
import {
  selectCartDelivery,
  selectCartHydrated,
  selectCartItems,
  selectOrderSummary,
  useCartStore,
} from '@/store/cart-store';
import { showAppDialog } from '@/store/dialog-store';

export const CustomerCartScreen = memo(function CustomerCartScreen() {
  const router = useRouter();
  const items = useCartStore(selectCartItems);
  const delivery = useCartStore(selectCartDelivery);
  const isHydrated = useCartStore(selectCartHydrated);
  const summary = useCartStore(selectOrderSummary);
  const hydrateCart = useCartStore((state) => state.hydrateCart);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const setDelivery = useCartStore((state) => state.setDelivery);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) {
      hydrateCart();
    }
  }, [hydrateCart, isHydrated]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, CART_SKELETON_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.MARKET as Href);
  }, [router]);

  const handleChangeDelivery = useCallback(() => {
    showAppDialog({
      variant: 'info',
      title: 'Delivery location',
      message: 'Choose the city where this order should be delivered.',
      cancelLabel: 'Cancel',
      choices: [
        {
          id: 'mumbai',
          label: 'Mumbai, Maharashtra',
          description: 'ETA 2–3 business days',
          onPress: () =>
            setDelivery({
              ...DEFAULT_CART_DELIVERY,
              city: 'Mumbai',
              state: 'Maharashtra',
              label: 'Mumbai, Maharashtra',
              etaLabel: '2–3 Business Days',
            }),
        },
        {
          id: 'pune',
          label: 'Pune, Maharashtra',
          description: 'ETA 3–4 business days',
          onPress: () =>
            setDelivery({
              city: 'Pune',
              state: 'Maharashtra',
              label: 'Pune, Maharashtra',
              etaLabel: '3–4 Business Days',
            }),
        },
        {
          id: 'ahmedabad',
          label: 'Ahmedabad, Gujarat',
          description: 'ETA 2–3 business days',
          onPress: () =>
            setDelivery({
              city: 'Ahmedabad',
              state: 'Gujarat',
              label: 'Ahmedabad, Gujarat',
              etaLabel: '2–3 Business Days',
            }),
        },
      ],
    });
  }, [setDelivery]);

  const handleBrowseMarketplace = useCallback(() => {
    router.replace(ROUTES.CUSTOMER.MARKET as Href);
  }, [router]);

  const handleCheckout = useCallback(() => {
    if (!summary.meetsMoq) {
      return;
    }
    router.push(ROUTES.CUSTOMER.CHECKOUT as Href);
  }, [router, summary.meetsMoq]);

  const isEmpty = items.length === 0;

  return (
    <View className="flex-1 bg-brand-background">
      <CartHeader onBackPress={handleBack} />

      {isLoading || !isHydrated ? (
        <CartSkeleton />
      ) : isEmpty ? (
        <EmptyCart onBrowsePress={handleBrowseMarketplace} />
      ) : (
        <View className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 24, gap: 16 }}
            className="flex-1"
          >
            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onRemove={removeItem}
              />
            ))}

            <DeliveryCard delivery={delivery} onChangePress={handleChangeDelivery} />
            <OrderSummaryCard summary={summary} />
            <TrustFeatures />
          </ScrollView>

          <CheckoutBar
            totalPayable={summary.totalLandedCost}
            enabled={summary.meetsMoq}
            onCheckout={handleCheckout}
          />
        </View>
      )}
    </View>
  );
});
