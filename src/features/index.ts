export { SplashScreen } from '@/features/splash';
export { OnboardingScreen, ONBOARDING_COPY, ONBOARDING_TOTAL_PAGES } from '@/features/onboarding';
export { LoginPlaceholder } from '@/features/auth';

export type FeatureConfig = {
  name: string;
  enabled: boolean;
};

export const featureFlags: Record<string, FeatureConfig> = {
  auth: { name: 'auth', enabled: true },
  notifications: { name: 'notifications', enabled: true },
  biometrics: { name: 'biometrics', enabled: true },
};

export const isFeatureEnabled = (featureName: string): boolean =>
  featureFlags[featureName]?.enabled ?? false;
