import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchSellerNotifications, markSellerNotificationRead } from '@/services/seller-operations';
import type {
  NotificationCategoryFilter,
  SellerNotificationsSnapshot,
} from '@/seller/types/notifications';

const EMPTY_SNAPSHOT: SellerNotificationsSnapshot = {
  criticalActions: [],
  recentActivity: [],
  archivedActivity: [],
};

export function useSellerNotifications() {
  const [snapshot, setSnapshot] = useState<SellerNotificationsSnapshot>(EMPTY_SNAPSHOT);
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategoryFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const next = await fetchSellerNotifications();
    setSnapshot(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void load()
      .catch(() => {
        if (!cancelled) setSnapshot(EMPTY_SNAPSHOT);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await load();
    } catch {
      setSnapshot(EMPTY_SNAPSHOT);
    } finally {
      setIsRefreshing(false);
    }
  }, [load]);

  const filteredCriticalActions = useMemo(
    () =>
      selectedCategory === 'all'
        ? snapshot.criticalActions
        : snapshot.criticalActions.filter((item) => item.category === selectedCategory),
    [selectedCategory, snapshot.criticalActions],
  );

  const filteredRecentActivity = useMemo(
    () =>
      selectedCategory === 'all'
        ? snapshot.recentActivity
        : snapshot.recentActivity.filter((item) => item.category === selectedCategory),
    [selectedCategory, snapshot.recentActivity],
  );

  const handleMarkRead = useCallback(
    (notificationId: string) => {
      void markSellerNotificationRead(notificationId)
        .then(() => void load())
        .catch(() => undefined);
    },
    [load],
  );

  const handleDelete = useCallback((notificationId: string) => {
    setSnapshot((current) => ({
      ...current,
      criticalActions: current.criticalActions.filter((item) => item.id !== notificationId),
      recentActivity: current.recentActivity.filter((item) => item.id !== notificationId),
    }));
  }, []);

  const handleLoadMore = useCallback(async () => undefined, []);

  const hasNotifications = filteredCriticalActions.length > 0 || filteredRecentActivity.length > 0;

  return {
    snapshot,
    selectedCategory,
    setSelectedCategory,
    filteredCriticalActions,
    filteredRecentActivity,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasNotifications,
    canLoadMore: snapshot.archivedActivity.length > 0,
    refresh,
    handleMarkRead,
    handleDelete,
    handleLoadMore,
  };
}
