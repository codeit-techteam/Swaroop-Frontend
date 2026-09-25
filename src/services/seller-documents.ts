import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';

type Envelope<T> = {
  success?: boolean;
  data: T;
  message?: string;
};

export type SellerDocumentDownload = {
  url: string;
  fileName?: string;
  expiresAt?: string;
};

async function withSellerSession<T>(fn: () => Promise<T>): Promise<T> {
  await ensureDevBackendSession('seller');
  return fn();
}

export async function fetchSellerDocumentDownload(
  id: string,
): Promise<SellerDocumentDownload> {
  return withSellerSession(async () => {
    const response = await apiClient.get<
      Envelope<{ url?: string; downloadUrl?: string; fileName?: string; expiresAt?: string }>
    >(`/seller/documents/${id}/download`);
    const data = response.data.data ?? {};
    const url = data.url ?? data.downloadUrl ?? '';
    if (!url) {
      throw new Error('Document download URL was not issued');
    }
    return {
      url,
      fileName: data.fileName,
      expiresAt: data.expiresAt,
    };
  });
}

export async function fetchSellerDocumentPreview(
  id: string,
): Promise<SellerDocumentDownload> {
  return withSellerSession(async () => {
    const response = await apiClient.get<
      Envelope<{ url?: string; previewUrl?: string; fileName?: string; expiresAt?: string }>
    >(`/seller/documents/${id}/preview`);
    const data = response.data.data ?? {};
    const url = data.url ?? data.previewUrl ?? '';
    if (!url) {
      throw new Error('Document preview URL was not issued');
    }
    return {
      url,
      fileName: data.fileName,
      expiresAt: data.expiresAt,
    };
  });
}
