import { memo, useCallback, useEffect, useState } from 'react';

import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import {
  EmptyState,
  OrderCardSkeleton,
  SellerBottomNavigation,
  SellerModuleTopBar,
} from '@/seller/components';
import { usePullToRefresh } from '@/seller/hooks/usePullToRefresh';
import { useSkeletonLoading } from '@/seller/hooks/useSkeletonLoading';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import {
  fetchSellerPayments,
  fetchSellerProformaInvoices,
  type SellerPayment,
  type SellerProformaInvoice,
} from '@/services/seller-settlements';

export const SellerPaymentsScreen = memo(function SellerPaymentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [payments, setPayments] = useState<SellerPayment[]>([]);
  const [proformas, setProformas] = useState<SellerProformaInvoice[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoading = useSkeletonLoading(isHydrated);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [nextPayments, nextProformas] = await Promise.all([
        fetchSellerPayments(),
        fetchSellerProformaInvoices(),
      ]);
      setPayments(nextPayments);
      setProformas(nextProformas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments');
      setPayments([]);
      setProformas([]);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const { isRefreshing, refresh } = usePullToRefresh(load);

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <View className="flex-1">
        <SellerModuleTopBar title="Payments & PI" showSearch={false} />

        <ScrollView
          className="flex-1 px-lg"
          contentContainerStyle={{ paddingBottom: insets.bottom + 108 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />
          }
        >
          <Pressable
            onPress={() => router.push(ROUTES.SELLER.SETTLEMENTS as Href)}
            className="mt-md self-start"
          >
            <Typography variant="link">View settlements</Typography>
          </Pressable>

          {error ? (
            <View className="mt-md rounded-2xl border border-brand-border bg-brand-white px-lg py-md">
              <Typography variant="body">{error}</Typography>
              <Pressable onPress={() => void load()} className="mt-sm">
                <Typography variant="link">Retry</Typography>
              </Pressable>
            </View>
          ) : null}

          <Typography variant="roleTitle" className="mt-lg text-[15px]">
            Proforma invoices
          </Typography>
          {isLoading ? (
            <View className="mt-md gap-sm">
              <OrderCardSkeleton />
              <OrderCardSkeleton />
            </View>
          ) : proformas.length === 0 ? (
            <View className="mt-md">
              <EmptyState
                title="No proforma invoices"
                description="Proforma invoices will appear here after commercial acceptance."
              />
            </View>
          ) : (
            <View className="mt-md gap-sm">
              {proformas.map((pi) => (
                <View
                  key={pi.id}
                  className="rounded-2xl border border-brand-border bg-brand-white px-lg py-md"
                >
                  <Typography variant="roleTitle">{pi.piNumber}</Typography>
                  <Typography variant="legal" className="mt-xs text-brand-body">
                    {pi.buyer.displayName} · {pi.status}
                  </Typography>
                  <Typography variant="body" className="mt-sm">
                    {pi.currency} {pi.amount.toLocaleString('en-IN')}
                  </Typography>
                </View>
              ))}
            </View>
          )}

          <Typography variant="roleTitle" className="mt-xl text-[15px]">
            Payments
          </Typography>
          {isLoading ? (
            <View className="mt-md gap-sm">
              <OrderCardSkeleton />
            </View>
          ) : payments.length === 0 ? (
            <View className="mt-md">
              <EmptyState
                title="No payments yet"
                description="Inbound payments will appear here with blind buyer references."
              />
            </View>
          ) : (
            <View className="mt-md gap-sm">
              {payments.map((payment) => (
                <View
                  key={payment.id}
                  className="rounded-2xl border border-brand-border bg-brand-white px-lg py-md"
                >
                  <Typography variant="roleTitle">{payment.paymentId}</Typography>
                  <Typography variant="legal" className="mt-xs text-brand-body">
                    {payment.buyerRef} · {payment.status}
                  </Typography>
                  <Typography variant="body" className="mt-sm">
                    ₹{payment.amount.toLocaleString('en-IN')} · {payment.method}
                  </Typography>
                  <Typography variant="legal" className="mt-xs text-brand-muted">
                    Ref {payment.reference}
                  </Typography>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <SellerBottomNavigation
          active="payouts"
          onNavigate={(target) => navigateSellerBottomTab(router, target)}
        />
      </View>
    </ScreenWrapper>
  );
});
