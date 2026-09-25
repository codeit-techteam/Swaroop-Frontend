import { Platform } from 'react-native';

import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';
import type {
  CreditApplication,
  CreditApplicationStatusSnapshot,
  CreditDocumentPick,
  CreditDraftInput,
  CreditEligibility,
  CreditLimit,
  CreditSummary,
  CreditTimelineEvent,
} from '@/types/customer-credit';
import { logger } from '@/utils/logger';

type Envelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

type CreatedCreditDocument = {
  id: string;
  documentNumber: string | null;
  fileName: string;
  mimeType: string | null;
  documentType: string;
  uploadUrl?: string;
  storageConfigured?: boolean;
};

type CreditDocumentUploadUrl = {
  id: string;
  uploadUrl: string;
  storageKey: string;
};

type CreditDocumentDownload = {
  id: string;
  fileName: string;
  url: string | null;
  storagePending?: boolean;
};

const BASE = '/customer/credit';

async function withCustomerSession<T>(fn: () => Promise<T>): Promise<T> {
  await ensureDevBackendSession('customer');
  return fn();
}

async function getJson<T>(path: string): Promise<T> {
  const response = await apiClient.get<Envelope<T>>(path);
  return response.data.data;
}

async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const response = await apiClient.post<Envelope<T>>(path, body ?? {});
  return response.data.data;
}

// -----------------------------------------------------------------------------
// Reads
// -----------------------------------------------------------------------------

export function fetchCreditLimit(): Promise<CreditLimit> {
  return withCustomerSession(() => getJson<CreditLimit>(`${BASE}/limit`));
}

export function fetchCreditSummary(): Promise<CreditSummary> {
  return withCustomerSession(() => getJson<CreditSummary>(`${BASE}/summary`));
}

export function fetchCreditEligibility(): Promise<CreditEligibility> {
  return withCustomerSession(() => getJson<CreditEligibility>(`${BASE}/eligibility`));
}

/** Latest application for the signed-in customer, or null when none exists. */
export function fetchLatestCreditApplication(): Promise<CreditApplication | null> {
  return withCustomerSession(() => getJson<CreditApplication | null>(`${BASE}/application`));
}

export function fetchCreditApplication(id: string): Promise<CreditApplication> {
  return withCustomerSession(() => getJson<CreditApplication>(`${BASE}/applications/${id}`));
}

export function fetchCreditApplicationStatus(
  id: string,
): Promise<CreditApplicationStatusSnapshot> {
  return withCustomerSession(() =>
    getJson<CreditApplicationStatusSnapshot>(`${BASE}/applications/${id}/status`),
  );
}

export function fetchCreditApplicationTimeline(id: string): Promise<CreditTimelineEvent[]> {
  return withCustomerSession(async () => {
    const events = await getJson<CreditTimelineEvent[]>(`${BASE}/applications/${id}/timeline`);
    return events ?? [];
  });
}

// -----------------------------------------------------------------------------
// Application lifecycle
// -----------------------------------------------------------------------------

/** Creates the open draft, or updates it when one already exists. */
export function saveCreditApplicationDraft(input: CreditDraftInput): Promise<CreditApplication> {
  return withCustomerSession(() =>
    postJson<CreditApplication>(`${BASE}/applications`, {
      requestedLimit: input.requestedLimit,
      requestedTenureDays: input.requestedTenureDays,
      purpose: input.purpose?.trim() ? input.purpose.trim() : undefined,
    }),
  );
}

export function submitCreditApplication(id: string): Promise<{
  id: string;
  applicationNumber: string;
  status: string;
  submittedAt: string | null;
  nextStep: string;
}> {
  return withCustomerSession(() => postJson(`${BASE}/applications/${id}/submit`));
}

export function resubmitCreditDocuments(
  id: string,
  message?: string,
): Promise<{ id: string; applicationNumber: string; status: string; nextStep: string }> {
  return withCustomerSession(() =>
    postJson(`${BASE}/applications/${id}/resubmit-documents`, {
      message: message?.trim() ? message.trim() : undefined,
    }),
  );
}

// -----------------------------------------------------------------------------
// Documents
// -----------------------------------------------------------------------------

