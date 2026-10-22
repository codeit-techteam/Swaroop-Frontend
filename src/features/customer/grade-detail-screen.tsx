import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { Linking, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { isAxiosError } from 'axios';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, ProductCard, liveOfferLabel } from '@/components/market';
import { ProductHeader } from '@/components/product';
import { BlindSellerBadge } from '@/components/product/blind-seller-badge';
import { SkeletonCard, SkeletonProductCard } from '@/components/ui/skeleton';
import { Typography } from '@/components/ui/typography';
import { formatMarketPrice } from '@/constants/marketProducts';
import {
  queryErrorMessage,
  useCustomerGrade,
  useCustomerGradeOffers,
  useCustomerGradeProducts,
} from '@/hooks/use-grade-master';
import { useNotificationBadge } from '@/hooks/use-notifications';
import { buildLoginHref } from '@/navigation/return-to';
import { ROUTES } from '@/navigation/routes';
import {
  fetchGradeTdsDocuments,
  fetchProductDocumentUrl,
  type GradeTdsResponse,
} from '@/services/catalog';
import { selectIsLoggedIn, useAuthStore } from '@/store/auth-store';
import type { BlindGradeOffer, CustomerGrade } from '@/types/grade-master';
import type { MarketProduct } from '@/types/market';

const IdentityRow = memo(function IdentityRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between border-b border-brand-border py-sm">
      <Typography variant="fieldLabel" className="mr-md mt-0.5 text-brand-muted">
        {label}
      </Typography>
      <Typography
        variant="roleDescription"
        className="flex-1 text-right text-[13px] text-brand-heading"
      >
        {value}
      </Typography>
    </View>
  );
});

const GradeIdentityCard = memo(function GradeIdentityCard({ grade }: { grade: CustomerGrade }) {
  const rows: [string, string | null | undefined][] = [
    ['Grade No.', grade.gradeNo],
    ['Manufacturer', grade.manufacturer],
    ['Grade group', grade.gradeGroup],
    ['Category', grade.category?.displayName],
    ['Grade code', grade.code],
  ];
  const showFullName =
    grade.fullGradeName && grade.fullGradeName.trim() !== grade.displayName.trim();

  return (
    <View className="mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm">
      <View className="flex-row flex-wrap gap-xs">
        {grade.category ? (
          <View className="rounded-md bg-brand-primary-light px-sm py-xs">
            <Typography variant="badge" className="text-[10px] tracking-[0.6px]">
              {grade.category.displayName}
            </Typography>
          </View>
        ) : null}
        {grade.gradeGroup ? (
          <View className="rounded-md bg-brand-overlay px-sm py-xs">
            <Typography variant="badge" className="text-[10px] tracking-[0.6px] text-brand-body">
              {grade.gradeGroup}
            </Typography>
          </View>
        ) : null}
      </View>
      <Typography variant="headingLeft" className="mt-sm text-[20px] leading-[26px]">
        {grade.displayName}
      </Typography>
      {showFullName ? (
        <Typography variant="subheadingLeft" className="mt-xs text-[13px]">
          {grade.fullGradeName}
        </Typography>
      ) : null}
      <View className="mt-md">
        {rows
          .filter((row): row is [string, string] => Boolean(row[1]))
          .map(([label, value]) => (
            <IdentityRow key={label} label={label} value={value} />
          ))}
      </View>
      {grade.description ? (
        <Typography variant="subheadingLeft" className="mt-md text-[13px] leading-[20px]">
          {grade.description}
        </Typography>
      ) : null}
    </View>
  );
});

