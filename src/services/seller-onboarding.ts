import { isAxiosError } from 'axios';

import { apiClient } from '@/api/client';
import type {
  SellerBankDetails,
  SellerCompany,
  SellerDocument,
  SellerDocumentId,
} from '@/seller/types';
import { ensureDevBackendSession } from '@/services/backend-session';
import { putFileToSignedUrl } from '@/services/customer-credit';

type Envelope<T> = {
  success?: boolean;
  message?: string | string[];
  data: T;
};

export type StoredSellerOnboardingDocument = {
  id: string;
  slot: string | null;
  category: string;
  fileName: string;
  mimeType?: string | null;
  fileSizeBytes?: string | null;
  status: string;
  r2Confirmed: boolean;
  rejectionReason?: string | null;
  uploadedAt?: string;
};

export type SellerOnboardingDocumentSlot = {
  slot: SellerDocumentId;
  name: string;
  required: boolean;
  document: StoredSellerOnboardingDocument | null;
};

export type SellerOnboardingFile = {
  uri: string;
  name: string;
  size: number;
  mimeType?: string | null;
};

export type SellerChangeRequest = {
  reason: string;
  documentIds: string[];
  slots: string[];
  requestedAt: string;
};

export type SellerOnboardingStatus = {
  status: string;
  sellerStatus?: string | null;
  currentStep?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  rejectedReason?: string | null;
  changeRequest?: SellerChangeRequest | null;
  canResubmit?: boolean;
};

/** Must match the backend onboarding MIME allow-list. */
export const SELLER_ONBOARDING_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

/** Backend default STORAGE_MAX_DOCUMENT_SIZE_MB; the API re-validates. */
export const SELLER_ONBOARDING_MAX_BYTES = 10 * 1024 * 1024;

async function withSellerSession<T>(fn: () => Promise<T>): Promise<T> {
  await ensureDevBackendSession('seller');
  return fn();
}

export function resolveSellerOnboardingMime(file: SellerOnboardingFile): string {
  const type = file.mimeType?.toLowerCase();
  if (type && (SELLER_ONBOARDING_MIME_TYPES as readonly string[]).includes(type)) {
    return type;
  }
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'webp') return 'image/webp';
  throw new Error('Unsupported file type. Upload a PDF, JPG, PNG or WEBP file.');
}

