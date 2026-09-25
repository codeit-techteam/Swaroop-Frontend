import { memo, useCallback, useEffect, useState } from 'react';

import { RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import {
  EmptyState,
  SearchBar,
  SellerBottomNavigation,
  SellerModuleTopBar,
} from '@/seller/components';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import {
  fetchSellerProcurementWorkbench,
  type SellerWorkbenchItem,
} from '@/services/seller-workbench';

const formatAmount = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const SellerProcurementWorkbenchScreen = memo(
  function SellerProcurementWorkbenchScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [items, setItems] = useState<SellerWorkbenchItem[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
      const page = await fetchSellerProcurementWorkbench({
        page: 1,
        limit: 50,
        search: query || undefined,
      });
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
            setError(err instanceof Error ? err.message : 'Failed to load workbench');
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
          <SellerModuleTopBar title="Procurement Workbench" showSearch={false} />
          <ScrollView
            className="flex-1 px-lg"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
            }
          >
            <View className="mt-md">
              <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder="Search workbench by grade or stage"
              />
            </View>

            {error ? (
              <Typography variant="legal" className="mt-md text-[#B91C1C]">
                {error}
              </Typography>
            ) : null}

            <View className="mt-lg gap-md">
              {!loading && items.length === 0 ? (
                <EmptyState
                  variant="no_orders"
                  onCtaPress={() => router.push(ROUTES.SELLER.PURCHASE_REQUESTS as Href)}
                />
              ) : (
                items.map((item) => (
                  <View
                    key={item.id}
                    className="rounded-[22px] border border-brand-border bg-brand-white p-lg"
                  >
                    <View className="flex-row items-start justify-between">
                      <Typography variant="badge" className="text-brand-heading">
                        {item.order.poNumber || item.purchaseRequestId.slice(0, 8)}
                      </Typography>
                      <Typography variant="badge" className="text-brand-primary">
                        {String(item.currentStage).replace(/_/g, ' ')}
                      </Typography>
                    </View>
                    <Typography variant="headingLeft" className="mt-sm text-[18px]">
                      {item.gradeName || item.productName}
                    </Typography>
                    <Typography variant="legal" className="mt-xs text-brand-body">
                      {item.buyerDisplayName}
                    </Typography>
                    <View className="mt-md flex-row flex-wrap">
                      {[
                        { label: 'QTY', value: `${item.quantityMt} MT` },
                        { label: 'VALUE', value: formatAmount(item.orderValue) },
                        { label: 'PAYMENT', value: item.paymentStatus },
                        { label: 'DISPATCH', value: item.dispatchStatus },
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
  },
);
