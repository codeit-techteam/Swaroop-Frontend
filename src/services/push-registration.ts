import { Platform } from 'react-native';

import { type Href, router } from 'expo-router';

import { appConfig } from '@/config/env';
import { STORAGE_KEYS } from '@/constants';
import { buildLoginHref } from '@/navigation/return-to';
import { ROUTES } from '@/navigation/routes';
import { requestNotificationPermission } from '@/utils/permissions';
import { logger } from '@/utils/logger';
import { getStorageItem, setStorageItem } from '@/utils/storage';
import { rememberPendingPushRoute } from '@/services/pending-push-route';
import {
  openPushRegistration,
  pushRegistrationOpen,
  readInstallationId,
  readRevocableStoredToken,
  registerPushToken,
  trackPushSync,
} from '@/services/push-token-api';
import { configureNotifications } from '@/services/notification-service';
import { isFcmRegistrationToken } from '@/services/fcm-token';
import { routeForPushData, type PushAudience, type PushNotificationData } from '@/services/push-navigation';
import { useAuthStore } from '@/store/auth-store';
import { useSellerStore } from '@/seller/store/sellerStore';

type NotificationsModule = typeof import('expo-notifications');

type PushSubscription = { remove: () => void };

const loadNotifications = (): NotificationsModule | null => {
  if (appConfig.isExpoGo) return null;
  try {
    return require('expo-notifications') as NotificationsModule;
  } catch (error) {
    logger.warn('expo-notifications unavailable', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
};

const asData = (value: unknown): PushNotificationData => {
  if (!value || typeof value !== 'object') return {};
  const row = value as Record<string, unknown>;
  const text = (key: string): string | undefined =>
    typeof row[key] === 'string' && row[key] ? (row[key] as string) : undefined;
  return {
    notificationId: text('notificationId'),
    entityType: text('entityType'),
    entityId: text('entityId'),
    route: text('route'),
    category: text('category'),
    title: text('title'),
    event: text('event'),
  };
};

const sessionActive = (audience: PushAudience): boolean => {
  const accessToken = getStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (!accessToken) return false;
  if (audience === 'seller') return useSellerStore.getState().sellerLoggedIn;
  return useAuthStore.getState().isLoggedIn;
};

const openNotification = (data: PushNotificationData, audience: PushAudience): void => {
  const route = routeForPushData(data, audience);
  if (!sessionActive(audience)) {
    rememberPendingPushRoute(route);
    router.push(
      audience === 'seller'
        ? (ROUTES.SELLER.LOGIN as Href)
        : buildLoginHref(route),
    );
    return;
  }
  router.push(route as Href);
};

/**
 * Routes notification taps. Runs while signed out so a cold start can keep the destination.
 */
export const startPushNavigation = (audience: PushAudience): (() => void) => {
  const Notifications = loadNotifications();
  if (!Notifications || (Platform.OS !== 'android' && Platform.OS !== 'ios')) {
    return () => undefined;
  }

  let cancelled = false;
  const subscriptions: PushSubscription[] = [];
  const seenResponses = new Set<string>();

  const handleResponse = (response: {
    notification: { request: { identifier?: string; content: { data?: unknown } } };
  } | null): void => {
    if (!response) return;
    const id = response.notification.request.identifier ?? '';
    if (id && (seenResponses.has(id) || getStorageItem(STORAGE_KEYS.PUSH_RESPONSE_ID) === id)) {
      return;
    }
    if (id) {
      seenResponses.add(id);
      setStorageItem(STORAGE_KEYS.PUSH_RESPONSE_ID, id);
    }
    openNotification(asData(response.notification.request.content.data), audience);
  };

  configureNotifications();
  subscriptions.push(
    Notifications.addNotificationResponseReceivedListener((response) => {
      handleResponse(response);
    }),
  );

  void Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      if (!cancelled) handleResponse(response);
    })
    .catch(() => undefined);

  return () => {
    cancelled = true;
    subscriptions.forEach((subscription) => subscription.remove());
  };
};

/**
 * Registers the native Android FCM token for the signed-in user.
 * Expo push tokens are not sent.
 */
export const startPushRegistration = (): (() => void) => {
  const Notifications = loadNotifications();
  if (!Notifications || Platform.OS !== 'android') {
    return () => undefined;
  }

  let cancelled = false;
  const subscriptions: PushSubscription[] = [];

  const syncToken = async (): Promise<void> => {
    const permission = await requestNotificationPermission();
    if (cancelled || !pushRegistrationOpen() || permission !== 'granted') return;

    await Notifications.setNotificationChannelAsync('default', {
      name: 'General',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    const device = await Notifications.getDevicePushTokenAsync();
    if (cancelled || !pushRegistrationOpen()) return;
    const token = typeof device.data === 'string' ? device.data : '';
    if (device.type !== 'android' || !isFcmRegistrationToken(token)) {
      logger.warn('Push registration skipped: native FCM token was not returned');
      return;
    }

    const stored = readRevocableStoredToken();
    await registerPushToken({
      token,
      platform: 'android',
      installationId: readInstallationId(),
      previousToken: stored && stored !== token ? stored : undefined,
    });
  };

  configureNotifications();
  openPushRegistration();

  const runSync = (label: string): void => {
    const work = syncToken().catch((error) => {
      logger.warn(label, {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    });
    trackPushSync(work);
  };

  runSync('Push registration failed');
  subscriptions.push(
    Notifications.addPushTokenListener(() => {
      runSync('Push token refresh failed');
    }),
  );

  return () => {
    cancelled = true;
    subscriptions.forEach((subscription) => subscription.remove());
  };
};
