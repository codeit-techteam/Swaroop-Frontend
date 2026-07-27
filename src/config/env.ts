import Constants from 'expo-constants';

import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  EXPO_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
  EXPO_PUBLIC_API_BASE_URL: z.string().url(),
  EXPO_PUBLIC_IMAGE_BASE_URL: z.string().url(),
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1),
  EXPO_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  EXPO_PUBLIC_ONESIGNAL_APP_ID: z.string().min(1),
});

type EnvSchema = z.infer<typeof envSchema>;

/** Safe defaults so preview/production APK builds boot without a local .env file. */
const ENV_DEFAULTS: EnvSchema = {
  EXPO_PUBLIC_APP_ENV: 'development',
  EXPO_PUBLIC_APP_VERSION: '1.0.0',
  EXPO_PUBLIC_API_BASE_URL: 'https://api.example.com',
  EXPO_PUBLIC_IMAGE_BASE_URL: 'https://cdn.example.com',
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: 'preview-placeholder',
  EXPO_PUBLIC_FIREBASE_API_KEY: 'preview-placeholder',
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: 'preview.firebaseapp.com',
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'preview',
  EXPO_PUBLIC_ONESIGNAL_APP_ID: 'preview-placeholder',
};

const rawEnv: EnvSchema = {
  EXPO_PUBLIC_APP_ENV:
    (process.env.EXPO_PUBLIC_APP_ENV as EnvSchema['EXPO_PUBLIC_APP_ENV']) ??
    ENV_DEFAULTS.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_APP_VERSION:
    process.env.EXPO_PUBLIC_APP_VERSION ?? ENV_DEFAULTS.EXPO_PUBLIC_APP_VERSION,
  EXPO_PUBLIC_API_BASE_URL:
    process.env.EXPO_PUBLIC_API_BASE_URL ?? ENV_DEFAULTS.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_IMAGE_BASE_URL:
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL ?? ENV_DEFAULTS.EXPO_PUBLIC_IMAGE_BASE_URL,
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY:
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? ENV_DEFAULTS.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  EXPO_PUBLIC_FIREBASE_API_KEY:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? ENV_DEFAULTS.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? ENV_DEFAULTS.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? ENV_DEFAULTS.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_ONESIGNAL_APP_ID:
    process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID ?? ENV_DEFAULTS.EXPO_PUBLIC_ONESIGNAL_APP_ID,
};

const parsedEnv = envSchema.safeParse(rawEnv);

const env: EnvSchema = parsedEnv.success ? parsedEnv.data : ENV_DEFAULTS;

export const appConfig = {
  env: env.EXPO_PUBLIC_APP_ENV,
  version: env.EXPO_PUBLIC_APP_VERSION,
  apiBaseUrl: env.EXPO_PUBLIC_API_BASE_URL,
  imageBaseUrl: env.EXPO_PUBLIC_IMAGE_BASE_URL,
  googleMapsApiKey: env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  firebase: {
    apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  },
  oneSignalAppId: env.EXPO_PUBLIC_ONESIGNAL_APP_ID,
  isExpoGo: Constants.appOwnership === 'expo',
  isDev: env.EXPO_PUBLIC_APP_ENV === 'development',
} as const;

export type AppConfig = typeof appConfig;
