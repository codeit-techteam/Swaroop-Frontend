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
  ORDER_KEY: 'swaroop_order_v2',
  SELLER_ACCESS: 'swaroop_seller_access',
  SELLER_ROLE: 'swaroop_seller_role',
  SELLER_LOGGED_IN: 'swaroop_seller_logged_in',
  SELLER_PROFILE_COMPLETED: 'swaroop_seller_profile_completed',
  SELLER_VERIFICATION_SUBMITTED: 'swaroop_seller_verification_submitted',
  SELLER_DASHBOARD_ACCESS: 'swaroop_seller_dashboard_access',
  SELLER_OTP_VERIFIED: 'swaroop_seller_otp_verified',
  SELLER_MOBILE: 'swaroop_seller_mobile',
  SELLER_COMPANY: 'swaroop_seller_company',
  SELLER_DOCUMENTS: 'swaroop_seller_documents',
  SELLER_PROFILE: 'swaroop_seller_profile',
  SELLER_PRODUCT_STATE: 'swaroop_seller_product_state',
  SELLER_INVENTORY_STATE: 'swaroop_seller_inventory_state',
  SELLER_SETTLEMENT_STATE: 'swaroop_seller_settlement_state',
  SELLER_DISPATCH_STATE: 'swaroop_seller_dispatch_state',
  SELLER_ORDERS_STATE: 'swaroop_seller_orders_state_v2',
  SELLER_OFFERS_STATE: 'swaroop_seller_offers_state',
  SELLER_APP_SETTINGS: 'swaroop_seller_app_settings',
  SELLER_FILTER_PREFS: 'swaroop_seller_filter_prefs',
  SELLER_RECENT_SEARCHES: 'swaroop_seller_recent_searches',
  CUSTOMER_RECENT_SEARCHES: 'swaroop_customer_recent_searches',
  CUSTOMER_ADDRESSES: 'swaroop_customer_addresses',
  SELLER_SUPPORT_TICKETS: 'swaroop_seller_support_tickets',
  SELLER_SECURITY_STATE: 'swaroop_seller_security_state',
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
