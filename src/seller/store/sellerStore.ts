import { create } from 'zustand';

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

export const useSellerStore = create<SellerStore>((set, get) => ({
  ...baseSnapshot,
  isHydrated: false,

  hydrateSellerSession: () => {
    set({
      ...getSellerSnapshot(),
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
    resetSellerSession();
    set({
      ...buildDefaultSellerSnapshot(),
      isHydrated: true,
    });
  },
}));
