export const APP_NAME = 'PetroTrade';

export const SPLASH_DURATION_MS = 2000;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'swaroop_access_token',
  REFRESH_TOKEN: 'swaroop_refresh_token',
  THEME_MODE: 'swaroop_theme_mode',
  ONBOARDING_COMPLETE: 'swaroop_onboarding_complete',
} as const;

export const QUERY_KEYS = {
  AUTH: 'auth',
  USER: 'user',
} as const;

export const API_TIMEOUT = 30000;

export const DEBOUNCE_DELAY = 300;

export const THROTTLE_DELAY = 500;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
} as const;

export const CURRENCY = {
  CODE: 'INR',
  SYMBOL: '₹',
  LOCALE: 'en-IN',
} as const;
