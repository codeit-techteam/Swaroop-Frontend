import { create } from 'zustand';

import {
  clearSellerAccess,
  readSellerAccess,
  sellerAuthErrorMessage,
} from '@/services/seller-auth';
import {
  cacheSellerAccount,
  clearCachedSellerAccount,
  fetchSellerAccountProfile,
  readCachedSellerAccount,
  type SellerAccountSummary,
} from '@/services/seller-profile';

import {
  buildDefaultSellerSnapshot,
  cloneDocumentsWithPatch,
  getSellerSnapshot,
  persistSellerSnapshot,
  resetSellerSession,
} from '@/seller/mock/mockSellerService';
import type { SellerCompany, SellerDocumentId, SellerStore } from '@/seller/types';

const baseSnapshot = buildDefaultSellerSnapshot();

const persistState = (state: SellerStore): void => {
  persistSellerSnapshot({
    sellerRole: state.sellerRole,
    sellerLoggedIn: state.sellerLoggedIn,
    sellerProfileCompleted: state.sellerProfileCompleted,
    verificationSubmitted: state.verificationSubmitted,
    dashboardAccess: state.dashboardAccess,
    otpVerified: state.otpVerified,
    mobile: state.mobile,
    company: state.company,
    documents: state.documents,
    profile: state.profile,
  });
};

const toInitials = (value: string, fallback: string): string =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || fallback;

/** Projects the backend summary onto the legacy fields other seller screens still read. */
const identityFromAccount = (state: SellerStore, account: SellerAccountSummary) => ({
  profile: {
    ownerName: account.ownerName,
    companyInitials: account.initials || state.profile.companyInitials,
  },
  company: {
    ...state.company,
    companyName: account.companyName,
    gst: account.gstin ?? state.company.gst,
    pan: account.pan ?? state.company.pan,
  },
});

let accountRequest: Promise<SellerAccountSummary | null> | null = null;

export const useSellerStore = create<SellerStore>((set, get) => ({
  ...baseSnapshot,
  isHydrated: false,
  account: null,
  accountManagers: [],
  accountStatus: 'idle',
  accountError: null,

  hydrateSellerSession: () => {
    const snapshot = getSellerSnapshot();
    const account = snapshot.sellerLoggedIn ? readCachedSellerAccount() : null;
    set({
      ...snapshot,
      account,
      accountStatus: account ? 'ready' : 'idle',
      isHydrated: true,
    });
  },

  setMobile: (mobile) => {
    set({ mobile });
    persistState(get());
  },

  markOtpVerified: () => {
    set({
      sellerLoggedIn: true,
      otpVerified: true,
      sellerRole: 'seller',
    });
    persistState(get());
  },

  grantExistingSellerAccess: () => {
    const access = readSellerAccess();
    const ownerName =
      access?.name?.trim() || access?.sellerName?.trim() || get().profile.ownerName;
    const companyName = access?.sellerName?.trim();

    set({
      sellerLoggedIn: true,
      otpVerified: true,
      sellerRole: 'seller',
      sellerProfileCompleted: true,
      verificationSubmitted: true,
      dashboardAccess: true,
      profile: {
        ownerName,
        companyInitials: toInitials(ownerName, get().profile.companyInitials || 'PT'),
      },
      ...(companyName ? { company: { ...get().company, companyName } } : {}),
    });
    persistState(get());
  },

  refreshSellerAccount: () => {
    if (accountRequest) return accountRequest;

    set({ accountStatus: get().account ? 'ready' : 'loading', accountError: null });
    accountRequest = (async () => {
      try {
        const { summary, accountManagers } = await fetchSellerAccountProfile();
        cacheSellerAccount(summary);
        set({
          ...identityFromAccount(get(), summary),
          account: summary,
          accountManagers,
          accountStatus: 'ready',
          accountError: null,
        });
        persistState(get());
        return summary;
      } catch (error) {
        set({
          accountStatus: get().account ? 'ready' : 'error',
          accountError: sellerAuthErrorMessage(error, 'Could not load seller profile.'),
        });
        return get().account;
      } finally {
        accountRequest = null;
      }
    })();
    return accountRequest;
  },

  saveCompany: (company: SellerCompany) => {
    set({
      company,
    });
    persistState(get());
  },

  setDocument: (documentId: SellerDocumentId, patch) => {
    const nextDocuments = cloneDocumentsWithPatch(get(), documentId, patch);
    set({ documents: nextDocuments });
    persistState(get());
  },

  submitVerification: () => {
    set({
      verificationSubmitted: true,
      dashboardAccess: true,
      sellerProfileCompleted: true,
    });
    persistState(get());
  },

  logoutSeller: () => {
    clearSellerAccess();
    clearCachedSellerAccount();
    resetSellerSession();
    set({
      ...buildDefaultSellerSnapshot(),
      account: null,
      accountManagers: [],
      accountStatus: 'idle',
      accountError: null,
      isHydrated: true,
    });
  },
}));
