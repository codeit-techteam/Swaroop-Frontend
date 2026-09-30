import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ScrollView, Text, View } from 'react-native';

import { type Href, useFocusEffect, useRouter } from 'expo-router';

import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import Toast from 'react-native-toast-message';

import {
  HeroCarousel,
  HomeHeader,
  LocationBottomSheet,
  LocationSelector,
  LowestCostCard,
  QuickSummaryCard,
  SearchBar,
  SectionHeader,
  WatchlistCard,
  TrendingMaterialCard,
} from '@/components/home';
import { CurrentShipmentCard } from '@/components/home/current-shipment-card';
import { KycStatusBanner } from '@/components/kyc/kyc-status-banner';
import { HomeFeedSkeleton } from '@/components/ui/skeleton';
import { QUICK_SUMMARY_ITEMS, TAB_BAR_HEIGHT } from '@/constants/dashboard';
import { DEFAULT_HOME_HERO_BANNER } from '@/constants/homeBanners';
import { getTrackRouteForOrder, inferOrderStatus } from '@/constants/orderWorkflow';
import { useCustomerKycStatus } from '@/hooks/use-customer-kyc-status';
import { useDeliveryLocation } from '@/hooks/use-delivery-location';
import { useNotificationBadge } from '@/hooks/use-notifications';
import { openCustomerBanner, openCustomerBannerSecondary } from '@/lib/cms-banner';
import { ROUTES } from '@/navigation/routes';
import { fetchCustomerMarketplaceProducts } from '@/services/catalog';
import { fetchCustomerHomeBanners, trackCmsBannerEvent } from '@/services/cms';
import { fetchCustomerFinanceSummary } from '@/services/orders';
import {
  selectActiveOrder,
  selectOrderHydrated,
  selectOrders,
  useOrderStore,
} from '@/store/order-store';
import type { HomeBanner, LowestLandedCost, TrendingProduct, WatchlistItem } from '@/types/home';
import type { MarketProduct } from '@/types/market';

function formatMtPrice(price: number) {
  if (!price) return 'Price on request';
  return `₹${Math.round(price).toLocaleString('en-IN')} / MT`;
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? 'P') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '')).toUpperCase();
}

function toTrending(product: MarketProduct): TrendingProduct {
  return {
    id: product.id,
    name: product.name,
    grade: product.grade,
    priceLabel: formatMtPrice(product.price),
  };
}

function toWatchlist(product: MarketProduct): WatchlistItem {
  return {
    id: product.id,
    initials: initialsFor(product.grade || product.name),
    materialName: `${product.name}${product.grade ? ` (${product.grade})` : ''}`,
    priceLabel: formatMtPrice(product.price),
    trend: 'stable',
    changePercent: '—',
  };
}