const OfferRow = memo(function OfferRow({
  offer,
  onPress,
}: {
  offer: BlindGradeOffer;
  onPress?: () => void;
}) {
  const facts = [
    offer.quantityAvailable > 0
      ? `${offer.quantityAvailable.toLocaleString('en-IN')} ${offer.unit} available`
      : null,
    offer.moq > 0 ? `MOQ ${offer.moq} ${offer.unit}` : null,
    offer.packaging,
    offer.region,
    offer.deliveryTerms,
  ].filter(Boolean);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      className="mx-lg mb-md rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm"
      style={({ pressed }) => ({ opacity: pressed ? 0.96 : 1 })}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-md">
          <BlindSellerBadge />
          <Typography variant="roleDescription" className="mt-sm text-[12px] text-brand-muted">
            {facts.join(' · ') || 'Live offer'}
          </Typography>
        </View>
        <View className="items-end">
          <Typography
            variant="headingLeft"
            className="text-[18px] leading-[22px] text-brand-primary"
          >
            {formatMarketPrice(offer.price)}
          </Typography>
          <Typography variant="roleDescription" className="text-[11px] text-brand-muted">
            per {offer.unit}
          </Typography>
        </View>
      </View>
      {onPress ? (
        <Typography variant="link" className="mt-sm text-[12px]">
          View offer details
        </Typography>
      ) : null}
    </Pressable>
  );
});

const isNotFound = (error: unknown): boolean =>
  isAxiosError(error) && error.response?.status === 404;

