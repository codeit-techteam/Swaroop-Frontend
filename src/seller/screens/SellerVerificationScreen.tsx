import { useCallback } from 'react';

import { View } from 'react-native';

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
} from '@/seller/components';
import { SELLER_UPLOAD_DURATION_MS } from '@/seller/constants';
import { useSellerStore } from '@/seller/store/sellerStore';
import type { SellerDocumentId } from '@/seller/types';

export const SellerVerificationScreen = () => {
  const router = useRouter();
  const documents = useSellerStore((state) => state.documents);
  const setDocument = useSellerStore((state) => state.setDocument);
  const ready = documents.every((document) => document.status === 'uploaded');

  const handleUpload = useCallback(
    async (documentId: SellerDocumentId) => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          copyToCacheDirectory: true,
          multiple: false,
        });

        if (result.canceled || !result.assets?.[0]) {
          return;
        }

        const asset = result.assets[0];
        setDocument(documentId, {
          status: 'uploading',
          progress: 25,
          errorMessage: undefined,
          file: {
            name: asset.name,
            uri: asset.uri,
            size: asset.size ?? 0,
            mimeType: asset.mimeType,
          },
        });

        setTimeout(() => {
          useSellerStore.getState().setDocument(documentId, {
            status: 'uploaded',
            progress: 100,
          });
        }, SELLER_UPLOAD_DURATION_MS);
      } catch {
        setDocument(documentId, {
          status: 'error',
          progress: 0,
          errorMessage: 'Unable to open document picker.',
        });
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
        onRightActionPress={() => router.replace(ROUTES.AUTH.ROLE_SELECTION as Href)}
      />

      <SellerStepper currentStep="verification" className="mt-md" />

      <SellerSuccessBanner
        title="Document Uploads"
        description="Upload GST, PAN, Aadhaar and Cancelled Cheque — the same documents required in Seller Webapp onboarding."
        className="mt-lg"
      />

      <View className="mt-lg gap-md">
        {documents.map((document) => (
          <SellerUploadCard
            key={document.id}
            document={document}
            onUpload={() => void handleUpload(document.id)}
          />
        ))}
      </View>

      <SellerCard className="mt-lg">
        <Typography variant="legal" className="text-left">
          Uploaded status is shown immediately. No backend verification is performed in this
          frontend-only flow.
        </Typography>
      </SellerCard>

      <View className="mt-lg">
        <SellerPrimaryButton
          label="Continue to Review"
          showArrow
          disabled={!ready}
          onPress={() => router.push(ROUTES.SELLER.REVIEW as Href)}
        />
      </View>
    </ScreenWrapper>
  );
};
