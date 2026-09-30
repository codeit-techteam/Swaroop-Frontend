import { useCallback, useEffect, useRef, useState } from 'react';

import { ActivityIndicator, Pressable, View } from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import { type Href, useRouter } from 'expo-router';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import {
  SellerCard,
  SellerHeader,
  SellerPrimaryButton,
  SellerStepper,
  SellerSuccessBanner,
  SellerUploadCard,
  SellerVerificationStatusBanner,
} from '@/seller/components';
import { useSellerVerificationStatus } from '@/seller/hooks/useSellerVerificationStatus';
import { useSellerStore } from '@/seller/store/sellerStore';
import type { SellerDocumentId } from '@/seller/types';
import {
  SELLER_ONBOARDING_MIME_TYPES,
  listSellerOnboardingDocuments,
  resubmitSellerOnboarding,
  sellerOnboardingErrorMessage,
  toSellerDocumentPatch,
  uploadSellerOnboardingDocument,
} from '@/services/seller-onboarding';
import { cn } from '@/utils/cn';

export const SellerVerificationScreen = () => {
  const router = useRouter();
  const documents = useSellerStore((state) => state.documents);
  const setDocument = useSellerStore((state) => state.setDocument);
  const [syncing, setSyncing] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [resubmitting, setResubmitting] = useState(false);
  const [resubmitError, setResubmitError] = useState<string | null>(null);
  const uploadingRef = useRef(new Set<SellerDocumentId>());
  const { status: reviewStatus } = useSellerVerificationStatus();
  const resubmission = Boolean(reviewStatus?.canResubmit);
  const requestedSlots = new Set(reviewStatus?.changeRequest?.slots ?? []);
  const ready = documents.every((document) => document.status === 'uploaded');
  const anyUploading = documents.some((document) => document.status === 'uploading');

  const handleResubmit = async () => {
    setResubmitting(true);
    setResubmitError(null);
    try {
      await resubmitSellerOnboarding();
      router.replace(ROUTES.SELLER.VERIFICATION_SUBMITTED as Href);
    } catch (error) {
      setResubmitError(
        sellerOnboardingErrorMessage(error, 'Could not resubmit. Please try again.'),
      );
    } finally {
      setResubmitting(false);
    }
  };

  const [syncAttempt, setSyncAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    listSellerOnboardingDocuments()
      .then((slots) => {
        if (!active) return;
        for (const slot of slots) {
          if (uploadingRef.current.has(slot.slot)) continue;
          setDocument(slot.slot, toSellerDocumentPatch(slot.document));
        }
        setSyncError(null);
      })
      .catch((error: unknown) => {
        if (active) {
          setSyncError(
            sellerOnboardingErrorMessage(error, 'Could not load your uploaded documents.'),
          );
        }
      })
      .finally(() => {
        if (active) setSyncing(false);
      });
    return () => {
      active = false;
    };
  }, [setDocument, syncAttempt]);

  const retrySync = () => {
    setSyncing(true);
    setSyncError(null);
    setSyncAttempt((attempt) => attempt + 1);
  };

  const handleUpload = useCallback(
    async (documentId: SellerDocumentId) => {
      let picked: DocumentPicker.DocumentPickerAsset | undefined;
      try {
        const result = await DocumentPicker.getDocumentAsync({
          copyToCacheDirectory: true,
          multiple: false,
          type: [...SELLER_ONBOARDING_MIME_TYPES],
        });
        if (result.canceled || !result.assets?.[0]) {
          return;
        }
        picked = result.assets[0];
      } catch {
        setDocument(documentId, {
          status: 'error',
          progress: 0,
          errorMessage: 'Unable to open document picker.',
        });
        return;
      }

      const file = {
        name: picked.name,
        uri: picked.uri,
        size: picked.size ?? 0,
        mimeType: picked.mimeType,
      };
      uploadingRef.current.add(documentId);
      setDocument(documentId, {
        status: 'uploading',
        progress: 10,
        errorMessage: undefined,
        reviewStatus: undefined,
        file,
      });

      try {
        const stored = await uploadSellerOnboardingDocument(documentId, file, (progress) => {
          useSellerStore.getState().setDocument(documentId, { progress });
        });
        uploadingRef.current.delete(documentId);
        setDocument(documentId, { ...toSellerDocumentPatch(stored), file });
      } catch (error) {
        uploadingRef.current.delete(documentId);
        const message = sellerOnboardingErrorMessage(error, 'Upload failed. Please try again.');
        // Restore whatever the server still holds for this slot, then surface the error.
        try {
          const slots = await listSellerOnboardingDocuments();
          const slot = slots.find((item) => item.slot === documentId);
          setDocument(documentId, toSellerDocumentPatch(slot?.document ?? null));
        } catch {
          setDocument(documentId, toSellerDocumentPatch(null));
        }
        setDocument(documentId, { errorMessage: message });
      }
    },
    [setDocument],
  );

  return (
    <ScreenWrapper scrollable className="bg-brand-background">
      <SellerHeader
        showBack
        title="Seller Onboarding"
        rightActionLabel="Save & Exit"
        onBack={() => router.back()}
        onRightActionPress={() =>
          router.replace(
            (resubmission ? ROUTES.SELLER.DASHBOARD : ROUTES.AUTH.ROLE_SELECTION) as Href,
          )
        }
      />

      <SellerStepper currentStep="verification" className="mt-md" />

      <SellerVerificationStatusBanner status={reviewStatus} className="mt-lg" />

      <SellerSuccessBanner
        title="Document Uploads"
        description={
          resubmission
            ? 'Upload a new copy of each highlighted document, then resubmit your application for review.'
            : 'Upload GST, PAN, Aadhaar and Cancelled Cheque — the same documents required in Seller Webapp onboarding.'
        }
        className="mt-lg"
      />

      {syncing ? (
        <View className="mt-lg flex-row items-center gap-sm">
          <ActivityIndicator size="small" />
          <Typography variant="legal" className="text-left">
            Loading your uploaded documents…
          </Typography>
        </View>
      ) : null}

      {syncError ? (
        <SellerCard className="mt-lg">
          <Typography variant="error" className="text-left">
            {syncError}
          </Typography>
          <Pressable onPress={retrySync} className="mt-sm self-start">
            <Typography variant="button" className="text-brand-primary">
              Retry
            </Typography>
          </Pressable>
        </SellerCard>
      ) : null}

      <View className="mt-lg gap-md">
        {documents.map((document) => {
          const highlighted =
            requestedSlots.has(document.id) &&
            document.reviewStatus !== 'pending_review' &&
            document.reviewStatus !== 'verified';
          return (
            <View
              key={document.id}
              className={cn(highlighted && 'rounded-2xl border-2 border-amber-400')}
            >
              <SellerUploadCard
                document={document}
                onUpload={() => void handleUpload(document.id)}
              />
            </View>
          );
        })}
      </View>

      <SellerCard className="mt-lg">
        <Typography variant="legal" className="text-left">
          PDF, JPG, PNG or WEBP up to 10 MB. Files are stored securely and reviewed by the
          PetroTrade compliance team before your seller account is approved.
        </Typography>
      </SellerCard>

      {resubmitError ? (
        <Typography variant="error" className="mt-lg text-left">
          {resubmitError}
        </Typography>
      ) : null}

      <View className="mt-lg">
        {resubmission ? (
          <SellerPrimaryButton
            label="Resubmit for Review"
            showArrow
            loading={resubmitting}
            disabled={!ready || anyUploading || syncing || resubmitting}
            onPress={() => void handleResubmit()}
          />
        ) : (
          <SellerPrimaryButton
            label="Continue to Review"
            showArrow
            disabled={!ready || anyUploading || syncing}
            onPress={() => router.push(ROUTES.SELLER.REVIEW as Href)}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};
