import { useCallback, useMemo, useRef, useState } from 'react';

import * as DocumentPicker from 'expo-document-picker';

import {
  ALLOWED_DOCUMENT_TYPES,
  INITIAL_DOCUMENTS,
  MAX_DOCUMENT_SIZE_BYTES,
} from '@/constants/documents';
import type { DocumentId, DocumentItem } from '@/types/document';

const UPLOAD_DURATION_MS = 1600;
const UPLOAD_TICK_MS = 40;

export const useDocumentUpload = (initialDocuments: DocumentItem[] = INITIAL_DOCUMENTS) => {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const timersRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const clearTimer = useCallback((id: DocumentId) => {
    const timer = timersRef.current[id];
    if (timer) {
      clearInterval(timer);
      delete timersRef.current[id];
    }
  }, []);

  const updateDocument = useCallback((id: DocumentId, patch: Partial<DocumentItem>) => {
    setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc)));
  }, []);

  const animateUpload = useCallback(
    (id: DocumentId, fileName: string, uri: string, size: number, mimeType?: string | null) => {
      clearTimer(id);
      updateDocument(id, {
        status: 'uploading',
        progress: 0,
        errorMessage: undefined,
        file: { name: fileName, uri, size, mimeType },
      });

      const startedAt = Date.now();
      timersRef.current[id] = setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const progress = Math.min(100, Math.round((elapsed / UPLOAD_DURATION_MS) * 100));

        if (progress >= 100) {
          clearTimer(id);
          updateDocument(id, {
            status: 'verified',
            progress: 100,
          });
          return;
        }

        updateDocument(id, { progress, status: 'uploading' });
      }, UPLOAD_TICK_MS);
    },
    [clearTimer, updateDocument],
  );

  const pickDocument = useCallback(
    async (id: DocumentId) => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: [...ALLOWED_DOCUMENT_TYPES],
          copyToCacheDirectory: true,
          multiple: false,
        });

        if (result.canceled || !result.assets?.[0]) {
          return;
        }

        const asset = result.assets[0];
        const size = asset.size ?? 0;

        if (size > MAX_DOCUMENT_SIZE_BYTES) {
          updateDocument(id, {
            status: 'error',
            progress: 0,
            errorMessage: 'File must be 10 MB or smaller.',
            file: undefined,
          });
          return;
        }

        animateUpload(id, asset.name, asset.uri, size, asset.mimeType);
      } catch {
        updateDocument(id, {
          status: 'error',
          progress: 0,
          errorMessage: 'Unable to open document picker.',
          file: undefined,
        });
      }
    },
    [animateUpload, updateDocument],
  );

  const allVerified = useMemo(
    () => documents.every((doc) => doc.status === 'verified'),
    [documents],
  );

  const isUploading = useMemo(
    () => documents.some((doc) => doc.status === 'uploading'),
    [documents],
  );

  return {
    documents,
    pickDocument,
    allVerified,
    isUploading,
  };
};
