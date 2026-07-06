export const APP_NAME = 'PetroTrade';

export const SPLASH_DURATION_MS = 2000;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'swaroop_access_token',
  REFRESH_TOKEN: 'swaroop_refresh_token',
  THEME_MODE: 'swaroop_theme_mode',
  ONBOARDING_COMPLETE: 'swaroop_onboarding_complete',
  AUTH_STORAGE_KEY: 'swaroop_auth',
  USER_PROFILE_KEY: 'swaroop_user_profile',
  BUSINESS_INFO_KEY: 'swaroop_business_info',
  DOCUMENTS_KEY: 'swaroop_documents',
  KYC_STATUS_KEY: 'swaroop_kyc_status',
  APP_SETTINGS_KEY: 'swaroop_app_settings',
  CART_KEY: 'swaroop_cart',
  PAYMENT_KEY: 'swaroop_payment',
  CHECKOUT_KEY: 'swaroop_checkout',
  ORDER_KEY: 'swaroop_order',
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
