import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  fetchCustomerNotifications,
  fetchCustomerUnreadCount,
  markAllCustomerNotificationsRead,
  markCustomerNotificationRead,
} from '@/services/notifications';
import { useNotificationStore } from '@/store/notification-store';
import type {
  CustomerNotification,
  NotificationCategoryFilter,
  NotificationDateGroup,
} from '@/types/notifications';
import { dayjs, isToday } from '@/utils/date';

const PAGE_SIZE = 10;

const FILTER_CATEGORIES: Record<NotificationCategoryFilter, CustomerNotification['category'][]> = {
  all: [],
  orders: ['orders', 'purchase_requests', 'seller_approval'],
  payments: ['payments', 'credit'],
  shipment: ['shipment'],
  documents: ['documents'],
  offers: ['offers', 'promotions', 'marketplace'],
};

const isYesterday = (date: string): boolean =>
  dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');

const matchesFilter = (
  notification: CustomerNotification,
  filter: NotificationCategoryFilter,
): boolean => {
  if (filter === 'all') {
    return true;
  }
  return FILTER_CATEGORIES[filter].includes(notification.category);
};

export function useNotificationBadge() {
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  useEffect(() => {
    let cancelled = false;
    void fetchCustomerUnreadCount()
      .then((count) => {
        if (!cancelled) {
          setUnreadCount(count);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [setUnreadCount]);

  return unreadCount;
}

export function useCustomerNotifications() {
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const [items, setItems] = useState<CustomerNotification[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<NotificationCategoryFilter>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    const page = await fetchCustomerNotifications();
    setItems(page.items);
    setUnreadCount(page.unreadCount);
  }, [setUnreadCount]);

  useEffect(() => {
    let cancelled = false;
    void load()
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setUnreadCount(0);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [load, setUnreadCount]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await load();
    } catch {
      setItems([]);
      setUnreadCount(0);
    } finally {
      setIsRefreshing(false);
    }
  }, [load, setUnreadCount]);

  const filteredItems = useMemo(
    () => items.filter((item) => matchesFilter(item, selectedFilter)),
    [items, selectedFilter],
  );

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount],
  );

  const groups = useMemo<NotificationDateGroup[]>(() => {
    const today: CustomerNotification[] = [];
    const yesterday: CustomerNotification[] = [];
    const earlier: CustomerNotification[] = [];

    visibleItems.forEach((item) => {
      if (isToday(item.createdAt)) {
        today.push(item);
      } else if (isYesterday(item.createdAt)) {
        yesterday.push(item);
      } else {
        earlier.push(item);
      }
    });

    return [
      { key: 'today', label: 'Today', items: today },
      { key: 'yesterday', label: 'Yesterday', items: yesterday },
      { key: 'earlier', label: 'Earlier', items: earlier },
    ].filter((group) => group.items.length > 0);
  }, [visibleItems]);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.isRead).length,
    [items],
  );

  useEffect(() => {
    if (!isLoading) {
      setUnreadCount(unreadCount);
    }
  }, [isLoading, setUnreadCount, unreadCount]);

  const handleMarkRead = useCallback((id: string) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    );
    void markCustomerNotificationRead(id).catch(() => undefined);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    void markAllCustomerNotificationsRead().catch(() => undefined);
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((current) => current + PAGE_SIZE);
  }, []);

  const handleFilterChange = useCallback((filter: NotificationCategoryFilter) => {
    setSelectedFilter(filter);
    setVisibleCount(PAGE_SIZE);
  }, []);

  return {
    selectedFilter,
    setSelectedFilter: handleFilterChange,
    groups,
    unreadCount,
    isLoading,
    isRefreshing,
    hasNotifications: filteredItems.length > 0,
    canLoadMore: visibleCount < filteredItems.length,
    refresh,
    handleMarkRead,
    handleMarkAllRead,
    handleLoadMore,
  };
}
