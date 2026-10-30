import { ExpoConfig, ConfigContext } from 'expo/config';

const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';
// Plain-HTTP (LAN backend on the dev machine) is only allowed in development builds.
const ALLOW_CLEARTEXT = APP_ENV === 'development';
const APP_VERSION = process.env.EXPO_PUBLIC_APP_VERSION ?? '3.1.1';
const ANDROID_VERSION_CODE = Number(process.env.ANDROID_VERSION_CODE ?? 3111);
// PolyStoreX EAS project under polystorexs-team (swaroop.veylorn@gmail.com).
const EAS_PROJECT_ID =
  process.env.EAS_PROJECT_ID ?? 'ccf88988-1846-42d3-8944-a10d70252de7';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'PolyStoreX',
  // EAS project slug for account polystorexs-team / project polystorex.
  // Branding lives in `name`; package id stays com.swaroop.app.
  slug: 'polystorex',
  owner: 'polystorexs-team',
  version: APP_VERSION,
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'polystorex',

  userInterfaceStyle: 'automatic',
  backgroundColor: '#ffffff',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.swaroop.app',
    infoPlist: {
      UIBackgroundModes: ['remote-notification'],
      NSLocationWhenInUseUsageDescription:
        'PolyStoreX uses your location to detect the delivery pincode and save warehouse addresses.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'PolyStoreX uses your location to detect the delivery pincode and save warehouse addresses.',

      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: ALLOW_CLEARTEXT,
        NSAllowsLocalNetworking: ALLOW_CLEARTEXT,
      },
    },
  },
  android: {
    adaptiveIcon: {
      // Symbol-only foreground kept inside the adaptive safe zone.
      // Do not use the full wordmark lockup here — the system mask will crop it.
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.swaroop.app',
    versionCode: ANDROID_VERSION_CODE,
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
      'android.permission.POST_NOTIFICATIONS',
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
    'expo-image',
    'expo-sharing',
    'expo-status-bar',
    '@react-native-community/datetimepicker',
    [
      'expo-splash-screen',
      {
        // Full brand lockup (mark + wordmark). `contain` keeps the entire artwork visible.
        image: './assets/images/splash-icon.png',
        imageWidth: 240,
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
          // Expo SDK 58 modules (expo-application, expo-asset, …) publish AAR
          // metadata requiring compileSdk 37; pinning 36 fails
          // `:expo:checkReleaseAarMetadata` on EAS. Matches SDK 58 defaults
          // (compileSdk 37 / buildTools 37.0.0 / targetSdk 36).
          compileSdkVersion: 37,
          targetSdkVersion: 36,
          buildToolsVersion: '37.0.0',
          minSdkVersion: 24,
          usesCleartextTraffic: ALLOW_CLEARTEXT,
          // A-13: keep session data out of cloud/device backup where possible.
          enableMinifyInReleaseBuilds: false,
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
          'Allow PolyStoreX to use your current location to set and save the delivery address.',
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
