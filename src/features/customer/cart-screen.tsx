import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';

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
import {
  CheckoutValidationModal,
  NetworkErrorModal,
  PriceUpdatedModal,
} from '@/components/checkout';
import { Typography } from '@/components/ui/typography';
import { LocationBottomSheet } from '@/components/home';
import { useCartQuote } from '@/hooks/use-cart-quote';
import { useDeliveryLocation } from '@/hooks/use-delivery-location';
import { ROUTES } from '@/navigation/routes';
import {
  fetchCustomerCart,
  mapBackendCartItems,
  removeCustomerCartItem,
  updateCustomerCartItem,
} from '@/services/cart';
import { checkoutErrorMessage } from '@/services/checkout';
import {
  selectCartDelivery,
  selectCartHydrated,
  selectCartItems,
  useCartStore,
} from '@/store/cart-store';
import type { CartPriceChange, CartQuoteResult } from '@/types/checkout-quote';
import { commerceErrorCopy } from '@/utils/commerce-errors';
import { moneyNumber } from '@/utils/money';

export const CustomerCartScreen = memo(function CustomerCartScreen() {
  const router = useRouter();
  const items = useCartStore(selectCartItems);
  const delivery = useCartStore(selectCartDelivery);
  const isHydrated = useCartStore(selectCartHydrated);
  const hydrateCart = useCartStore((state) => state.hydrateCart);
  const replaceItems = useCartStore((state) => state.replaceItems);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const locationSheetRef = useRef<BottomSheetModal>(null);
  const { selectedLocation, shippingAddressId, openAddressForm } = useDeliveryLocation();

  const [backendReady, setBackendReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [priceChanges, setPriceChanges] = useState<CartPriceChange[]>([]);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [validationIssue, setValidationIssue] = useState<{ title: string; message: string } | null>(
    null,
  );
  const checkoutLock = useRef(false);
  const pendingQuote = useRef<CartQuoteResult | null>(null);

  const {
    quotes,
    summary,
    loading: quoting,
    error,
    changes,
    status,
    refresh,
  } = useCartQuote({
    items,
    enabled: isHydrated && backendReady && items.length > 0 && !syncing,
    shippingAddressId,
  });

  const loadBackendCart = useCallback(async () => {
    setSyncing(true);
    try {
      const cart = await fetchCustomerCart();
      replaceItems(mapBackendCartItems(cart));
    } catch (cause) {
      if (useCartStore.getState().items.length === 0) {
        setShowNetworkModal(true);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Unable to refresh cart',
          text2: checkoutErrorMessage(cause, 'Showing saved cart. Pricing will update when online.'),
        });
      }
    } finally {
      setBackendReady(true);
      setSyncing(false);
    }
  }, [replaceItems]);

  useEffect(() => {
    if (!isHydrated) {
      hydrateCart();
    }
  }, [hydrateCart, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    void loadBackendCart();
  }, [isHydrated, loadBackendCart]);

  useEffect(() => {
    if (!quotes.length) {
      return;
    }
    const current = useCartStore.getState().items;
    let changed = false;
    const next = current.map((item) => {
      const quote = quotes.find(
        (entry) => entry.offerId === item.offerId || entry.productId === item.productId,
      );
      if (!quote) {
        return item;
      }
      const livePrice = moneyNumber(quote.unitPrice);
      if (livePrice == null || livePrice === item.unitPricePerMt) {
        return item;
      }
      changed = true;
      return { ...item, unitPricePerMt: livePrice };
    });
    if (changed) {
      replaceItems(next);
    }
  }, [quotes, replaceItems]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.MARKET as Href);
  }, [router]);

  const handleChangeDelivery = useCallback(() => {
    locationSheetRef.current?.present();
  }, []);

  const handleBrowseMarketplace = useCallback(() => {
    router.replace(ROUTES.CUSTOMER.MARKET as Href);
  }, [router]);

  const persistQuantity = useCallback(
    async (itemId: string) => {
      setSyncing(true);
      const item = useCartStore.getState().items.find((entry) => entry.id === itemId);
      if (!item?.backendItemId || item.quantityMt < item.moq) {
        setSyncing(false);
        return;
      }
      try {
        const cart = await updateCustomerCartItem(item.backendItemId, {
          quantity: item.quantityMt,
        });
        replaceItems(mapBackendCartItems(cart));
      } catch (cause) {
        Toast.show({
          type: 'error',
          text1: 'Unable to update quantity',
          text2: checkoutErrorMessage(cause, 'Please try again.'),
        });
        void loadBackendCart();
      } finally {
        setSyncing(false);
      }
    },
    [loadBackendCart, replaceItems],
  );

  const handleIncrease = useCallback(
    (itemId: string) => {
      increaseQuantity(itemId);
      void persistQuantity(itemId);
    },
    [increaseQuantity, persistQuantity],
  );

  const handleDecrease = useCallback(
    (itemId: string) => {
      decreaseQuantity(itemId);
      void persistQuantity(itemId);
    },
    [decreaseQuantity, persistQuantity],
  );

  const handleRemove = useCallback(
    async (itemId: string) => {
      const item = useCartStore.getState().items.find((entry) => entry.id === itemId);
      removeItem(itemId);
      if (!item?.backendItemId) {
        return;
      }
      try {
        const cart = await removeCustomerCartItem(item.backendItemId);
        replaceItems(mapBackendCartItems(cart));
      } catch (cause) {
        Toast.show({
          type: 'error',
          text1: 'Unable to remove item',
          text2: checkoutErrorMessage(cause, 'Please try again.'),
        });
        void loadBackendCart();
      }
    },
    [loadBackendCart, removeItem, replaceItems],
  );

  const goToCheckout = useCallback(
    (next: CartQuoteResult) => {
      const quoteIds = next.quotes.map((quote) => quote.quoteId);
      const quoteId = quoteIds[0];
      if (!quoteId) {
        return;
      }
      router.push({
        pathname: ROUTES.CUSTOMER.CHECKOUT,
        params: { quoteId, quoteIds: quoteIds.join(',') },
      } as unknown as Href);
    },
    [router],
  );

  const handleCheckout = useCallback(async () => {
    if (checkoutLock.current || !summary.meetsMoq) {
      return;
    }
    checkoutLock.current = true;
    setCheckingOut(true);
    try {
      const next = await refresh();
      if (!next) {
        setShowNetworkModal(true);
        return;
      }
      if (next.status === 'INVALID' || !next.valid || next.quotes.length === 0) {
        const issue = next.issues[0];
        const copy = commerceErrorCopy(issue?.code, issue?.message);
        setValidationIssue({ title: copy.title, message: copy.message });
        return;
      }
      if (next.status === 'PRICE_CHANGED' && next.changes.length > 0) {
        pendingQuote.current = next;
        setPriceChanges(next.changes);
        setShowPriceModal(true);
        return;
      }
      goToCheckout(next);
    } finally {
      checkoutLock.current = false;
      setCheckingOut(false);
    }
  }, [goToCheckout, refresh, summary.meetsMoq]);

  const lineAmountByProduct = useMemo(() => {
    const map = new Map<string, number>();
    quotes.forEach((quote) => {
      const amount = moneyNumber(quote.baseAmount);
      if (amount != null) {
        map.set(quote.productId, amount);
        map.set(quote.offerId, amount);
      }
    });
    return map;
  }, [quotes]);

  const isEmpty = items.length === 0;
  const pricingReady = summary.fromQuote && summary.totalLandedCost != null;
  const showPricingBanner = status === 'PRICE_CHANGED' && changes.length > 0 && !showPriceModal;

  return (
    <View className="flex-1 bg-brand-background">
      <CartHeader onBackPress={handleBack} />

      {!isHydrated || (syncing && !backendReady && isEmpty) ? (
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
            {showPricingBanner ? (
              <Pressable
                onPress={() => {
                  setPriceChanges(changes);
                  setShowPriceModal(true);
                }}
                className="mx-lg rounded-2xl border border-amber-200 bg-amber-50 px-md py-md"
                accessibilityRole="button"
                accessibilityLabel="Review updated pricing"
              >
                <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                  Pricing updated
                </Typography>
                <Typography variant="roleDescription" className="mt-xs text-[12px] text-brand-body">
                  Latest market price is available. Review changes before checkout.
                </Typography>
              </Pressable>
            ) : null}

            {error && !pricingReady ? (
              <View className="mx-lg rounded-2xl border border-brand-error/20 bg-brand-error-light px-md py-md">
                <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                  Unable to load current pricing
                </Typography>
                <Typography variant="roleDescription" className="mt-xs text-[12px] text-brand-body">
                  {error}
                </Typography>
                <Pressable
                  onPress={() => {
                    void refresh();
                  }}
                  className="mt-sm self-start"
                  accessibilityRole="button"
                  accessibilityLabel="Retry pricing"
                >
                  <Typography variant="link" className="text-[13px] text-brand-primary">
                    Retry
                  </Typography>
                </Pressable>
              </View>
            ) : null}

            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                lineBaseAmount={
                  lineAmountByProduct.get(item.offerId ?? '') ??
                  lineAmountByProduct.get(item.productId) ??
                  null
                }
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={(id) => {
                  void handleRemove(id);
                }}
              />
            ))}

            <DeliveryCard
              delivery={{
                city: selectedLocation.city,
                state: selectedLocation.state,
                label: selectedLocation.label,
                etaLabel: delivery.etaLabel,
              }}
              onChangePress={handleChangeDelivery}
            />
            <OrderSummaryCard summary={summary} loading={quoting && !pricingReady} />
            <TrustFeatures />
          </ScrollView>

          <CheckoutBar
            totalPayable={summary.totalLandedCost}
            enabled={summary.meetsMoq && pricingReady && !Boolean(error && !pricingReady)}
            loading={checkingOut || (quoting && !pricingReady)}
            loadingLabel={checkingOut ? 'Checking latest pricing...' : 'Checking...'}
            onCheckout={() => {
              void handleCheckout();
            }}
          />
        </View>
      )}

      <PriceUpdatedModal
        visible={showPriceModal}
        changes={priceChanges}
        onClose={() => setShowPriceModal(false)}
        onReview={() => setShowPriceModal(false)}
        onContinue={
          pendingQuote.current
            ? () => {
                const next = pendingQuote.current;
                setShowPriceModal(false);
                if (next) {
                  goToCheckout(next);
                }
              }
            : undefined
        }
      />
      <NetworkErrorModal
        visible={showNetworkModal}
        onClose={() => setShowNetworkModal(false)}
        retrying={syncing || quoting}
        onRetry={() => {
          setShowNetworkModal(false);
          void loadBackendCart();
          void refresh();
        }}
      />
      <CheckoutValidationModal
        visible={Boolean(validationIssue)}
        title={validationIssue?.title ?? 'Unable to continue'}
        message={validationIssue?.message ?? 'Please review your cart and try again.'}
        onClose={() => setValidationIssue(null)}
        onConfirm={() => setValidationIssue(null)}
      />
      <LocationBottomSheet
        ref={locationSheetRef}
        selectedId={selectedLocation.id}
        onAddAddress={openAddressForm}
      />
    </View>
  );
});
