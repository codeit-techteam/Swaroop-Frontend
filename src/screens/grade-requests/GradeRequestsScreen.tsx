import { memo, useCallback, useMemo } from 'react';

import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, ScreenWrapper, Typography } from '@/components';
import { useGradeRequests } from '@/hooks/use-grade-requests';
import { type GradeRequestRole, toGradeRequestError } from '@/services/grade-requests';
import { type GradeRequest, isAwaitingRequesterResponse } from '@/types/grade-request';
import { dayjs } from '@/utils/date';

import {
  GradeRequestHeader,
  GradeRequestListSkeleton,
  GradeRequestStateCard,
} from './GradeRequestParts';
import { GradeRequestStatusPill } from './GradeRequestStatusPill';
import { GRADE_REQUEST_ROLE_CONFIG } from './role-config';

type Props = { role?: GradeRequestRole };

export const GradeRequestsScreen = memo(function GradeRequestsScreen({ role = 'customer' }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const query = useGradeRequests(role);
  const config = GRADE_REQUEST_ROLE_CONFIG[role];

  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);

  const openNew = useCallback(
    () => router.push(config.newRoute as Href),
    [config.newRoute, router],
  );
  const openRequest = useCallback(
    (item: GradeRequest) =>
      router.push({
        pathname: config.detailsRoute,
        params: { id: item.id },
      } as unknown as Href),
    [config.detailsRoute, router],
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
        {isAwaitingRequesterResponse(item) ? (
          <Typography variant="error" className="mt-sm">
            {config.needsResponseMessage}
          </Typography>
        ) : null}
        <Typography variant="roleDescription" className="mt-sm text-[11px] text-brand-muted">
          Submitted {dayjs(item.submittedAt).format('DD MMM YYYY')}
        </Typography>
      </Pressable>
    ),
    [config.needsResponseMessage, openRequest],
  );

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <GradeRequestHeader
        role={role}
        title={config.listTitle}
        fallbackHref={config.fallbackRoute as Href}
      />

      {query.isPending ? (
        <GradeRequestListSkeleton role={role} />
      ) : query.isError && items.length === 0 ? (
        <GradeRequestStateCard
          role={role}
          kind="error"
          title={config.loadErrorTitle}
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
            <GradeRequestStateCard
              role={role}
              kind="empty"
              title={config.emptyTitle}
              description={config.emptyDescription}
              actionLabel={config.newCtaLabel}
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
          <PrimaryButton label={config.newCtaLabel} onPress={openNew} />
        </View>
      ) : null}
    </ScreenWrapper>
  );
});
