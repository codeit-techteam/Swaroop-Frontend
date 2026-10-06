import { memo, useCallback, useState } from 'react';

import { ActivityIndicator, Linking, Pressable, View } from 'react-native';

import { useRouter } from 'expo-router';

import Toast from 'react-native-toast-message';

import { AppHeader, ScreenWrapper, Typography } from '@/components';
import { ProfileDataState } from '@/components/profile';
import { useCustomerKycStatus } from '@/hooks/use-customer-kyc-status';
import { useProfile } from '@/hooks/useProfile';
import { DownloadIcon } from '@/icons';
import { customerKycErrorMessage, getCustomerKycDocumentUrl } from '@/services/customer-kyc';
import { useCustomerKycOverviewStore } from '@/store/customer-kyc-overview-store';
import { brandColors } from '@/theme/colors';
import type { TaxDocument } from '@/types/profile';

export const TaxDocumentsScreen = memo(function TaxDocumentsScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { refresh } = useCustomerKycStatus();
  const status = useCustomerKycOverviewStore((state) => state.status);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleDownload = useCallback(async (document: TaxDocument) => {
    if (!document.documentId) return;
    setOpeningId(document.documentId);
    try {
      const url = await getCustomerKycDocumentUrl(document.documentId);
      await Linking.openURL(url);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: `Couldn't open ${document.title}`,
        text2: customerKycErrorMessage(error, 'Please try again in a moment.'),
        visibilityTime: 3000,
      });
    } finally {
      setOpeningId(null);
    }
  }, []);

  const loaded = profile.companySource === 'backend';

  return (
    <ScreenWrapper scrollable className="bg-brand-background" contentClassName="pb-xl">
      <AppHeader variant="back" title="Tax Documents" onBack={handleBack} />

      <View className="mt-lg gap-md">
        {!loaded && status === 'error' ? (
          <ProfileDataState
            variant="error"
            title="Couldn't load your documents"
            message="Check your connection and try again."
            onRetry={() => void refresh()}
          />
        ) : !loaded ? (
          <ProfileDataState variant="loading" title="Loading documents" />
        ) : profile.taxDocuments.length === 0 ? (
          <ProfileDataState
            variant="empty"
            title="No documents on file"
            message="PAN card, GST certificate and other KYC documents you upload will appear here."
          />
        ) : null}

        {profile.taxDocuments.map((document) => (
          <View
            key={document.id}
            className="flex-row items-center justify-between rounded-2xl border border-brand-border bg-brand-white p-lg"
          >
            <View className="mr-md flex-1">
              <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
                {document.title}
              </Typography>
              <Typography
                variant="caption"
                className="mt-xs font-sans normal-case tracking-normal text-brand-muted"
              >
                {document.subtitle}
              </Typography>
            </View>

            <Pressable
              onPress={() => void handleDownload(document)}
              disabled={openingId !== null}
              accessibilityRole="button"
              accessibilityLabel={`Download ${document.title}`}
              className="h-10 w-10 items-center justify-center rounded-lg bg-brand-primary-tint"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              {openingId === document.documentId ? (
                <ActivityIndicator size="small" color={brandColors.primary} />
              ) : (
                <DownloadIcon color={brandColors.primary} />
              )}
            </Pressable>
          </View>
        ))}
      </View>
    </ScreenWrapper>
  );
});
