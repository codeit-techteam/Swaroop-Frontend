import Constants from 'expo-constants';
import { Platform } from 'react-native';

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

const DEV_API_PORT = 4000;
const DEV_API_PATH = '/api/v1';

/** Safe defaults so preview/production APK builds boot without a local .env file. */
const ENV_DEFAULTS: EnvSchema = {
  EXPO_PUBLIC_APP_ENV: 'development',
  EXPO_PUBLIC_APP_VERSION: '1.0.0',
  EXPO_PUBLIC_API_BASE_URL: `http://localhost:${DEV_API_PORT}${DEV_API_PATH}`,
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

type ExpoHostConstants = {
  expoGoConfig?: { debuggerHost?: string };
  linkingUri?: string;
  experienceUrl?: string;
  expoConfig?: { hostUri?: string };
  manifest?: { debuggerHost?: string; hostUri?: string } | null;
};

function extractHost(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const ipv4 = value.match(/(\d{1,3}(?:\.\d{1,3}){3})/);
  if (ipv4) {
    return ipv4[1];
  }

  try {
    const url = value.includes('://') ? new URL(value) : new URL(`http://${value}`);
    return url.hostname || undefined;
  } catch {
    return undefined;
  }
}

function isLoopbackHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '0.0.0.0';
}

function isPlaceholderApiHost(hostname: string): boolean {
  return hostname === 'api.example.com' || hostname.endsWith('.example.com');
}

function isPrivateLanHost(hostname: string): boolean {
  if (hostname === '10.0.2.2' || hostname === '10.0.3.2' || isLoopbackHost(hostname)) {
    return true;
  }

  const match = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    return false;
  }

  const first = Number(match[1]);
  const second = Number(match[2]);
  return first === 10 || (first === 192 && second === 168) || (first === 172 && second >= 16 && second <= 31);
}

function getExpoDevHost(): string | undefined {
  const extra = Constants as ExpoHostConstants;
  const candidates = [
    extra.expoConfig?.hostUri,
    extra.expoGoConfig?.debuggerHost,
    extra.manifest?.debuggerHost,
    extra.manifest?.hostUri,
    extra.experienceUrl,
    extra.linkingUri,
  ];

  for (const candidate of candidates) {
    const host = extractHost(candidate);
    if (host && isPrivateLanHost(host)) {
      return host;
    }
  }

  return undefined;
}

/**
 * Physical phones cannot reach the Mac's localhost. In development, rewrite
 * placeholder / loopback API URLs to the Expo LAN host (or the Android emulator alias).
 */
function resolveDevApiBaseUrl(configured: string, appEnv: EnvSchema['EXPO_PUBLIC_APP_ENV']): string {
  let parsed: URL;
  try {
    parsed = new URL(configured);
  } catch {
    parsed = new URL(ENV_DEFAULTS.EXPO_PUBLIC_API_BASE_URL);
  }

  if (appEnv !== 'development' || (!isLoopbackHost(parsed.hostname) && !isPlaceholderApiHost(parsed.hostname))) {
    return configured.replace(/\/$/, '');
  }

  const expoHost = getExpoDevHost();
  const host =
    expoHost && !isLoopbackHost(expoHost)
      ? expoHost
      : Platform.OS === 'android'
        ? '10.0.2.2'
        : 'localhost';

  const port = parsed.port || String(DEV_API_PORT);
  return `http://${host}:${port}${DEV_API_PATH}`;
}

const apiBaseUrl = resolveDevApiBaseUrl(env.EXPO_PUBLIC_API_BASE_URL, env.EXPO_PUBLIC_APP_ENV);

export const appConfig = {
  env: env.EXPO_PUBLIC_APP_ENV,
  version: env.EXPO_PUBLIC_APP_VERSION,
  apiBaseUrl,
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
