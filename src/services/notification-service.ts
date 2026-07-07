import { appConfig } from '@/config/env';
import { logger } from '@/utils/logger';

type NotificationsModule = typeof import('expo-notifications');

let cachedModule: NotificationsModule | null | undefined;

/**
 * Lazily loads expo-notifications, skipping it in Expo Go where remote push was
 * removed (SDK 53+). Keeping the require out of the top-level module graph stops
 * the "push notifications removed from Expo Go" error from firing at app launch.
 */
const loadNotifications = (): NotificationsModule | null => {
  if (cachedModule !== undefined) {
    return cachedModule;
  }

  if (appConfig.isExpoGo) {
    cachedModule = null;
    return cachedModule;
  }

  try {
    cachedModule = require('expo-notifications') as NotificationsModule;
  } catch (error) {
    logger.warn('expo-notifications unavailable', error);
    cachedModule = null;
  }

  return cachedModule;
};

let handlerConfigured = false;

export const configureNotifications = (): void => {
  const Notifications = loadNotifications();

  if (Notifications && !handlerConfigured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerConfigured = true;
  }

  logger.info('Notifications configured', {
    appEnv: appConfig.env,
    enabled: Boolean(Notifications),
  });
};

export const getNotificationPermissions = async (): Promise<boolean> => {
  const Notifications = loadNotifications();
  if (!Notifications) {
    return false;
  }

  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
};

export type NotificationServiceConfig = {
  oneSignalAppId: string;
};

export const notificationConfig: NotificationServiceConfig = {
  oneSignalAppId: appConfig.oneSignalAppId,
};
