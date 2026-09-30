import { ExpoConfig, ConfigContext } from 'expo/config';

const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';
const APP_VERSION = process.env.EXPO_PUBLIC_APP_VERSION ?? '1.0.0';
const EAS_PROJECT_ID =
  process.env.EAS_PROJECT_ID ?? '8fa5420d-cb2b-4656-bc7a-411b977c9d7b';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Swaroop',
  slug: 'swaroop',
  version: APP_VERSION,
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'swaroop',
  userInterfaceStyle: 'automatic',
  backgroundColor: '#ffffff',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.swaroop.app',
    infoPlist: {
      UIBackgroundModes: ['remote-notification'],
      NSLocationWhenInUseUsageDescription:
        'PetroTrade uses your location to detect the delivery pincode and save warehouse addresses, like Amazon or Myntra.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'PetroTrade uses your location to detect the delivery pincode and save warehouse addresses.',
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
        NSAllowsLocalNetworking: true,
      },
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.swaroop.app',
    usesCleartextTraffic: true,
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.USE_BIOMETRIC',
      'android.permission.USE_FINGERPRINT',
      'android.permission.VIBRATE',
      'android.permission.RECEIVE_BOOT_COMPLETED',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-secure-store',
    'expo-local-authentication',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/notification-icon.png',
        color: '#2563EB',
        defaultChannel: 'default',
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 36,
          targetSdkVersion: 36,
          buildToolsVersion: '36.0.0',
          minSdkVersion: 24,
          usesCleartextTraffic: true,
        },
        ios: {
          deploymentTarget: '16.4',
        },
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow Swaroop to access your photos.',
        cameraPermission: 'Allow Swaroop to access your camera.',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Allow PetroTrade to use your current location to set and save the delivery address.',
        isIosBackgroundLocationEnabled: false,
        isAndroidBackgroundLocationEnabled: false,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: false,
  },
  extra: {
    appEnv: APP_ENV,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    imageBaseUrl: process.env.EXPO_PUBLIC_IMAGE_BASE_URL,
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    oneSignalAppId: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID,
    eas: {
      projectId: EAS_PROJECT_ID,
    },
    router: {},
  },
  updates: {
    url: process.env.EXPO_PUBLIC_UPDATES_URL ?? `https://u.expo.dev/${EAS_PROJECT_ID}`,
    fallbackToCacheTimeout: 0,
    checkAutomatically: 'ON_LOAD',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
});
