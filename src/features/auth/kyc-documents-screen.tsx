import { useCallback } from 'react';

import { View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import {
  AppHeader,
  BusinessSummaryCard,
  DocumentUploadCard,
  PrimaryButton,
  ProgressStepper,
  ScreenWrapper,
  Typography,
  VerificationBanner,
} from '@/components';
import { getKycStepperSteps } from '@/constants/documents';
import { useDocumentUpload } from '@/hooks/use-document-upload';
import { LockIcon, TrustIllustration } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { useKycStore } from '@/store/kyc-store';
import { brandColors } from '@/theme/colors';
import { wp } from '@/utils/responsive';

export const KycDocumentsScreen = () => {
  const router = useRouter();
  const businessInfo = useKycStore((state) => state.businessInfo);
  const { documents, pickDocument, mandatoryReady, isUploading } = useDocumentUpload();

  const canContinue = mandatoryReady && !isUploading;

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleEditBusiness = useCallback(() => {
    router.push(ROUTES.AUTH.BUSINESS_INFORMATION as Href);
  }, [router]);

  const handleContinue = useCallback(() => {
    if (!canContinue) {
      return;
    }
    router.push(ROUTES.AUTH.REVIEW_SUBMISSION as Href);
  }, [canContinue, router]);

  return (
    <ScreenWrapper scrollable className="bg-brand-white" contentClassName="pb-xl">
      <AppHeader variant="back" title="KYC Verification" onBack={handleBack} />

      <View className="items-center pt-md">
        <TrustIllustration width={wp(42)} height={wp(38)} />
        <Typography variant="heading" className="mt-md">
          KYC Verification
        </Typography>
        <Typography variant="subheading" className="mt-sm px-sm">
          Upload valid digital copies for authentication.
        </Typography>
      </View>

      <ProgressStepper steps={getKycStepperSteps('documents')} className="mt-2xl" />

      <BusinessSummaryCard
        businessInfo={businessInfo}
        showVerifiedBadge
        compact
        className="mt-2xl"
        onEdit={handleEditBusiness}
      />

      <View className="mt-2xl">
        <Typography variant="headingLeft" className="text-[18px] text-brand-primary">
          Required Documents
        </Typography>
        <Typography variant="subheadingLeft" className="mt-xs">
          PAN, GST and Aadhaar are mandatory. Cancelled cheque is optional.
        </Typography>

      </View>

      <View className="mt-lg gap-md">
        {documents.map((document) => (
          <DocumentUploadCard key={document.id} document={document} onUpload={pickDocument} />
        ))}
      </View>

      <VerificationBanner className="mt-xl" />

      <PrimaryButton
        label="Continue to Review"
        className="mt-xl"
        disabled={!canContinue}
        onPress={handleContinue}
        leftIcon={<LockIcon color={brandColors.white} size={16} />}
      />
    </ScreenWrapper>
  );
};
