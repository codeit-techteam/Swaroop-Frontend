import { create } from 'zustand';

import { EMPTY_BUSINESS_INFO, INITIAL_DOCUMENTS } from '@/constants/documents';
import {
  getBusinessInfo,
  getDefaultBusinessInfo,
  getDefaultDocuments,
  getDocuments,
  saveBusinessInfo,
  saveDocuments,
} from '@/services/storage';
import type { DocumentItem } from '@/types/document';
import type { BusinessInformation, KycStore } from '@/types/kyc';

type KycStoreWithHydrate = KycStore & {
  hydrateKyc: () => void;
};

export const useKycStore = create<KycStoreWithHydrate>((set, get) => ({
  businessInfo: EMPTY_BUSINESS_INFO,
  documents: INITIAL_DOCUMENTS.map((doc) => ({ ...doc })),
  referenceId: null,

  hydrateKyc: () => {
    const businessInfo = getBusinessInfo() ?? getDefaultBusinessInfo();
    const documents = getDocuments() ?? getDefaultDocuments();
    set({
      businessInfo,
      documents,
    });
  },

  setBusinessInfo: (info: BusinessInformation) => {
    saveBusinessInfo(info);
    set({ businessInfo: info });
  },

  updateBusinessInfo: (patch) => {
    const businessInfo = { ...get().businessInfo, ...patch };
    saveBusinessInfo(businessInfo);
    set({ businessInfo });
  },

  setDocuments: (documents) => {
    saveDocuments(documents);
    set({ documents });
  },

  updateDocument: (id, patch) => {
    const documents = get().documents.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc));
    saveDocuments(documents);
    set({ documents });
  },

  setReferenceId: (referenceId) => set({ referenceId }),

  resetKyc: () =>
    set({
      businessInfo: getDefaultBusinessInfo(),
      documents: getDefaultDocuments(),
      referenceId: null,
    }),
}));

export const selectBusinessInfo = (state: KycStore): BusinessInformation => state.businessInfo;

export const selectDocuments = (state: KycStore): DocumentItem[] => state.documents;

export const selectReferenceId = (state: KycStore): string | null => state.referenceId;

export const selectMandatoryDocsReady = (state: KycStore): boolean =>
  state.documents
    .filter((doc) => doc.required)
    .every((doc) => doc.status === 'verified' || doc.status === 'uploaded');
