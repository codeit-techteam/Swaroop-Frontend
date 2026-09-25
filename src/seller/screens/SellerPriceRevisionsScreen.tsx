import { memo, useCallback, useEffect, useState } from 'react';

import { RefreshControl, ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import {
  EmptyState,
  SearchBar,
  SellerBottomNavigation,
  SellerModuleTopBar,
} from '@/seller/components';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import {
  fetchSellerPriceRevisionsPage,
  type SellerPriceRevision,
} from '@/services/seller-price-revisions';

const formatAmount = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const SellerPriceRevisionsScreen = memo(function SellerPriceRevisionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<SellerPriceRevision[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const page = await fetchSellerPriceRevisionsPage({ page: 1, limit: 50, search: query || undefined });
    setItems(page.items);
    setError(null);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void load()
      .catch((err: unknown) => {
        if (!cancelled) {
          setItems([]);
          setError(err instanceof Error ? err.message : 'Failed to load price revisions');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <View className="flex-1">
        <SellerModuleTopBar title="Price Revisions" showSearch={false} />
        <ScrollView
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />}
        >
          <View className="mt-md">
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search revisions by grade or buyer"
            />
          </View>

          {error ? (
            <Typography variant="legal" className="mt-md text-[#B91C1C]">
              {error}
            </Typography>
          ) : null}

          <View className="mt-lg gap-md">
            {!loading && items.length === 0 ? (
              <EmptyState variant="no_orders" />
            ) : (
              items.map((item) => (
                <View
                  key={item.id}
                  className="rounded-[22px] border border-brand-border bg-brand-white p-lg"
                >
                  <View className="flex-row items-start justify-between">
                    <Typography variant="badge" className="text-brand-heading">
                      #{item.requestNumber}
                    </Typography>
                    <Typography variant="badge" className="text-brand-primary">
                      {item.status.replace(/_/g, ' ')}
                    </Typography>
                  </View>
                  <Typography variant="headingLeft" className="mt-sm text-[18px]">
                    {item.grade?.displayName || item.product?.name || 'Price revision'}
                  </Typography>
                  <Typography variant="legal" className="mt-xs text-brand-body">
                    {item.buyer.displayName}
                  </Typography>
                  <View className="mt-md flex-row flex-wrap">
                    {[
                      { label: 'ORIGINAL', value: formatAmount(item.originalPrice) },
                      { label: 'REQUESTED', value: formatAmount(item.requestedPrice) },
                      { label: 'QTY', value: `${item.quantity} ${item.unit}` },
                      {
                        label: 'DELTA',
                        value: `${item.differencePercent.toFixed(1)}%`,
                      },
                    ].map((row) => (
                      <View key={row.label} className="mb-sm w-1/2 pr-sm">
                        <Typography variant="fieldLabel">{row.label}</Typography>
                        <Typography variant="roleTitle" className="mt-0.5 text-[14px]">
                          {row.value}
                        </Typography>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
        <View className="absolute bottom-0 left-0 right-0">
          <SellerBottomNavigation
            active="dashboard"
            onNavigate={(target) => navigateSellerBottomTab(router, target)}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
});
