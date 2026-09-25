import { useCallback, useMemo, useState } from 'react';

import * as DocumentPicker from 'expo-document-picker';

import {
  replaceCreditDocument,
  uploadCreditDocument,
} from '@/services/customer-credit';
import type { CreditApplication } from '@/types/customer-credit';
import {
  CREDIT_ALLOWED_MIME_TYPES,
  CREDIT_MAX_DOCUMENT_SIZE_BYTES,
  REQUIRED_CREDIT_DOCUMENT_TYPES,
  type CreditDocumentType,
  creditDocumentDescription,
  creditDocumentLabel,
} from '@/types/customer-credit';
import type { DocumentId, DocumentItem } from '@/types/document';
import { getApiErrorMessage } from '@/api/client';

const REQUIRED_SET = new Set<string>(REQUIRED_CREDIT_DOCUMENT_TYPES);

/** Optional slots offered in addition to the three the backend enforces. */
const OPTIONAL_CREDIT_DOCUMENT_TYPES = [
  'gst_returns',
  'cancelled_cheque',
  'business_registration',
] as const;

const MAX_SIZE_LABEL = `${Math.round(CREDIT_MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024))} MB`;

type LocalState = {
  status: DocumentItem['status'];
  fileName?: string;
  errorMessage?: string;
};

type UseCreditDocumentsOptions = {
  application: CreditApplication | null;
  /** Called after a successful upload so the caller can refetch the application. */
  onUploaded: () => Promise<void> | void;
};

/** Maps a backend document status onto the card's visual states. */
function cardStatus(backendStatus: string | null | undefined): DocumentItem['status'] {
  if (backendStatus === 'REJECTED') return 'rejected';
  if (backendStatus === 'VERIFIED' || backendStatus === 'APPROVED') return 'verified';
  if (!backendStatus) return 'idle';
  return 'uploaded';
}

export const useCreditDocuments = ({
  application,
  onUploaded,
}: UseCreditDocumentsOptions) => {
  const [local, setLocal] = useState<Partial<Record<string, LocalState>>>({});

  const documentTypes = useMemo(() => {
    const required = (application?.requiredDocuments ?? []).map((item) => item.documentType);
    const fromBackend = required.length > 0 ? required : [...REQUIRED_CREDIT_DOCUMENT_TYPES];
    const extras = (application?.documents ?? [])
      .map((doc) => doc.documentType)
      .filter((type) => !fromBackend.includes(type));
    return [...fromBackend, ...new Set([...extras, ...OPTIONAL_CREDIT_DOCUMENT_TYPES])];
  }, [application?.documents, application?.requiredDocuments]);

  const documents = useMemo<DocumentItem[]>(
    () =>
      documentTypes.map((documentType) => {
        const requirement = application?.requiredDocuments?.find(
          (item) => item.documentType === documentType,
        );
        const uploaded = application?.documents?.find(
          (doc) => doc.documentType === documentType,
        );
        const localState = local[documentType];

        const status =
          localState?.status === 'uploading' || localState?.status === 'error'
            ? localState.status
            : cardStatus(uploaded?.status ?? requirement?.status ?? null);

        return {
          id: documentType as DocumentId,
          title: creditDocumentLabel(documentType),
          description: creditDocumentDescription(documentType),
          status,
          progress: status === 'uploading' ? 50 : status === 'idle' ? 0 : 100,
          required:
            requirement?.required ??
            REQUIRED_SET.has(documentType as CreditDocumentType),
          file:
            uploaded || localState?.fileName
              ? {
                  name: uploaded?.fileName ?? localState?.fileName ?? '',
                  uri: '',
                  size: Number(uploaded?.fileSizeBytes ?? 0),
                  mimeType: uploaded?.mimeType ?? null,
                }
              : undefined,
          errorMessage: localState?.errorMessage,
        };
      }),
    [application?.documents, application?.requiredDocuments, documentTypes, local],
  );

  const pickDocument = useCallback(
    async (documentType: DocumentId) => {
      if (!application) return;

      let asset: DocumentPicker.DocumentPickerAsset;
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: [...CREDIT_ALLOWED_MIME_TYPES],
          copyToCacheDirectory: true,
          multiple: false,
        });
        if (result.canceled || !result.assets?.[0]) return;
        asset = result.assets[0];
      } catch {
        setLocal((prev) => ({
          ...prev,
          [documentType]: { status: 'error', errorMessage: 'Unable to open document picker.' },
        }));
        return;
      }

      const size = asset.size ?? 0;
      if (size <= 0) {
        setLocal((prev) => ({
          ...prev,
          [documentType]: { status: 'error', errorMessage: 'Selected file appears to be empty.' },
        }));
        return;
      }
      if (size > CREDIT_MAX_DOCUMENT_SIZE_BYTES) {
        setLocal((prev) => ({
          ...prev,
          [documentType]: {
            status: 'error',
            errorMessage: `File must be ${MAX_SIZE_LABEL} or smaller.`,
          },
        }));
        return;
      }

      setLocal((prev) => ({
        ...prev,
        [documentType]: { status: 'uploading', fileName: asset.name },
      }));

      const existingId = application.documents?.find(
        (doc) => doc.documentType === documentType,
      )?.id;

      try {
        const file = {
          uri: asset.uri,
          fileName: asset.name,
          mimeType: asset.mimeType ?? 'application/pdf',
          fileSizeBytes: size,
        };

        const outcome = existingId
          ? await replaceCreditDocument(application.id, existingId, file)
          : await uploadCreditDocument(application.id, documentType, file);

        setLocal((prev) => ({
          ...prev,
          [documentType]: {
            status: 'uploaded',
            fileName: asset.name,
            errorMessage: outcome.storagePending
              ? 'Saved. File storage is not configured yet — support may request the file again.'
              : undefined,
          },
        }));
        await onUploaded();
      } catch (error) {
        setLocal((prev) => ({
          ...prev,
          [documentType]: {
            status: 'error',
            fileName: asset.name,
            errorMessage: getApiErrorMessage(error),
          },
        }));
      }
    },
    [application, onUploaded],
  );

  const isUploading = useMemo(
    () => Object.values(local).some((entry) => entry?.status === 'uploading'),
    [local],
  );

  const missingRequired = application?.missingDocuments ?? [];

  return {
    documents,
    pickDocument,
    isUploading,
    missingRequired,
    requiredReady: missingRequired.length === 0,
  };
};
