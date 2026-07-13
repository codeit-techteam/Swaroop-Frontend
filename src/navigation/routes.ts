export const ROUTES = {
  ROOT: '/',
  ONBOARDING: {
    SPLASH: '/(onboarding)/splash',
    INTRO_ONE: '/(onboarding)/intro-one',
    INTRO_TWO: '/(onboarding)/intro-two',
  },
  AUTH: {
    ROLE_SELECTION: '/(auth)/role-selection',
    CUSTOMER_LOGIN: '/(auth)/customer-login',
    CUSTOMER_REGISTER: '/(auth)/customer-register',
    OTP_VERIFICATION: '/(auth)/otp-verification',
    BUSINESS_INFORMATION: '/(auth)/business-information',
    KYC_DOCUMENTS: '/(auth)/kyc-documents',
    REVIEW_SUBMISSION: '/(auth)/review-submission',
    APPLICATION_SUBMITTED: '/(auth)/application-submitted',
  },
  CUSTOMER: {
    HOME: '/(customer)/(tabs)/home',
    MARKET: '/(customer)/(tabs)/market',
    ORDERS: '/(customer)/(tabs)/orders',
    PROFILE: '/(customer)/(tabs)/profile',
    PRODUCT_DETAILS: '/(customer)/product/[id]',
    CART: '/(customer)/cart',
    CHECKOUT: '/(customer)/checkout',
    PAYMENT: '/(customer)/payment',
    PAYMENT_COMPARE: '/(customer)/payment/compare',
    PAYMENT_UPLOAD_PROOF: '/(customer)/payment/upload-proof',
    PAYMENT_VERIFICATION_INITIATED: '/(customer)/payment/verification-initiated',
    ORDER_SUBMITTED: '/(customer)/order-submitted',
    CREDIT_APPROVAL: '/(customer)/credit-approval',
    LOADING_SCHEDULED: '/(customer)/loading-scheduled',
    LOADING_COMPLETED: '/(customer)/loading-completed',
    PAYMENT_REMINDER: '/(customer)/payment-reminder',
    PAYMENT_SUCCESS: '/(customer)/payment-success',
    PROCUREMENT_CONFIRMATION: '/(customer)/procurement/confirmation',
    ORDER_AWAITING_CONFIRMATION: '/(customer)/order-awaiting-confirmation',
    PURCHASE_ORDER_GENERATED: '/(customer)/purchase-order-generated',
    DISPATCH_PLANNING: '/(customer)/dispatch-planning',
    DISPATCH_STARTED: '/(customer)/dispatch-started',
    SHIPMENT_TRACKING: '/(customer)/shipment-tracking',
    ORDER_DETAIL: '/(customer)/order-detail',
    ORDER_CONFIRMATION: '/(customer)/order-confirmation',
    DASHBOARD: '/(customer)/(tabs)/home',
    PROFILE_EDIT: '/(customer)/profile/edit',
    PROFILE_COMPANY_DETAILS: '/(customer)/profile/company-details',
    PROFILE_SAVED_ADDRESSES: '/(customer)/profile/saved-addresses',
    PROFILE_BANK_ACCOUNTS: '/(customer)/profile/bank-accounts',
    PROFILE_TAX_DOCUMENTS: '/(customer)/profile/tax-documents',
  },

  PUBLIC: {
    ROOT: '/(public)',
  },
  PRIVATE: {
    ROOT: '/(private)',
  },
} as const;

export type OnboardingRoute =
  | typeof ROUTES.ONBOARDING.SPLASH
  | typeof ROUTES.ONBOARDING.INTRO_ONE
  | typeof ROUTES.ONBOARDING.INTRO_TWO;

export type AuthRoute =
  | typeof ROUTES.AUTH.ROLE_SELECTION
  | typeof ROUTES.AUTH.CUSTOMER_LOGIN
  | typeof ROUTES.AUTH.CUSTOMER_REGISTER
  | typeof ROUTES.AUTH.OTP_VERIFICATION
  | typeof ROUTES.AUTH.BUSINESS_INFORMATION
  | typeof ROUTES.AUTH.KYC_DOCUMENTS
  | typeof ROUTES.AUTH.REVIEW_SUBMISSION
  | typeof ROUTES.AUTH.APPLICATION_SUBMITTED;

export type CustomerRoute =
  | typeof ROUTES.CUSTOMER.HOME
  | typeof ROUTES.CUSTOMER.MARKET
  | typeof ROUTES.CUSTOMER.ORDERS
  | typeof ROUTES.CUSTOMER.PROFILE
  | typeof ROUTES.CUSTOMER.PRODUCT_DETAILS
  | typeof ROUTES.CUSTOMER.CART
  | typeof ROUTES.CUSTOMER.CHECKOUT
  | typeof ROUTES.CUSTOMER.PAYMENT
  | typeof ROUTES.CUSTOMER.PAYMENT_COMPARE
  | typeof ROUTES.CUSTOMER.PAYMENT_UPLOAD_PROOF
  | typeof ROUTES.CUSTOMER.PAYMENT_VERIFICATION_INITIATED
  | typeof ROUTES.CUSTOMER.ORDER_SUBMITTED
  | typeof ROUTES.CUSTOMER.CREDIT_APPROVAL
  | typeof ROUTES.CUSTOMER.LOADING_SCHEDULED
  | typeof ROUTES.CUSTOMER.LOADING_COMPLETED
  | typeof ROUTES.CUSTOMER.PAYMENT_REMINDER
  | typeof ROUTES.CUSTOMER.PAYMENT_SUCCESS
  | typeof ROUTES.CUSTOMER.PROCUREMENT_CONFIRMATION
  | typeof ROUTES.CUSTOMER.ORDER_AWAITING_CONFIRMATION
  | typeof ROUTES.CUSTOMER.PURCHASE_ORDER_GENERATED
  | typeof ROUTES.CUSTOMER.DISPATCH_PLANNING
  | typeof ROUTES.CUSTOMER.DISPATCH_STARTED
  | typeof ROUTES.CUSTOMER.SHIPMENT_TRACKING
  | typeof ROUTES.CUSTOMER.ORDER_DETAIL
  | typeof ROUTES.CUSTOMER.ORDER_CONFIRMATION
  | typeof ROUTES.CUSTOMER.DASHBOARD
  | typeof ROUTES.CUSTOMER.PROFILE_EDIT
  | typeof ROUTES.CUSTOMER.PROFILE_COMPANY_DETAILS
  | typeof ROUTES.CUSTOMER.PROFILE_SAVED_ADDRESSES
  | typeof ROUTES.CUSTOMER.PROFILE_BANK_ACCOUNTS
  | typeof ROUTES.CUSTOMER.PROFILE_TAX_DOCUMENTS;

export type PublicRoute = typeof ROUTES.PUBLIC.ROOT;

export type PrivateRoute = typeof ROUTES.PRIVATE.ROOT;

export const isOnboardingRoute = (pathname: string): boolean =>
  pathname.startsWith('/(onboarding)');

export const isAuthRoute = (pathname: string): boolean => pathname.startsWith('/(auth)');

export const isCustomerRoute = (pathname: string): boolean => pathname.startsWith('/(customer)');

export const isPublicRoute = (pathname: string): boolean => pathname.startsWith('/(public)');

export const isPrivateRoute = (pathname: string): boolean => pathname.startsWith('/(private)');