export function createCreditApplicationDocument(
  applicationId: string,
  input: { documentType: string } & Omit<CreditDocumentPick, 'uri'>,
): Promise<CreatedCreditDocument> {
  return withCustomerSession(() =>
    postJson<CreatedCreditDocument>(`${BASE}/applications/${applicationId}/documents`, {
      documentType: input.documentType,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSizeBytes: input.fileSizeBytes,
    }),
  );
}

export function replaceCreditApplicationDocument(
  applicationId: string,
  documentId: string,
  input: Omit<CreditDocumentPick, 'uri'>,
): Promise<CreatedCreditDocument> {
  return withCustomerSession(() =>
    postJson<CreatedCreditDocument>(
      `${BASE}/applications/${applicationId}/documents/${documentId}/replace`,
      {
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSizeBytes: input.fileSizeBytes,
      },
    ),
  );
}

export function fetchCreditDocumentUploadUrl(
  applicationId: string,
  documentId: string,
): Promise<CreditDocumentUploadUrl> {
  return withCustomerSession(() =>
    getJson<CreditDocumentUploadUrl>(
      `${BASE}/applications/${applicationId}/documents/${documentId}/upload-url`,
    ),
  );
}

export function fetchCreditDocumentDownload(
  applicationId: string,
  documentId: string,
): Promise<CreditDocumentDownload> {
  return withCustomerSession(() =>
    getJson<CreditDocumentDownload>(
      `${BASE}/applications/${applicationId}/documents/${documentId}/download`,
    ),
  );
}

/**
 * PUTs a locally picked file to the signed storage URL.
 *
 * Native uses the expo-file-system binary upload so large PDFs stream from
 * disk; web falls back to a blob fetch because the picker hands back an
 * in-memory object URL.
 */
export async function putFileToSignedUrl(
  uploadUrl: string,
  file: Pick<CreditDocumentPick, 'uri' | 'mimeType'>,
): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(file.uri)).blob();
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': file.mimeType },
    });
    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }
    return;
  }

  const { File, UploadType } = await import('expo-file-system');
  const result = await new File(file.uri).upload(uploadUrl, {
    httpMethod: 'PUT',
    uploadType: UploadType.BINARY_CONTENT,
    mimeType: file.mimeType,
    headers: { 'Content-Type': file.mimeType },
  });

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Upload failed with status ${result.status}`);
  }
}

/**
 * Registers a document against the application and pushes the bytes to
 * storage. Returns the created document id so callers can replace it later.
 *
 * When object storage is not configured on the backend no `uploadUrl` is
 * issued; the metadata row still exists so the reviewer can chase the file.
 */
export async function uploadCreditDocument(
  applicationId: string,
  documentType: string,
  file: CreditDocumentPick,
): Promise<{ documentId: string; storagePending: boolean }> {
  const created = await createCreditApplicationDocument(applicationId, {
    documentType,
    fileName: file.fileName,
    mimeType: file.mimeType,
    fileSizeBytes: file.fileSizeBytes,
  });

  const uploadUrl = created.uploadUrl ?? (await resolveUploadUrl(applicationId, created.id));
  if (!uploadUrl) {
    logger.warn('Credit document created without storage URL', { documentId: created.id });
    return { documentId: created.id, storagePending: true };
  }

  await putFileToSignedUrl(uploadUrl, file);
  return { documentId: created.id, storagePending: false };
}

/** Replaces an existing document (rejected or superseded) with a new file. */
export async function replaceCreditDocument(
  applicationId: string,
  documentId: string,
  file: CreditDocumentPick,
): Promise<{ documentId: string; storagePending: boolean }> {
  const replaced = await replaceCreditApplicationDocument(applicationId, documentId, {
    fileName: file.fileName,
    mimeType: file.mimeType,
    fileSizeBytes: file.fileSizeBytes,
  });

  const uploadUrl = replaced.uploadUrl ?? (await resolveUploadUrl(applicationId, documentId));
  if (!uploadUrl) {
    logger.warn('Credit document replaced without storage URL', { documentId });
    return { documentId, storagePending: true };
  }

  await putFileToSignedUrl(uploadUrl, file);
  return { documentId, storagePending: false };
}

async function resolveUploadUrl(
  applicationId: string,
  documentId: string,
): Promise<string | null> {
  try {
    const issued = await fetchCreditDocumentUploadUrl(applicationId, documentId);
    return issued.uploadUrl || null;
  } catch {
    return null;
  }
}