export function sellerOnboardingErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message) return message;
    if (Array.isArray(message) && message[0]) return String(message[0]);
    if (!error.response) {
      return 'Unable to reach PetroTrade. Check your connection and try again.';
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** Maps the backend slot record onto the local upload card state. */
export function toSellerDocumentPatch(
  doc: StoredSellerOnboardingDocument | null,
): Partial<SellerDocument> {
  if (!doc || !doc.r2Confirmed) {
    return {
      status: 'idle',
      progress: 0,
      file: undefined,
      remoteId: undefined,
      reviewStatus: undefined,
      errorMessage: undefined,
    };
  }
  const size = Number(doc.fileSizeBytes ?? 0);
  const file = {
    name: doc.fileName,
    uri: '',
    size: Number.isFinite(size) ? size : 0,
    mimeType: doc.mimeType ?? undefined,
  };
  if (doc.status === 'REJECTED') {
    return {
      status: 'error',
      progress: 0,
      file,
      remoteId: doc.id,
      reviewStatus: 'rejected',
      errorMessage: `Rejected by PetroTrade: ${doc.rejectionReason ?? 'please upload a clearer copy'}. Upload a new file.`,
    };
  }
  return {
    status: 'uploaded',
    progress: 100,
    file,
    remoteId: doc.id,
    reviewStatus: doc.status === 'VERIFIED' ? 'verified' : 'pending_review',
    errorMessage: undefined,
  };
}

export function listSellerOnboardingDocuments(): Promise<SellerOnboardingDocumentSlot[]> {
  return withSellerSession(async () => {
    const response = await apiClient.get<Envelope<{ slots: SellerOnboardingDocumentSlot[] }>>(
      '/seller/onboarding/documents',
    );
    return response.data.data?.slots ?? [];
  });
}

/**
 * Creates the onboarding document row, streams the file to the signed R2 URL,
 * then confirms so the backend verifies the object and queues it for admin review.
 */
export function uploadSellerOnboardingDocument(
  slot: SellerDocumentId,
  file: SellerOnboardingFile,
  onStage?: (progress: number) => void,
): Promise<StoredSellerOnboardingDocument> {
  return withSellerSession(async () => {
    const mimeType = resolveSellerOnboardingMime(file);
    if (file.size > SELLER_ONBOARDING_MAX_BYTES) {
      throw new Error('File is larger than 10 MB. Upload a smaller copy.');
    }

    const created = await apiClient.post<Envelope<{ id: string; uploadUrl?: string | null }>>(
      '/seller/onboarding/documents',
      {
        slot,
        fileName: file.name,
        mimeType,
        fileSizeBytes: file.size,
        source: 'SELLER_APP',
      },
    );
    const { id, uploadUrl } = created.data.data ?? {};
    if (!id || !uploadUrl) {
      throw new Error('Storage upload URL was not issued. Please try again.');
    }
    onStage?.(30);

    try {
      await putFileToSignedUrl(uploadUrl, { uri: file.uri, mimeType });
      onStage?.(85);
      const confirmed = await apiClient.post<Envelope<StoredSellerOnboardingDocument>>(
        `/seller/onboarding/documents/${id}/confirm`,
      );
      onStage?.(100);
      return confirmed.data.data;
    } catch (error) {
      await apiClient.delete(`/seller/onboarding/documents/${id}`).catch(() => undefined);
      throw error;
    }
  });
}

function buildDraftSections(company: SellerCompany, currentStep: string) {
  const bank: SellerBankDetails = company;
  return {
    currentStep,
    companyData: {
      name: company.companyName,
      legalName: company.companyName,
      businessType: company.entityType,
      industry: company.natureOfBusiness,
      phone: company.mobile,
      email: company.businessEmail,
      registeredAddress: company.address,
    },
    gstData: {
      gstin: company.gst,
      state: company.gstState,
      stateCode: company.gstStateCode,
      pan: company.pan,
      status: company.gstVerified ? 'verified' : 'pending',
    },
    panData: { pan: company.pan },
    bankData: {
      accountHolder: bank.accountHolderName,
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      ifsc: bank.ifscCode,
    },
    addressData: {
      line1: company.address,
      city: company.city,
      state: company.state,
      postalCode: company.pincode,
      country: 'IN',
    },
    metadata: { source: 'SELLER_APP' },
  };
}

function isNotFound(error: unknown) {
  return isAxiosError(error) && error.response?.status === 404;
}

/** Upserts the backend onboarding draft so admins see the business details. */
export function saveSellerOnboardingDraft(
  company: SellerCompany,
  currentStep: string,
): Promise<void> {
  return withSellerSession(async () => {
    const sections = buildDraftSections(company, currentStep);
    try {
      await apiClient.patch('/seller/onboarding', sections);
    } catch (error) {
      if (!isNotFound(error)) throw error;
      await apiClient.post('/seller/onboarding', {
        ...sections,
        companyName: company.companyName,
        email: company.businessEmail || undefined,
        phone: company.mobile || undefined,
      });
    }
  });
}

export function submitSellerOnboarding(company: SellerCompany): Promise<SellerOnboardingStatus> {
  return withSellerSession(async () => {
    await saveSellerOnboardingDraft(company, 'review');
    const response = await apiClient.post<Envelope<SellerOnboardingStatus>>(
      '/seller/onboarding/submit',
    );
    return response.data.data;
  });
}

/**
 * Resubmits after an admin change request or rejection. Unlike
 * `submitSellerOnboarding` it does not push the local draft, which may be empty
 * on a fresh install and would overwrite the details already on the server.
 */
export function resubmitSellerOnboarding(): Promise<SellerOnboardingStatus> {
  return withSellerSession(async () => {
    const response = await apiClient.post<Envelope<SellerOnboardingStatus>>(
      '/seller/onboarding/submit',
    );
    return response.data.data;
  });
}

export function fetchSellerOnboardingStatus(): Promise<SellerOnboardingStatus | null> {
  return withSellerSession(async () => {
    try {
      const response = await apiClient.get<Envelope<SellerOnboardingStatus>>(
        '/seller/onboarding/status',
      );
      return response.data.data;
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  });
}
