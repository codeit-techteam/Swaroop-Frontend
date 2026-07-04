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
  },
  CUSTOMER: {
    DASHBOARD: '/(customer)/dashboard',
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
  | typeof ROUTES.AUTH.OTP_VERIFICATION;

export type CustomerRoute = typeof ROUTES.CUSTOMER.DASHBOARD;

export type PublicRoute = typeof ROUTES.PUBLIC.ROOT;

export type PrivateRoute = typeof ROUTES.PRIVATE.ROOT;

export const isOnboardingRoute = (pathname: string): boolean =>
  pathname.startsWith('/(onboarding)');

export const isAuthRoute = (pathname: string): boolean => pathname.startsWith('/(auth)');

export const isCustomerRoute = (pathname: string): boolean => pathname.startsWith('/(customer)');

export const isPublicRoute = (pathname: string): boolean => pathname.startsWith('/(public)');

export const isPrivateRoute = (pathname: string): boolean => pathname.startsWith('/(private)');
