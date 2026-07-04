import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';

import { logger } from '@/utils/logger';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export const requestCameraPermission = async (): Promise<PermissionStatus> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status as PermissionStatus;
};

export const requestMediaLibraryPermission = async (): Promise<PermissionStatus> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status as PermissionStatus;
};

export const requestNotificationPermission = async (): Promise<PermissionStatus> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') {
    return 'granted';
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status as PermissionStatus;
};

export const checkBiometricSupport = async (): Promise<{
  isSupported: boolean;
  isEnrolled: boolean;
  biometricTypes: LocalAuthentication.AuthenticationType[];
}> => {
  const isSupported = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  const biometricTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

  return { isSupported, isEnrolled, biometricTypes };
};

export const authenticateWithBiometrics = async (
  promptMessage = 'Authenticate to continue',
): Promise<boolean> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch (error) {
    logger.error('Biometric authentication failed', error);
    return false;
  }
};
