import { create } from 'zustand';

import {
  clearAll,
  getAppSettings,
  getAuth,
  getUser,
  saveAppSettings,
  saveAuth,
  saveKYC,
  saveUser,
} from '@/services/storage';
import {
  getCurrentUser,
  isDemoUser,
  logout as logoutSession,
  resetKycData,
  seedDemoUser,
} from '@/services/user-session';
import { useKycStore } from '@/store/kyc-store';
import type { DeliveryLocation } from '@/types/home';
import type { LoginResult, UserRole } from '@/types/session';
import type { AuthStore } from '@/types/store';

const initialState = {
  accessToken: null as string | null,
  refreshToken: null as string | null,
  isAuthenticated: false,
  isLoggedIn: false,
  isHydrated: false,
  mobileNumber: null as string | null,
  kycApproved: false,
  reviewSubmitted: false,
  onboardingCompleted: false,
  selectedRole: null as UserRole | null,
  location: null as DeliveryLocation | null,
  userProfile: null as AuthStore['userProfile'],
  referenceId: null as string | null,
};

const applyCurrentUserToStore = (
  set: (partial: Partial<AuthStore>) => void,
  current: ReturnType<typeof getCurrentUser>,
): void => {
  useKycStore.getState().hydrateKyc();

  const userProfile = getUser();

  set({
    isLoggedIn: current.isLoggedIn,
    isAuthenticated: current.isLoggedIn,
    mobileNumber: current.mobileNumber,
    kycApproved: current.isKycApproved,
    reviewSubmitted: current.reviewCompleted || current.applicationSubmitted,
    referenceId: current.referenceId,
    selectedRole: current.selectedRole,
    userProfile,
  });
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  hydrateSession: () => {
    const auth = getAuth();

    // Demo account stays verified across restarts while DEVELOPMENT_MODE is on.
    if (auth.isLoggedIn && isDemoUser(auth.mobileNumber)) {
      seedDemoUser();
    }

    const current = getCurrentUser();
    const settings = getAppSettings();
    const userProfile = getUser();

    set({
      isLoggedIn: current.isLoggedIn,
      isAuthenticated: current.isLoggedIn,
      mobileNumber: current.mobileNumber,
      kycApproved: current.isKycApproved,
      reviewSubmitted: current.reviewCompleted || current.applicationSubmitted,
      referenceId: current.referenceId,
      onboardingCompleted: settings.onboardingCompleted,
      location: settings.location,
      selectedRole: userProfile?.selectedRole ?? null,
      userProfile,
      isHydrated: true,
    });
  },

  setTokens: (accessToken, refreshToken) => {
    set({
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoggedIn: true,
    });
  },

  clearTokens: () => {
    set({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoggedIn: false,
    });
  },

  setHydrated: (hydrated) => set({ isHydrated: hydrated }),

  completeOnboarding: () => {
    const settings = getAppSettings();
    const nextSettings = { ...settings, onboardingCompleted: true };
    saveAppSettings(nextSettings);
    set({ onboardingCompleted: true });
  },

  setSelectedRole: (role) => {
    const mobileNumber = get().mobileNumber ?? '';
    const userProfile = {
      mobileNumber,
      selectedRole: role,
      displayName: get().userProfile?.displayName,
    };
    saveUser(userProfile);
    set({ selectedRole: role, userProfile });
  },

  setMobileNumber: (mobileNumber) => {
    saveAuth({
      isLoggedIn: get().isLoggedIn,
      mobileNumber,
    });
    set({ mobileNumber });
  },

  completeLogin: (mobileNumber): LoginResult => {
    const demoAccount = isDemoUser(mobileNumber);

    if (demoAccount) {
      seedDemoUser();
    } else {
      const previousAuth = getAuth();
      const isAccountSwitch =
        previousAuth.mobileNumber != null && previousAuth.mobileNumber !== mobileNumber;

      // A brand-new number (or one switching away from the demo account) must
      // start KYC from scratch. Otherwise stale data — especially the demo
      // account's seeded `kycApproved: true` — would skip Business Info and
      // Documents upload and drop the user straight on the dashboard.
      if (isAccountSwitch || isDemoUser(previousAuth.mobileNumber)) {
        resetKycData();
      }

      // Ignore the previous account's profile when switching numbers so a new
      // user never inherits another user's name/role.
      const existingUser = isAccountSwitch ? null : getUser();
      const auth = {
        isLoggedIn: true,
        mobileNumber,
      };
      const userProfile = {
        mobileNumber,
        selectedRole:
          existingUser?.selectedRole ??
          (isAccountSwitch ? null : get().selectedRole) ??
          ('buyer' as UserRole),
        displayName: existingUser?.displayName ?? (isAccountSwitch ? undefined : get().userProfile?.displayName),
      };

      saveAuth(auth);
      saveUser(userProfile);
    }

    const current = getCurrentUser();
    applyCurrentUserToStore(set, current);

    return {
      kycApproved: current.isKycApproved,
      isDemoUser: demoAccount,
    };
  },

  setReviewSubmitted: (referenceId) => {
    const kyc = {
      kycApproved: get().kycApproved,
      reviewSubmitted: true,
      referenceId,
    };
    saveKYC(kyc);
    set({
      reviewSubmitted: true,
      referenceId,
    });
  },

  approveKyc: () => {
    const kyc = {
      kycApproved: true,
      reviewSubmitted: true,
      referenceId: get().referenceId,
    };
    saveKYC(kyc);
    set({
      kycApproved: true,
      reviewSubmitted: true,
    });
  },

  setLocation: (location) => {
    const settings = getAppSettings();
    const nextSettings = { ...settings, location };
    saveAppSettings(nextSettings);
    set({ location });
  },

  updateUserProfile: (patch) => {
    const mobileNumber = get().mobileNumber ?? '';
    const current = get().userProfile ?? {
      mobileNumber,
      selectedRole: get().selectedRole,
    };
    const userProfile = {
      ...current,
      ...patch,
      mobileNumber: patch.mobileNumber ?? current.mobileNumber,
    };

    saveUser(userProfile);
    set({
      userProfile,
      ...(patch.mobileNumber ? { mobileNumber: patch.mobileNumber } : {}),
    });
  },

  logout: async () => {
    logoutSession();
    set({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoggedIn: false,
      isHydrated: true,
    });
  },

  resetDemoAccount: async () => {
    await clearAll();
    useKycStore.getState().resetKyc();
    set({
      ...initialState,
      isHydrated: true,
    });
  },
}));

export const selectIsAuthenticated = (state: AuthStore): boolean => state.isAuthenticated;

export const selectIsLoggedIn = (state: AuthStore): boolean => state.isLoggedIn;

export const selectIsHydrated = (state: AuthStore): boolean => state.isHydrated;

export const selectAccessToken = (state: AuthStore): string | null => state.accessToken;

export const selectKycApproved = (state: AuthStore): boolean => state.kycApproved;

export const selectOnboardingCompleted = (state: AuthStore): boolean => state.onboardingCompleted;

export const selectMobileNumber = (state: AuthStore): string | null => state.mobileNumber;

export const selectLocation = (state: AuthStore): DeliveryLocation | null => state.location;
