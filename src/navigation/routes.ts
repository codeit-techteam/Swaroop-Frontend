export const ROUTES = {
  ROOT: '/',
  ONBOARDING: {
    SCREEN_ONE: '/(onboarding)/screen-one',
    SCREEN_TWO: '/(onboarding)/screen-two',
  },
  AUTH: {
    LOGIN: '/(auth)/login',
  },
  PUBLIC: {
    ROOT: '/(public)',
  },
  PRIVATE: {
    ROOT: '/(private)',
  },
} as const;

export type OnboardingRoute =
  typeof ROUTES.ONBOARDING.SCREEN_ONE | typeof ROUTES.ONBOARDING.SCREEN_TWO;

export type AuthRoute = typeof ROUTES.AUTH.LOGIN;

export type PublicRoute = typeof ROUTES.PUBLIC.ROOT;

export type PrivateRoute = typeof ROUTES.PRIVATE.ROOT;

export const isOnboardingRoute = (pathname: string): boolean =>
  pathname.startsWith('/(onboarding)');

export const isAuthRoute = (pathname: string): boolean => pathname.startsWith('/(auth)');

export const isPublicRoute = (pathname: string): boolean => pathname.startsWith('/(public)');

export const isPrivateRoute = (pathname: string): boolean => pathname.startsWith('/(private)');
