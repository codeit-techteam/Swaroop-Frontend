import * as Notifications from 'expo-notifications';

import { appConfig } from '@/config/env';
import { logger } from '@/utils/logger';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const configureNotifications = (): void => {
  logger.info('Notifications configured', { appEnv: appConfig.env });
};

export const getNotificationPermissions = async (): Promise<boolean> => {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
};

export type NotificationServiceConfig = {
  oneSignalAppId: string;
};

export const notificationConfig: NotificationServiceConfig = {
  oneSignalAppId: appConfig.oneSignalAppId,
};
