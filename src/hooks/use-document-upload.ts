import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import * as DocumentPicker from 'expo-document-picker';

import { MANDATORY_DOCUMENT_IDS, MAX_DOCUMENT_SIZE_BYTES } from '@/constants/documents';
import {
  CUSTOMER_KYC_MIME_TYPES,
  customerKycErrorMessage,
  fetchCustomerKyc,
  fromBackendKycSlot,
  toKycDocumentPatch,
  uploadCustomerKycDocument,
  type CustomerKycOverview,
} from '@/services/customer-kyc';
import { useKycStore } from '@/store/kyc-store';
import type { DocumentId, KycDocumentId } from '@/types/document';

const KYC_DOCUMENT_IDS = new Set<DocumentId>(['pan', 'gst', 'aadhaar', 'cancelled_cheque']);

/**
 * KYC document uploads backed by the customer KYC API: files go straight to R2
 * and the local store mirrors what the backend holds for each slot.
 */
export const useDocumentUpload = () => {
  const documents = useKycStore((state) => state.documents);
  const updateDocument = useKycStore((state) => state.updateDocument);
  const uploadingRef = useRef(new Set<DocumentId>());
  const [overview, setOverview] = useState<CustomerKycOverview | null>(null);
  const [syncing, setSyncing] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncAttempt, setSyncAttempt] = useState(0);

  const applyOverview = useCallback(
    (next: CustomerKycOverview) => {
      setOverview(next);
      for (const slot of next.slots) {
        const id = fromBackendKycSlot(slot.slot);
        if (!id || uploadingRef.current.has(id)) continue;
        updateDocument(id, toKycDocumentPatch(slot.document));
      }
    },
    [updateDocument],
  );

  useEffect(() => {
    let active = true;
    fetchCustomerKyc()
      .then((next) => {
        if (!active) return;
        applyOverview(next);
        setSyncError(null);
      })
      .catch((error: unknown) => {
        if (active) {
          setSyncError(customerKycErrorMessage(error, 'Could not load your uploaded documents.'));
        }
      })
      .finally(() => {
        if (active) setSyncing(false);
      });
    return () => {
      active = false;
    };
  }, [applyOverview, syncAttempt]);

  const retrySync = useCallback(() => {
    setSyncing(true);
    setSyncError(null);
    setSyncAttempt((attempt) => attempt + 1);
  }, []);

  const pickDocument = useCallback(
    async (id: DocumentId) => {
      if (!KYC_DOCUMENT_IDS.has(id)) return;
      const kycId = id as KycDocumentId;
      let asset: DocumentPicker.DocumentPickerAsset | undefined;
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: [...CUSTOMER_KYC_MIME_TYPES],
          copyToCacheDirectory: true,
          multiple: false,
        });
        if (result.canceled || !result.assets?.[0]) return;
        asset = result.assets[0];
      } catch {
        updateDocument(id, {
          status: 'error',
          progress: 0,
          errorMessage: 'Unable to open document picker.',
          file: undefined,
        });
        return;
      }

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

      const file = { name: asset.name, uri: asset.uri, size, mimeType: asset.mimeType };
      uploadingRef.current.add(id);
      updateDocument(id, { status: 'uploading', progress: 10, errorMessage: undefined, file });

      try {
        const stored = await uploadCustomerKycDocument(kycId, file, (progress) => {
          useKycStore.getState().updateDocument(id, { progress });
        });
        uploadingRef.current.delete(id);
        updateDocument(id, { ...toKycDocumentPatch(stored), file });
        fetchCustomerKyc()
          .then(applyOverview)
          .catch(() => undefined);
      } catch (error) {
        uploadingRef.current.delete(id);
        const message = customerKycErrorMessage(error, 'Upload failed. Please try again.');
        try {
          applyOverview(await fetchCustomerKyc());
        } catch {
          updateDocument(id, toKycDocumentPatch(null));
        }
        updateDocument(id, { errorMessage: message });
      }
    },
    [applyOverview, updateDocument],
  );

  const mandatoryReady = useMemo(
    () =>
      documents
        .filter((doc) =>
          MANDATORY_DOCUMENT_IDS.includes(doc.id as (typeof MANDATORY_DOCUMENT_IDS)[number]),
        )
        .every((doc) => doc.status === 'verified' || doc.status === 'uploaded'),
    [documents],
  );

  const isUploading = useMemo(
    () => documents.some((doc) => doc.status === 'uploading'),
    [documents],
  );

  return {
    documents,
    pickDocument,
    mandatoryReady,
    isUploading,
    overview,
    syncing,
    syncError,
    retrySync,
  };
};
