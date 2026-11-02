import { isAxiosError } from 'axios';

import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';
import { putFileToSignedUrl } from '@/services/customer-credit';
import type {
  CatalogueMatch,
  CreateGradeRequestInput,
  GradeRequest,
  GradeRequestDocumentType,
  GradeRequestPage,
  GradeRequestPrefill,
  GradeRequestStatus,
} from '@/types/grade-request';

type Envelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

export type GradeRequestRole = 'customer' | 'seller';

export const gradeRequestBasePath = (role: GradeRequestRole): string => `/${role}/grade-requests`;

/** Structured failure so the form can react to duplicate / already-in-catalogue cases. */
export class GradeRequestError extends Error {
  code?: string;
  status?: number;
  matches?: CatalogueMatch[];
  existing?: { id: string; referenceNumber: string; status: GradeRequestStatus };

  constructor(message: string, init: Partial<GradeRequestError> = {}) {
    super(message);
    this.name = 'GradeRequestError';
    Object.assign(this, init);
  }
}

export const toGradeRequestError = (error: unknown, fallback: string): GradeRequestError => {
  if (error instanceof GradeRequestError) return error;
  if (isAxiosError(error)) {
    if (!error.response) {
      return new GradeRequestError(
        'Unable to reach PolyStoreX. Check your connection and try again.',
        { code: 'NETWORK' },
      );
    }
    const data = (error.response.data ?? {}) as {
      message?: string | string[];
      code?: string;
      details?: {
        matches?: CatalogueMatch[];
        existing?: GradeRequestError['existing'];
      };
    };
    const message = Array.isArray(data.message) ? data.message[0] : data.message;
    return new GradeRequestError(message || fallback, {
      code: data.code,
      status: error.response.status,
      matches: data.details?.matches,
      existing: data.details?.existing,
    });
  }
  return new GradeRequestError(error instanceof Error && error.message ? error.message : fallback);
};

const unwrap = async <T>(promise: Promise<{ data: Envelope<T> }>): Promise<T> =>
  (await promise).data.data;

export const newIdempotencyKey = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

export type PickedGradeRequestFile = {
  uri: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  documentType: GradeRequestDocumentType;
};

/**
 * Grade-request client bound to one role. The customer and seller backends expose the
 * same envelope and view model, only the base path (and session) differ.
 */
export const createGradeRequestApi = (role: GradeRequestRole) => {
  const BASE = gradeRequestBasePath(role);

  async function run<T>(fn: () => Promise<T>, fallback: string): Promise<T> {
    try {
      await ensureDevBackendSession(role);
      return await fn();
    } catch (error) {
      throw toGradeRequestError(error, fallback);
    }
  }

  const fetchPrefill = (): Promise<GradeRequestPrefill> =>
    run(
      () => unwrap<GradeRequestPrefill>(apiClient.get(`${BASE}/prefill`)),
      'Unable to load your details.',
    );

  const create = (input: CreateGradeRequestInput): Promise<GradeRequest> =>
    run(
      () => unwrap<GradeRequest>(apiClient.post(BASE, input)),
      'We could not submit your request. Please try again.',
    );

  const fetchList = (page = 1, limit = 20): Promise<GradeRequestPage> =>
    run(async () => {
      const res = await apiClient.get<Envelope<GradeRequest[]>>(BASE, {
        params: { page, limit },
      });
      const items = res.data.data ?? [];
      const meta = res.data.meta;
      return {
        items,
        page: meta?.page ?? page,
        totalPages: meta?.totalPages ?? 1,
        total: meta?.total ?? items.length,
      };
    }, 'Unable to load your grade requests.');

  const fetchOne = (id: string): Promise<GradeRequest> =>
    run(
      () => unwrap<GradeRequest>(apiClient.get(`${BASE}/${encodeURIComponent(id)}`)),
      'Unable to load this request.',
    );

  const respond = (id: string, message: string): Promise<GradeRequest> =>
    run(
      () =>
        unwrap<GradeRequest>(
          apiClient.post(`${BASE}/${encodeURIComponent(id)}/respond`, { message }),
        ),
      'Unable to send your response.',
    );

  const cancel = (id: string, reason?: string): Promise<GradeRequest> =>
    run(
      () =>
        unwrap<GradeRequest>(
          apiClient.post(`${BASE}/${encodeURIComponent(id)}/cancel`, { reason }),
        ),
      'Unable to cancel this request.',
    );

  /**
   * Attach a file to an already-submitted request. A failure never loses the request —
   * it is saved already — so callers report it and let the user retry.
   */
  const uploadDocument = async (requestId: string, file: PickedGradeRequestFile): Promise<void> => {
    const created = await run(
      () =>
        unwrap<{ id: string; uploadUrl?: string | null }>(
          apiClient.post(`${BASE}/${encodeURIComponent(requestId)}/documents`, {
            documentType: file.documentType,
            fileName: file.fileName,
            mimeType: file.mimeType,
            fileSizeBytes: file.fileSizeBytes,
          }),
        ),
      'Unable to attach the file.',
    );
    if (!created?.uploadUrl) {
      throw new GradeRequestError(
        'File storage is not available right now. Your request was saved; you can attach files later.',
        { code: 'STORAGE_UNAVAILABLE' },
      );
    }
    try {
      await putFileToSignedUrl(created.uploadUrl, { uri: file.uri, mimeType: file.mimeType });
    } catch (error) {
      throw toGradeRequestError(error, 'File upload failed. Please try again.');
    }
  };

  const fetchDocumentUrl = (requestId: string, documentId: string): Promise<string | null> =>
    run(async () => {
      const data = await unwrap<{ url: string | null }>(
        apiClient.get(
          `${BASE}/${encodeURIComponent(requestId)}/documents/${encodeURIComponent(documentId)}/download`,
        ),
      );
      return data?.url ?? null;
    }, 'Unable to open the document.');

  return {
    role,
    fetchPrefill,
    create,
    fetchList,
    fetchOne,
    respond,
    cancel,
    uploadDocument,
    fetchDocumentUrl,
  };
};

export type GradeRequestApi = ReturnType<typeof createGradeRequestApi>;

/** Customer-bound API; the named exports below keep existing call sites working. */
export const customerGradeRequestApi: GradeRequestApi = createGradeRequestApi('customer');

export const fetchGradeRequestPrefill = customerGradeRequestApi.fetchPrefill;
export const createGradeRequest = customerGradeRequestApi.create;
export const fetchGradeRequests = customerGradeRequestApi.fetchList;
export const fetchGradeRequest = customerGradeRequestApi.fetchOne;
export const respondToGradeRequest = customerGradeRequestApi.respond;
export const cancelGradeRequest = customerGradeRequestApi.cancel;
export const uploadGradeRequestDocument = customerGradeRequestApi.uploadDocument;
export const fetchGradeRequestDocumentUrl = customerGradeRequestApi.fetchDocumentUrl;