export const CustomerGradeDetailScreen = memo(function CustomerGradeDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const gradeId = (Array.isArray(params.id) ? params.id[0] : params.id) ?? null;
  const unreadCount = useNotificationBadge();

  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const gradeQuery = useCustomerGrade(gradeId);
  const productsQuery = useCustomerGradeProducts(gradeId);
  const offersQuery = useCustomerGradeOffers(gradeId);
  const [tds, setTds] = useState<GradeTdsResponse | null>(null);
  const [tdsLoading, setTdsLoading] = useState(false);

  useEffect(() => {
    if (!gradeId) return;
    let cancelled = false;
    setTdsLoading(true);
    void fetchGradeTdsDocuments(gradeId)
      .then((payload) => {
        if (!cancelled) setTds(payload);
      })
      .catch(() => {
        if (!cancelled) {
          setTds({
            grade: { id: gradeId, code: '', name: '' },
            available: false,
            message: 'TDS unavailable',
            items: [],
          });
        }
      })
      .finally(() => {
        if (!cancelled) setTdsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gradeId]);

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const extraOffers = useMemo(() => {
    const listedOfferIds = new Set(products.map((product) => product.offerId).filter(Boolean));
    const listedProductIds = new Set(products.map((product) => product.id));
    return (offersQuery.data ?? []).filter(
      (offer) =>
        !listedOfferIds.has(offer.id) &&
        !(offer.productId && listedProductIds.has(offer.productId)),
    );
  }, [offersQuery.data, products]);

  const liveCount = products.length + extraOffers.length;
  const offersLoading = productsQuery.isPending || offersQuery.isPending;
  const offersError = productsQuery.isError && offersQuery.isError;

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.GRADES as Href);
  }, [router]);

  const openProduct = useCallback(
    (productId: string) => {
      router.push({
        pathname: ROUTES.CUSTOMER.PRODUCT_DETAILS,
        params: { id: productId },
      } as unknown as Href);
    },
    [router],
  );

  const handleTdsDownload = useCallback(
    async (productId: string, documentId: string, title: string) => {
      if (!isLoggedIn) {
        Toast.show({
          type: 'info',
          text1: 'Sign in to download TDS',
          text2: 'Technical data sheets require an authenticated session.',
        });
        router.push(
          buildLoginHref(
            gradeId ? `/(customer)/grades/${gradeId}` : ROUTES.CUSTOMER.GRADES,
          ),
        );
        return;
      }
      try {
        const { url } = await fetchProductDocumentUrl(productId, documentId);
        if (!url) throw new Error('URL unavailable');
        await Linking.openURL(url);
        Toast.show({ type: 'success', text1: title, text2: 'Opening verified TDS…' });
      } catch {
        Toast.show({
          type: 'error',
          text1: 'TDS unavailable',
          text2: 'Signed download URL could not be opened.',
        });
      }
    },
    [gradeId, isLoggedIn, router],
  );

  const handleProductPress = useCallback(
    (product: MarketProduct) => openProduct(product.id),
    [openProduct],
  );

  const refresh = useCallback(() => {
    void gradeQuery.refetch();
    void productsQuery.refetch();
    void offersQuery.refetch();
  }, [gradeQuery, offersQuery, productsQuery]);

  const header = (
    <ProductHeader
      onBackPress={handleBack}
      onCartPress={() => router.push(ROUTES.CUSTOMER.CART as Href)}
      onNotificationPress={() => router.push(ROUTES.CUSTOMER.NOTIFICATIONS as Href)}
      hasNotification={unreadCount > 0}
    />
  );

  if (!gradeId || (gradeQuery.isError && isNotFound(gradeQuery.error))) {
    return (
      <View className="flex-1 bg-brand-white">
        {header}
        <EmptyState
          title="Grade not available"
          description="This grade is no longer listed in the marketplace."
          actionLabel="Browse grades"
          onActionPress={() => router.replace(ROUTES.CUSTOMER.GRADES as Href)}
        />
      </View>
    );
  }

  if (gradeQuery.isError) {
    return (
      <View className="flex-1 bg-brand-white">
        {header}
        <EmptyState
          title="Unable to load grade"
          description={queryErrorMessage(gradeQuery.error, 'Please try again.')}
          actionLabel="Retry"
          onActionPress={refresh}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-background">
      {header}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 24 }}
        refreshControl={
          <RefreshControl
            refreshing={
              gradeQuery.isRefetching || productsQuery.isRefetching || offersQuery.isRefetching
            }
            onRefresh={refresh}
          />
        }
      >
        {gradeQuery.data ? (
          <GradeIdentityCard grade={gradeQuery.data} />
        ) : (
          <SkeletonCard className="mx-lg" />
        )}

        <View className="mx-lg mt-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm">
          <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
            Technical Data Sheet
          </Typography>
          {tdsLoading ? (
            <Typography variant="subheadingLeft" className="mt-sm text-[13px] text-brand-muted">
              Loading TDS…
            </Typography>
          ) : !tds?.available || tds.items.length === 0 ? (
            <Typography variant="subheadingLeft" className="mt-sm text-[13px] text-brand-muted">
              {tds?.message ?? 'TDS unavailable — no approved Technical Data Sheet is on file.'}
            </Typography>
          ) : (
            <View className="mt-md" style={{ gap: 8 }}>
              {tds.items.map((doc) => (
                <Pressable
                  key={doc.id}
                  onPress={() =>
                    void handleTdsDownload(
                      doc.productId ?? '',
                      doc.id,
                      doc.title || doc.productName || 'TDS',
                    )
                  }
                  className="rounded-lg border border-brand-border bg-brand-surface px-md py-md"
                >
                  <Typography variant="roleTitle" className="text-[13px] text-brand-heading">
                    {doc.title || 'Technical Data Sheet'}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="mt-xs font-sans text-[11px] normal-case text-brand-muted"
                  >
                    {doc.productName ?? doc.productCode ?? 'Product document'}
                    {isLoggedIn ? '' : ' · Sign in to download'}
                  </Typography>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View className="flex-row items-center justify-between px-lg pb-sm pt-xl">
          <Typography variant="roleTitle" className="text-[16px]">
            Live offers
          </Typography>
          {!offersLoading && liveCount > 0 ? (
            <Typography variant="success" className="text-[12px]">
              {liveOfferLabel(liveCount)}
            </Typography>
          ) : null}
        </View>

        {offersLoading ? (
          <View className="gap-md px-lg">
            <SkeletonProductCard />
            <SkeletonProductCard />
          </View>
        ) : offersError ? (
          <EmptyState
            title="Unable to load offers"
            description={queryErrorMessage(offersQuery.error, 'Please try again.')}
            actionLabel="Retry"
            onActionPress={refresh}
          />
        ) : liveCount === 0 ? (
          <EmptyState
            title="No live offers right now"
            description="No seller has a live offer for this grade at the moment. Check back soon or browse other grades."
            actionLabel="Browse grades"
            onActionPress={handleBack}
          />
        ) : (
          <>
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onBookNow={handleProductPress}
              />
            ))}
            {extraOffers.map((offer) => (
              <OfferRow
                key={offer.id}
                offer={offer}
                onPress={offer.productId ? () => openProduct(offer.productId as string) : undefined}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
});
