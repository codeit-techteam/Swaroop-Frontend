import { useCallback, useRef, useState } from 'react';

import { ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeIn } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { listEntrance } from '@/animations';
import {
  HeroCarousel,
  HomeHeader,
  InsightCard,
  LocationBottomSheet,
  LocationSelector,
  LowestCostCard,
  QuickSummaryCard,
  SearchBar,
  SectionHeader,
  WatchlistCard,
  TrendingMaterialCard,
} from '@/components/home';
import {
  DEFAULT_DELIVERY_LOCATION,
  QUICK_SUMMARY_ITEMS,
  TAB_BAR_HEIGHT,
} from '@/constants/dashboard';
import { MARKET_INSIGHTS } from '@/constants/news';
import { TRENDING_PRODUCTS } from '@/constants/trendingProducts';
import { PRICE_WATCHLIST } from '@/constants/watchlist';
import { ROUTES } from '@/navigation/routes';
import { selectLocation, useAuthStore } from '@/store/auth-store';
import type {
  DeliveryLocation,
  HomeBanner,
  MarketInsight,
  TrendingProduct,
  WatchlistItem,
} from '@/types/home';

export const CustomerHomeScreen = () => {
  const router = useRouter();
  const locationSheetRef = useRef<BottomSheetModal>(null);
  const persistedLocation = useAuthStore(selectLocation);
  const setLocation = useAuthStore((state) => state.setLocation);
  const [selectedLocation, setSelectedLocation] = useState<DeliveryLocation>(
    persistedLocation ?? DEFAULT_DELIVERY_LOCATION,
  );

  const openLocationSheet = useCallback(() => {
    locationSheetRef.current?.present();
  }, []);

  const handleLocationSelect = useCallback(
    (location: DeliveryLocation) => {
      setSelectedLocation(location);
      setLocation(location);
      locationSheetRef.current?.dismiss();
    },
    [setLocation],
  );

  const navigateToMarket = useCallback(() => {
    router.push(ROUTES.CUSTOMER.MARKET as Href);
  }, [router]);

  const navigateToCart = useCallback(() => {
    router.push(ROUTES.CUSTOMER.CART as Href);
  }, [router]);

  const navigateToOrders = useCallback(() => {
    router.push(ROUTES.CUSTOMER.ORDERS as Href);
  }, [router]);

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
      showInfoToast(banner.title, banner.description);
    },
    [showInfoToast],
  );

  const handleWatchlistPress = useCallback(
    (item: WatchlistItem) => {
      showInfoToast(item.materialName, `${item.priceLabel} · ${item.changePercent}`);
    },
    [showInfoToast],
  );

  const handleProductPress = useCallback(
    (product: TrendingProduct) => {
      showInfoToast(product.name, `Grade ${product.grade} · ${product.priceLabel}`);
    },
    [showInfoToast],
  );

  const handleInsightPress = useCallback(
    (insight: MarketInsight) => {
      showInfoToast(insight.source, insight.title);
    },
    [showInfoToast],
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
        onHelpPress={() =>
          showInfoToast('Help Centre', 'Our support team is available 24×7 for buyers.')
        }
        onCartPress={navigateToCart}
        onNotificationPress={() => showInfoToast('Notifications', 'You have 2 new market alerts.')}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-xl"
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 24 }}
      >
        <Animated.View entering={FadeIn.duration(350)}>
          <LocationSelector location={selectedLocation} onPress={openLocationSheet} />
          <SearchBar onPress={navigateToMarket} onFilterPress={navigateToMarket} />
        </Animated.View>

        <HeroCarousel onActionPress={handleBannerAction} />

        <Animated.View entering={listEntrance(0)} className="mt-lg flex-row gap-md px-lg">
          {QUICK_SUMMARY_ITEMS.map((item) => (
            <QuickSummaryCard key={item.id} item={item} onPress={navigateToOrders} />
          ))}
        </Animated.View>

        <Animated.View entering={listEntrance(1)} className="mt-xl">
          <SectionHeader
            title="Price Watchlist"
            actionLabel="EDIT"
            onActionPress={() =>
              showInfoToast('Edit Watchlist', 'Manage your polymer price alerts.')
            }
          />
          <View className="mx-lg mt-md overflow-hidden rounded-xl border border-brand-border/60 bg-brand-white shadow-sm">
            {PRICE_WATCHLIST.map((item, index) => (
              <WatchlistCard
                key={item.id}
                item={item}
                onPress={handleWatchlistPress}
                showDivider={index < PRICE_WATCHLIST.length - 1}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={listEntrance(2)} className="mt-xl">
          <SectionHeader title="Trending Materials" />
          <View className="mt-md h-[196px]">
            <FlashList
              data={TRENDING_PRODUCTS}
              renderItem={renderTrendingItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          </View>
        </Animated.View>

        <Animated.View entering={listEntrance(3)} className="mt-lg">
          <LowestCostCard
            onPress={() =>
              showInfoToast(
                'Lowest Landed Cost',
                'Review logistics and place your polypropylene order.',
              )
            }
          />
        </Animated.View>

        <Animated.View entering={listEntrance(4)} className="mb-lg mt-xl">
          <SectionHeader
            title="Market Insights"
            actionLabel="See All"
            onActionPress={() =>
              showInfoToast('Market Insights', 'Full market intelligence feed coming soon.')
            }
          />
          <View className="mt-md">
            {MARKET_INSIGHTS.map((insight) => (
              <InsightCard key={insight.id} insight={insight} onPress={handleInsightPress} />
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <LocationBottomSheet
        ref={locationSheetRef}
        selectedId={selectedLocation.id}
        onSelect={handleLocationSelect}
      />
    </View>
  );
};
