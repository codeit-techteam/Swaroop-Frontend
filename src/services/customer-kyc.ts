import { isAxiosError } from 'axios';

import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';
import { putFileToSignedUrl } from '@/services/customer-credit';
import type { DocumentFile, DocumentItem, KycDocumentId } from '@/types/document';
import type { BusinessInformation } from '@/types/kyc';

type Envelope<T> = {
  success?: boolean;
  message?: string | string[];
  data: T;
};

export type CustomerKycStatus =
  'NOT_SUBMITTED' | 'SUBMITTED' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED';

type BackendSlot = 'pan' | 'gst' | 'aadhaar' | 'cancelledCheque';

export type CustomerKycDocument = {
  id: string;
  slot: string | null;
  fileName: string;
  mimeType: string | null;
  fileSizeBytes: string | null;
  status: string;
  r2Confirmed: boolean;
  rejectionReason: string | null;
  uploadedAt: string;
};

export type CustomerKycChangeRequest = {
  reason: string;
  documentIds: string[];
  slots: string[];
  requestedAt: string;
};

export type CustomerKycSlot = {
  slot: BackendSlot;
  name: string;
  required: boolean;
  changeRequested: boolean;
  document: CustomerKycDocument | null;
};

export type KycVerificationStatus = 'VERIFYING' | 'VERIFIED' | 'FAILED' | 'MANUAL_REVIEW';

export type KycVerificationDetails = {
  legalName?: string | null;
  tradeName?: string | null;
  gstStatus?: string | null;
  registrationDate?: string | null;
  address?: string | null;
  state?: string | null;
  pincode?: string | null;
  nameOnPan?: string | null;
  panStatus?: string | null;
  panCategory?: string | null;
};

export type KycVerification = {
  id: string;
  type: 'PAN' | 'GST';
  status: KycVerificationStatus;
  method: 'PROVIDER' | 'MANUAL' | null;
  identifierMasked: string;
  details: KycVerificationDetails;
  failureCode: string | null;
  message: string;
  verifiedAt: string | null;
  createdAt: string;
};

export type KycVerifyResult = KycVerification & { warning: string | null };

export type KycChecklistItem = {
  key: 'pan' | 'gst' | 'documents' | 'review';
  label: string;
  state: 'done' | 'pending' | 'attention' | 'todo';
  detail: string;
};

export type CustomerKycOverview = {
  status: CustomerKycStatus;
  /** Backend decision; the only signal that unlocks the customer home. */
  kycVerified: boolean;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  rejectedReason: string | null;
  changeRequest: CustomerKycChangeRequest | null;
  locked: boolean;
  canSubmit: boolean;
  missingRequired: string[];
  verifications: { pan: KycVerification | null; gst: KycVerification | null };
  checklist: KycChecklistItem[];
  organization: {
    name: string | null;
    legalName: string | null;
    gstin: string | null;
    pan: string | null;
  };
  slots: CustomerKycSlot[];
};

/** Must match the backend document MIME allow-list. */
export const CUSTOMER_KYC_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

/** Backend default STORAGE_MAX_DOCUMENT_SIZE_MB; the API re-validates. */
export const CUSTOMER_KYC_MAX_BYTES = 10 * 1024 * 1024;

export const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export function normalizeIdentifier(value: string): string {
  return value.toUpperCase().replace(/[\s-]/g, '');
}

/** VERIFIED, or accepted for manual confirmation by the compliance team. */
export function verificationAccepted(verification: KycVerification | null | undefined): boolean {
  return verification?.status === 'VERIFIED' || verification?.status === 'MANUAL_REVIEW';
}

export function toBackendKycSlot(id: KycDocumentId): BackendSlot {
  return id === 'cancelled_cheque' ? 'cancelledCheque' : id;
}

export function fromBackendKycSlot(slot: string): KycDocumentId | null {
  if (slot === 'cancelledCheque') return 'cancelled_cheque';
  if (slot === 'pan' || slot === 'gst' || slot === 'aadhaar') return slot;
  return null;
}

async function withCustomerSession<T>(fn: () => Promise<T>): Promise<T> {
  await ensureDevBackendSession('customer');
  return fn();
}

function resolveMime(file: DocumentFile): string {
  const type = file.mimeType?.toLowerCase();
  if (type && (CUSTOMER_KYC_MIME_TYPES as readonly string[]).includes(type)) return type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'webp') return 'image/webp';
  throw new Error('Unsupported file type. Upload a PDF, JPG, PNG or WEBP file.');
}

