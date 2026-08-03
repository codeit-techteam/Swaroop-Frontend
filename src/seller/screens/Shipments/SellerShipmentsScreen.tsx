import { memo, useMemo, useState } from 'react';

import { RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper } from '@/components';
import { ROUTES } from '@/navigation/routes';
import {
  ActiveShipmentCard,
  AnalyticsCard,
  SellerEmptyState,
  SellerHeader,
  ShipmentFilterTabs,
  ShipmentsListSkeleton,
} from '@/seller/components';
import { useSellerShipments } from '@/seller/hooks/useSellerShipments';
import type { ShipmentFilterTab } from '@/seller/types/shipments';

export const SellerShipmentsScreen = memo(function SellerShipmentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<ShipmentFilterTab>('in_transit');
  const { filteredShipments, analytics, isLoading, isRefreshing, refresh } =
    useSellerShipments(selectedTab);

  const analyticsCards = useMemo(
    () => [
      { label: 'Total Active', value: analytics.totalActive, accent: 'default' as const },
      { label: 'On Schedule', value: analytics.onSchedule, accent: 'success' as const },
      { label: 'Critical ETA', value: analytics.criticalEta, accent: 'danger' as const },
      { label: 'Average Speed', value: analytics.averageSpeed, accent: 'default' as const },
    ],
    [analytics],
  );

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader
        title="Active Shipments"
        showBack
        showBell
        onBack={() => router.back()}
        onBellPress={() => router.push(ROUTES.SELLER.NOTIFICATIONS as Href)}
      />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />}
      >
        <View className="mt-md">
          <ShipmentFilterTabs selected={selectedTab} onSelect={setSelectedTab} />
        </View>

        {isLoading ? (
          <View className="mt-lg">
            <ShipmentsListSkeleton />
          </View>
        ) : (
          <>
            <View className="mt-lg flex-row flex-wrap gap-md">
              {analyticsCards.map((card) => (
                <View key={card.label} className="min-w-[46%] flex-1">
                  <AnalyticsCard label={card.label} value={card.value} accent={card.accent} />
                </View>
              ))}
            </View>

            {filteredShipments.length === 0 ? (
              <View className="mt-xl">
                <SellerEmptyState
                  title="No shipments found"
                  description="There are no shipments in this status. Switch tabs or refresh to see the latest updates."
                />
              </View>
            ) : (
              <View className="mt-lg gap-md">
                {filteredShipments.map((shipment, index) => (
                  <Animated.View key={shipment.id} entering={FadeInDown.delay(index * 60).duration(280)}>
                    <ActiveShipmentCard
                      shipment={shipment}
                      onPress={() =>
                        router.push({
                          pathname: ROUTES.SELLER.SHIPMENT_DETAILS,
                          params: { shipmentId: shipment.id },
                        } as unknown as Href)
                      }
                    />
                  </Animated.View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
});
