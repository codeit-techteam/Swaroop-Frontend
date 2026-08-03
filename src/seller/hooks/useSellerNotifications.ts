import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  deleteNotification,
  filterNotificationsByCategory,
  getSellerNotificationsSnapshot,
  loadMoreNotifications,
  markNotificationRead,
  refreshSellerNotifications,
} from '@/seller/services/sellerMockService';
import type {
  NotificationCategoryFilter,
  SellerNotification,
  SellerNotificationsSnapshot,
} from '@/seller/types/notifications';

export function useSellerNotifications() {
  const [snapshot, setSnapshot] = useState<SellerNotificationsSnapshot>(getSellerNotificationsSnapshot);
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategoryFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    const nextSnapshot = await refreshSellerNotifications();
    setSnapshot(nextSnapshot);
    setIsRefreshing(false);
  }, []);

  const filteredCriticalActions = useMemo(
    () => filterNotificationsByCategory(snapshot.criticalActions, selectedCategory),
    [selectedCategory, snapshot.criticalActions],
  );

  const filteredRecentActivity = useMemo(
    () => filterNotificationsByCategory(snapshot.recentActivity, selectedCategory),
    [selectedCategory, snapshot.recentActivity],
  );

  const handleMarkRead = useCallback((notificationId: string) => {
    markNotificationRead(notificationId);
    setSnapshot(getSellerNotificationsSnapshot());
  }, []);

  const handleDelete = useCallback((notificationId: string) => {
    deleteNotification(notificationId);
    setSnapshot(getSellerNotificationsSnapshot());
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || snapshot.archivedActivity.length === 0) {
      return;
    }

    setIsLoadingMore(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    loadMoreNotifications();
    setSnapshot(getSellerNotificationsSnapshot());
    setIsLoadingMore(false);
  }, [isLoadingMore, snapshot.archivedActivity.length]);

  const hasNotifications =
    filteredCriticalActions.length > 0 || filteredRecentActivity.length > 0;

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

export type UseSellerNotificationsReturn = ReturnType<typeof useSellerNotifications>;

export type { SellerNotification };
