import { memo, useCallback, useMemo } from 'react';

import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader, PrimaryButton, ScreenWrapper, Typography } from '@/components';
import { EmptyState } from '@/components/market';
import { MarketListSkeleton } from '@/components/ui/skeleton';
import { useGradeRequests } from '@/hooks/use-grade-requests';
import { ROUTES } from '@/navigation/routes';
import { toGradeRequestError } from '@/services/grade-requests';
import type { GradeRequest } from '@/types/grade-request';
import { dayjs } from '@/utils/date';

import { GradeRequestStatusPill } from './GradeRequestStatusPill';

export const GradeRequestsScreen = memo(function GradeRequestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const query = useGradeRequests();

  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);

  const openNew = useCallback(
    () => router.push(ROUTES.CUSTOMER.GRADE_REQUEST_NEW as Href),
    [router],
  );
  const openRequest = useCallback(
    (item: GradeRequest) =>
      router.push({
        pathname: ROUTES.CUSTOMER.GRADE_REQUEST_DETAILS,
        params: { id: item.id },
      } as unknown as Href),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: GradeRequest }) => (
      <Pressable
        onPress={() => openRequest(item)}
        accessibilityRole="button"
        className="mx-lg mb-md rounded-2xl border border-brand-border bg-brand-white p-lg"
      >
        <View className="flex-row items-start justify-between">
          <View className="mr-sm flex-1">
            <Typography variant="roleTitle" numberOfLines={1} className="text-[15px]">
              {item.gradeName}
            </Typography>
            <Typography variant="roleDescription" className="mt-xs text-brand-muted">
              {item.referenceNumber}
              {item.manufacturer ? ` · ${item.manufacturer}` : ''} · {item.quantity} {item.unit}
            </Typography>
          </View>
          <GradeRequestStatusPill status={item.status} label={item.statusLabel} />
        </View>
        {item.awaitingCustomerResponse ? (
          <Typography variant="error" className="mt-sm">
            We need more information from you.
          </Typography>
        ) : null}
        <Typography variant="roleDescription" className="mt-sm text-[11px] text-brand-muted">
          Submitted {dayjs(item.submittedAt).format('DD MMM YYYY')}
        </Typography>
      </Pressable>
    ),
    [openRequest],
  );

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <AppHeader variant="back" title="Grade requests" />

      {query.isPending ? (
        <MarketListSkeleton />
      ) : query.isError && items.length === 0 ? (
        <EmptyState
          title="Unable to load requests"
          description={toGradeRequestError(query.error, 'Please try again.').message}
          actionLabel="Retry"
          onActionPress={() => void query.refetch()}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 96, flexGrow: 1 }}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching && !query.isFetchingNextPage}
              onRefresh={() => void query.refetch()}
            />
          }
          ListFooterComponent={
            query.isFetchingNextPage ? (
              <View className="py-lg">
                <ActivityIndicator />
              </View>
            ) : undefined
          }
          ListEmptyComponent={
            <EmptyState
              title="No grade requests yet"
              description="If you can't find a grade in the catalogue, request it and we will source it for you."
              actionLabel="Request a new grade"
              onActionPress={openNew}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {items.length > 0 ? (
        <View
          className="absolute inset-x-0 bottom-0 bg-brand-background px-lg pt-sm"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <PrimaryButton label="Request a new grade" onPress={openNew} />
        </View>
      ) : null}
    </ScreenWrapper>
  );
});