export function customerKycErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string | string[] }>(error)) {
    if (error.response?.status === 429) {
      return 'Too many attempts. Please wait a few minutes and try again.';
    }
    if (error.response && error.response.status >= 500) return fallback;
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

export function kycNeedsAction(status: CustomerKycStatus | undefined | null): boolean {
  return status === 'CHANGES_REQUESTED' || status === 'REJECTED';
}

/** Maps a backend slot record onto the local upload card state. */
export function toKycDocumentPatch(doc: CustomerKycDocument | null): Partial<DocumentItem> {
  if (!doc || !doc.r2Confirmed) {
    return { status: 'idle', progress: 0, file: undefined, errorMessage: undefined };
  }
  const size = Number(doc.fileSizeBytes ?? 0);
  const file: DocumentFile = {
    name: doc.fileName,
    uri: '',
    size: Number.isFinite(size) ? size : 0,
    mimeType: doc.mimeType,
  };
  if (doc.status === 'REJECTED') {
    return {
      status: 'rejected',
      progress: 0,
      file,
      errorMessage: doc.rejectionReason ? `Reason: ${doc.rejectionReason}` : undefined,
    };
  }
  return {
    status: doc.status === 'VERIFIED' ? 'verified' : 'uploaded',
    progress: 100,
    file,
    errorMessage: undefined,
  };
}

export function fetchCustomerKyc(): Promise<CustomerKycOverview> {
  return withCustomerSession(async () => {
    const response = await apiClient.get<Envelope<CustomerKycOverview>>('/customer/kyc');
    return response.data.data;
  });
}

/**
 * Creates the KYC document row, streams the file to the signed R2 URL, then
 * confirms so the backend verifies the object and queues it for admin review.
 */
export function uploadCustomerKycDocument(
  id: KycDocumentId,
  file: DocumentFile,
  onStage?: (progress: number) => void,
): Promise<CustomerKycDocument> {
  return withCustomerSession(async () => {
    const mimeType = resolveMime(file);
    if (file.size > CUSTOMER_KYC_MAX_BYTES) {
      throw new Error('File is larger than 10 MB. Upload a smaller copy.');
    }
    const created = await apiClient.post<Envelope<{ id: string; uploadUrl?: string | null }>>(
      '/customer/kyc/documents',
      {
        slot: toBackendKycSlot(id),
        fileName: file.name,
        mimeType,
        fileSizeBytes: file.size,
        source: 'CUSTOMER_APP',
      },
    );
    const { id: documentId, uploadUrl } = created.data.data ?? {};
    if (!documentId || !uploadUrl) {
      throw new Error('Storage upload URL was not issued. Please try again.');
    }
    onStage?.(30);
    try {
      await putFileToSignedUrl(uploadUrl, { uri: file.uri, mimeType });
      onStage?.(85);
      const confirmed = await apiClient.post<Envelope<CustomerKycDocument>>(
        `/customer/kyc/documents/${documentId}/confirm`,
      );
      onStage?.(100);
      return confirmed.data.data;
    } catch (error) {
      await apiClient.delete(`/customer/kyc/documents/${documentId}`).catch(() => undefined);
      throw error;
    }
  });
}

/** PAN and GSTIN come from the backend verification records, so only the name is sent. */
export function submitCustomerKyc(info?: BusinessInformation): Promise<CustomerKycOverview> {
  return withCustomerSession(async () => {
    const body: { businessName?: string } = {};
    const name = info?.businessEntityName.trim();
    if (name) body.businessName = name;
    const response = await apiClient.post<Envelope<CustomerKycOverview>>(
      '/customer/kyc/submit',
      body,
    );
    return response.data.data;
  });
}

/** PAN / GSTIN are checked server-side; provider credentials never reach the app. */
export function verifyCustomerPan(pan: string): Promise<KycVerifyResult> {
  return withCustomerSession(async () => {
    const response = await apiClient.post<Envelope<KycVerifyResult>>('/customer/kyc/pan/verify', {
      pan: normalizeIdentifier(pan),
    });
    return response.data.data;
  });
}

export function verifyCustomerGst(gstin: string): Promise<KycVerifyResult> {
  return withCustomerSession(async () => {
    const response = await apiClient.post<Envelope<KycVerifyResult>>('/customer/kyc/gst/verify', {
      gstin: normalizeIdentifier(gstin),
    });
    return response.data.data;
  });
}