export const CustomerHomeScreen = () => {
  const router = useRouter();
  const locationSheetRef = useRef<BottomSheetModal>(null);
  const unreadCount = useNotificationBadge();
  const { selectedLocation, openAddressForm } = useDeliveryLocation();
  const { overview: kycOverview } = useCustomerKycStatus();

  const orders = useOrderStore(selectOrders);
  const activeOrder = useOrderStore(selectActiveOrder);
  const isOrderHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const [catalog, setCatalog] = useState<MarketProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [dueInvoicesLabel, setDueInvoicesLabel] = useState('₹0');

  useEffect(() => {
    if (!isOrderHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isOrderHydrated]);

  useEffect(() => {
    let cancelled = false;
    void fetchCustomerMarketplaceProducts()
      .then((products) => {
        if (cancelled) return;
        setCatalog(products);
        setCatalogLoading(false);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setCatalog([]);
        setCatalogError(
          cause instanceof Error ? cause.message : 'Unable to load marketplace catalog.',
        );
        setCatalogLoading(false);
      });
    void fetchCustomerFinanceSummary()
      .then((summary) => {
        if (cancelled) return;
        const amount = Number(summary?.outstandingAmount ?? 0);
        setDueInvoicesLabel(
          Number.isFinite(amount) ? `₹${Math.round(amount).toLocaleString('en-IN')}` : '₹0',
        );
      })
      .catch(() => {
        if (!cancelled) setDueInvoicesLabel('₹0');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh CMS banners whenever Home is focused (Admin activate/upload → APP).
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void fetchCustomerHomeBanners()
        .then((items) => {
          if (!cancelled) {
            setBanners(items.length > 0 ? items : [DEFAULT_HOME_HERO_BANNER]);
          }
        })
        .catch(() => {
          if (!cancelled) setBanners([DEFAULT_HOME_HERO_BANNER]);
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const showHomeSkeleton = catalogLoading || !isOrderHydrated;

  const pricedCatalog = useMemo(
    () => [...catalog].filter((item) => item.price > 0).sort((a, b) => a.price - b.price),
    [catalog],
  );
  const trendingProducts = useMemo(
    () => (pricedCatalog.length ? pricedCatalog : catalog).slice(0, 8).map(toTrending),
    [catalog, pricedCatalog],
  );
  const watchlist = useMemo(() => {
    const unique = new Map<string, MarketProduct>();
    for (const item of catalog) {
      const key = item.grade || item.id;
      if (!unique.has(key)) unique.set(key, item);
      if (unique.size >= 3) break;
    }
    return [...unique.values()].map(toWatchlist);
  }, [catalog]);
  const lowestCost = useMemo<LowestLandedCost | undefined>(() => {
    const cheapest = pricedCatalog[0];
    if (!cheapest) return undefined;
    return {
      badge: 'LIVE MARKET PRICE',
      title: 'Lowest Landed Cost',
      description: `${cheapest.name} · ${cheapest.grade} currently offered from the marketplace catalog.`,
      estimatedTotal: formatMtPrice(cheapest.price),
      totalSavings: cheapest.moq ? `MOQ ${cheapest.moq}` : '—',
      ctaLabel: 'Review in Marketplace',
    };
  }, [pricedCatalog]);

  const activeOrderCount = orders.filter(
    (order) => inferOrderStatus(order) !== 'DELIVERED' && order.shipmentStatus !== 'cancelled',
  ).length;

  const quickSummaryItems = QUICK_SUMMARY_ITEMS.map((item) => {
    if (item.id === 'summary-active-orders') return { ...item, value: String(activeOrderCount) };
    if (item.id === 'summary-due-invoices') return { ...item, value: dueInvoicesLabel };
    return item;
  });

  const openLocationSheet = useCallback(() => {
    locationSheetRef.current?.present();
  }, []);

  const handleLocationSelect = useCallback(() => {
    locationSheetRef.current?.dismiss();
  }, []);

  const navigateToMarket = useCallback(() => {
    router.push({
      pathname: ROUTES.CUSTOMER.MARKET,
      params: { focusSearch: '1' },
    } as unknown as Href);
  }, [router]);

  const navigateToCart = useCallback(() => {
    router.push(ROUTES.CUSTOMER.CART as Href);
  }, [router]);

  const navigateToNotifications = useCallback(() => {
    router.push(ROUTES.CUSTOMER.NOTIFICATIONS as Href);
  }, [router]);

  const navigateToOrders = useCallback(() => {
    router.push(ROUTES.CUSTOMER.ORDERS as Href);
  }, [router]);

  const handleTrackShipment = useCallback(() => {
    if (!activeOrder) {
      navigateToOrders();
      return;
    }
    router.push(getTrackRouteForOrder(activeOrder));
  }, [activeOrder, navigateToOrders, router]);

  const showInfoToast = useCallback((title: string, message: string) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      visibilityTime: 2000,
    });
  }, []);

  const handleBannerAction = useCallback(
    (banner: HomeBanner) => {
      trackCmsBannerEvent(banner.id, 'CLICK');
      if (!openCustomerBanner(router, banner)) {
        showInfoToast(banner.title, banner.description || banner.subtitle);
      }
    },
    [router, showInfoToast],
  );

  const handleBannerSecondary = useCallback(
    (banner: HomeBanner) => {
      trackCmsBannerEvent(banner.id, 'CLICK');
      if (!openCustomerBannerSecondary(router, banner)) {
        showInfoToast(banner.title, banner.secondaryButtonLabel || 'Opening…');
      }
    },
    [router, showInfoToast],
  );

  const handleBannerImpression = useCallback((banner: HomeBanner) => {
    trackCmsBannerEvent(banner.id, 'IMPRESSION');
  }, []);

  const handleWatchlistPress = useCallback(
    (item: WatchlistItem) => {
      router.push({
        pathname: ROUTES.CUSTOMER.PRODUCT_DETAILS,
        params: { id: item.id },
      } as unknown as Href);
    },
    [router],
  );

  const handleProductPress = useCallback(
    (product: TrendingProduct) => {
      router.push({
        pathname: ROUTES.CUSTOMER.PRODUCT_DETAILS,
        params: { id: product.id },
      } as unknown as Href);
    },
    [router],
  );

  const renderTrendingItem = useCallback(
    ({ item }: { item: TrendingProduct }) => (
      <TrendingMaterialCard product={item} onPress={handleProductPress} />
    ),
    [handleProductPress],
  );

  return (
    <View className="flex-1 bg-brand-white">
      <HomeHeader
        hasNotification={unreadCount > 0}
        onCartPress={navigateToCart}
        onNotificationPress={navigateToNotifications}
      />

      {showHomeSkeleton ? (
        <View className="flex-1 pt-md" style={{ paddingBottom: TAB_BAR_HEIGHT + 24 }}>
          <HomeFeedSkeleton />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-xl"
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 24 }}
        >
          <View>
            <LocationSelector location={selectedLocation} onPress={openLocationSheet} />
            <SearchBar onPress={navigateToMarket} onFilterPress={navigateToMarket} />
          </View>

          <KycStatusBanner
            overview={kycOverview}
            actionLabel="Update documents"
            onAction={() => router.push(ROUTES.AUTH.KYC_DOCUMENTS as Href)}
            className="mx-lg mt-md"
          />

          {banners.length > 0 ? (
            <HeroCarousel
              banners={banners}
              onActionPress={handleBannerAction}
              onSecondaryPress={handleBannerSecondary}
              onImpression={handleBannerImpression}
            />
          ) : null}

          {activeOrder ? (
            <View className="mt-lg">
              <CurrentShipmentCard order={activeOrder} onTrackPress={handleTrackShipment} />
            </View>
          ) : null}

          <View className="mt-lg flex-row gap-md px-lg">
            {quickSummaryItems.map((item) => (
              <QuickSummaryCard key={item.id} item={item} onPress={navigateToOrders} />
            ))}
          </View>

          <View className="mt-xl">
            <SectionHeader
              title="Price Watchlist"
              actionLabel="EDIT"
              onActionPress={() =>
                showInfoToast('Edit Watchlist', 'Manage your polymer price alerts.')
              }
            />
            <View className="mx-lg mt-md overflow-hidden rounded-xl border border-brand-border/60 bg-brand-white shadow-sm">
              {catalogError ? (
                <View className="px-lg py-lg">
                  <Text className="text-sm text-brand-muted">{catalogError}</Text>
                </View>
              ) : watchlist.length ? (
                watchlist.map((item, index) => (
                  <WatchlistCard
                    key={item.id}
                    item={item}
                    onPress={handleWatchlistPress}
                    showDivider={index < watchlist.length - 1}
                  />
                ))
              ) : (
                <View className="px-lg py-lg">
                  <Text className="text-sm text-brand-muted">No live prices available yet.</Text>
                </View>
              )}
            </View>
          </View>

          <View className="mt-xl">
            <SectionHeader title="Trending Materials" />
            <View className="mt-md h-[168px]">
              {trendingProducts.length ? (
                <FlashList
                  data={trendingProducts}
                  renderItem={renderTrendingItem}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                />
              ) : (
                <View className="mx-lg justify-center">
                  <Text className="text-sm text-brand-muted">
                    {catalogError ? catalogError : 'No products available.'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {lowestCost ? (
            <View className="mb-lg mt-lg">
              <LowestCostCard data={lowestCost} onPress={navigateToMarket} />
            </View>
          ) : null}
        </ScrollView>
      )}

      <LocationBottomSheet
        ref={locationSheetRef}
        selectedId={selectedLocation.id}
        onSelect={handleLocationSelect}
        onAddAddress={openAddressForm}
      />
    </View>
  );
};
