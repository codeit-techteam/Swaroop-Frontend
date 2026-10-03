import type { DeliveryLocation } from '@/types/home';
import type { LoginResult, UserProfilePayload, UserRole } from '@/types/session';

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoggedIn: boolean;
  isHydrated: boolean;
  mobileNumber: string | null;
  kycApproved: boolean;
  reviewSubmitted: boolean;
  onboardingCompleted: boolean;
  selectedRole: UserRole | null;
  location: DeliveryLocation | null;
  userProfile: UserProfilePayload | null;
  referenceId: string | null;
};

export type AuthActions = {
  hydrateSession: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  setHydrated: (hydrated: boolean) => void;
  completeOnboarding: () => void;
  setSelectedRole: (role: UserRole) => void;
  setMobileNumber: (mobileNumber: string) => void;
  completeLogin: (mobileNumber: string) => LoginResult;
  setReviewSubmitted: (referenceId: string) => void;
  /** Applies the backend KYC decision; the local copy is only a routing cache. */
  syncKycStatus: (status: {
    status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED';
    kycVerified: boolean;
    submittedAt: string | null;
  }) => void;
  setLocation: (location: DeliveryLocation) => void;
  updateUserProfile: (patch: Partial<UserProfilePayload>) => void;
  logout: () => Promise<void>;
  resetDemoAccount: () => Promise<void>;
};

export type AuthStore = AuthState & AuthActions;

export type ThemeState = {
  mode: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
};

export type ThemeActions = {
  setMode: (mode: ThemeState['mode']) => void;
  setResolvedTheme: (theme: 'light' | 'dark') => void;
};

export type ThemeStore = ThemeState & ThemeActions;

export type NetworkState = {
  isConnected: boolean;
  isInternetReachable: boolean | null;
};

export type NetworkActions = {
  setNetworkStatus: (status: NetworkState) => void;
};

export type NetworkStore = NetworkState & NetworkActions;
