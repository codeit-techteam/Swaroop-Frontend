import { create } from 'zustand';

import { EMPTY_BUSINESS_INFO, INITIAL_DOCUMENTS } from '@/constants/documents';
import type { DocumentItem } from '@/types/document';
import type { BusinessInformation, KycStore } from '@/types/kyc';

export const useKycStore = create<KycStore>((set) => ({
  businessInfo: EMPTY_BUSINESS_INFO,
  documents: INITIAL_DOCUMENTS.map((doc) => ({ ...doc })),
  referenceId: null,

  setBusinessInfo: (info: BusinessInformation) => set({ businessInfo: info }),

  updateBusinessInfo: (patch) =>
    set((state) => ({
      businessInfo: { ...state.businessInfo, ...patch },
    })),

  setDocuments: (documents) => set({ documents }),

  updateDocument: (id, patch) =>
    set((state) => ({
      documents: state.documents.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc)),
    })),

  setReferenceId: (referenceId) => set({ referenceId }),

  resetKyc: () =>
    set({
      businessInfo: EMPTY_BUSINESS_INFO,
      documents: INITIAL_DOCUMENTS.map((doc) => ({ ...doc })),
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
