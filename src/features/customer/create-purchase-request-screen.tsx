import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductCard, SearchBar } from '@/components/market';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Typography } from '@/components/ui/typography';
import { useMarketSearch } from '@/hooks/use-market-search';
import { useMarketplaceCatalogQuery } from '@/hooks/use-marketplace-catalog';
import { BackArrowIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { fetchCustomerCart, mapBackendCartItems } from '@/services/cart';
import {
  selectCartHydrated,
  selectCartItems,
  useCartStore,
} from '@/store/cart-store';
import { brandColors } from '@/theme/colors';
import { elevation } from '@/theme/shadows';
import type { MarketProduct } from '@/types/market';

/**
 * B-02 entry for Home “Create Purchase Request”.
 * - Cart with items → continue into cart → checkout (same backend PR path as web).
 * - Empty cart → select a marketplace product (RFQ), never the raw Grade Master list.
 */
export const CreatePurchaseRequestScreen = memo(function CreatePurchaseRequestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items = useCartStore(selectCartItems);
  const isHydrated = useCartStore(selectCartHydrated);
  const hydrateCart = useCartStore((state) => state.hydrateCart);
  const replaceItems = useCartStore((state) => state.replaceItems);
  const [syncingCart, setSyncingCart] = useState(true);

  const { products, loading, error, refetch } = useMarketplaceCatalogQuery();
  const { query, filteredProducts, handleQueryChange, handleClear, handleSubmit, handleFocus, handleBlur } =
    useMarketSearch(products);

  useEffect(() => {
    if (!isHydrated) {
      hydrateCart();
    }
  }, [hydrateCart, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    let cancelled = false;
    (async () => {
      setSyncingCart(true);
      try {
        const cart = await fetchCustomerCart();
        if (!cancelled) {
          replaceItems(mapBackendCartItems(cart));
        }
      } catch {
        // Keep local cart; user can still pick a product.
      } finally {
        if (!cancelled) setSyncingCart(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isHydrated, replaceItems]);

  const hasCartItems = items.length > 0;

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.HOME as Href);
  }, [router]);

  const openProductForRequest = useCallback(
    (product: MarketProduct) => {
      router.push({
        pathname: ROUTES.CUSTOMER.PRODUCT_DETAILS,
        params: { id: product.id, rfq: '1' },
      } as unknown as Href);
    },
    [router],
  );

  const continueWithCart = useCallback(() => {
    router.push(ROUTES.CUSTOMER.CART as Href);
  }, [router]);

  const visibleProducts = useMemo(
    () => filteredProducts.filter((product) => product.stock > 0),
    [filteredProducts],
  );

  return (
    <View className="flex-1 bg-brand-background">
      <View
        className="border-b border-brand-border bg-brand-white px-lg"
        style={{ paddingTop: insets.top }}
      >
        <View className="h-14 flex-row items-center">
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            className="mr-sm h-10 w-10 items-center justify-center"
          >
            <BackArrowIcon color={brandColors.primary} />
          </Pressable>
          <View className="flex-1 pr-sm">
            <Typography variant="roleTitle" className="text-[17px] text-brand-heading">
              Create Purchase Request
            </Typography>
          </View>
        </View>
      </View>

      {syncingCart && !isHydrated ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={brandColors.primary} />
        </View>
      ) : (
        <View className="flex-1 px-lg pt-lg">
          {hasCartItems ? (
            <View
              className="mb-lg rounded-2xl border border-brand-border bg-brand-white p-lg"
              style={elevation.sm}
            >
              <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
                Continue with your cart
              </Typography>
              <Typography variant="subheadingLeft" className="mt-sm">
                You have {items.length} item{items.length === 1 ? '' : 's'} ready. Review quantity,
                delivery address and pricing, then place the purchase request at checkout.
              </Typography>
              <View className="mt-md gap-sm">
                {items.slice(0, 3).map((item) => (
                  <View
                    key={item.id}
                    className="flex-row items-center justify-between rounded-xl bg-brand-surface px-md py-sm"
                  >
                    <Typography
                      variant="body"
                      className="mr-md flex-1 text-[13px] text-brand-heading"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Typography>
                    <Typography variant="badge" className="text-[11px] text-brand-primary-dark">
                      {item.quantityMt} MT
                    </Typography>
                  </View>
                ))}
                {items.length > 3 ? (
                  <Typography variant="legal" className="text-left text-brand-muted">
                    +{items.length - 3} more in cart
                  </Typography>
                ) : null}
              </View>
              <PrimaryButton
                label="Review cart & checkout"
                className="mt-lg"
                showArrow
                onPress={continueWithCart}
              />
            </View>
          ) : (
            <View
              className="mb-lg rounded-2xl border border-brand-primary/20 bg-brand-primary-light/40 p-md"
              style={elevation.sm}
            >
              <Typography variant="badge" className="text-[10px] text-brand-badge-text">
                HOW IT WORKS
              </Typography>
              <Typography variant="subheadingLeft" className="mt-sm text-[13px]">
                1. Choose a marketplace grade{'\n'}
                2. Set quantity (respecting MOQ) and delivery address{'\n'}
                3. Review backend pricing and tap Verify & Place Purchase Request
              </Typography>
            </View>
          )}

          <Typography variant="headingLeft" className="mb-sm text-[16px]">
            {hasCartItems ? 'Add another grade' : 'Select a grade'}
          </Typography>

          <ProductPicker
            query={query}
            loading={loading}
            error={error}
            products={visibleProducts}
            onQueryChange={handleQueryChange}
            onClear={handleClear}
            onSubmit={handleSubmit}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onRetry={() => void refetch()}
            onSelect={openProductForRequest}
            bottomInset={insets.bottom}
          />
        </View>
      )}
    </View>
  );
});

type ProductPickerProps = {
  query: string;
  loading: boolean;
  error: string | null;
  products: MarketProduct[];
  onQueryChange: (value: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onRetry: () => void;
  onSelect: (product: MarketProduct) => void;
  bottomInset: number;
};

function ProductPicker({
  query,
  loading,
  error,
  products,
  onQueryChange,
  onClear,
  onSubmit,
  onFocus,
  onBlur,
  onRetry,
  onSelect,
  bottomInset,
}: ProductPickerProps) {
  return (
    <View className="flex-1">
      <SearchBar
        value={query}
        onChangeText={onQueryChange}
        onClear={onClear}
        onSubmit={onSubmit}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="Search grades to request…"
      />

      {loading && products.length === 0 ? (
        <View className="flex-1 items-center justify-center py-2xl">
          <ActivityIndicator color={brandColors.primary} />
          <Typography variant="legal" className="mt-md">
            Loading marketplace grades…
          </Typography>
        </View>
      ) : error && products.length === 0 ? (
        <View className="mt-lg rounded-2xl border border-brand-error/20 bg-brand-error-light p-lg">
          <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
            Unable to load products
          </Typography>
          <Typography variant="subheadingLeft" className="mt-sm">
            {error}
          </Typography>
          <PrimaryButton label="Retry" className="mt-md" onPress={onRetry} />
        </View>
      ) : (
        <FlatList
          className="mt-md flex-1"
          data={products}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: bottomInset + 32, gap: 12 }}
          ListEmptyComponent={
            <View className="rounded-2xl border border-brand-border bg-brand-white p-lg">
              <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
                No matching grades
              </Typography>
              <Typography variant="subheadingLeft" className="mt-sm">
                Try another search. Only in-stock marketplace grades can start a purchase request.
              </Typography>
            </View>
          }
          renderItem={({ item, index }) => (
            <ProductCard product={item} index={index} onBookNow={onSelect} />
          )}
        />
      )}
    </View>
  );
}
