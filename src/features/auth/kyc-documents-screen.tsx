import { useCallback, useMemo } from 'react';

import { View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import {
  AppHeader,
  DocumentUploadCard,
  PrimaryButton,
  ProgressStepper,
  ScreenWrapper,
  StatusBadge,
  Typography,
  VerificationBanner,
} from '@/components';
import { BUSINESS_ENTITY, generateKycReferenceId, KYC_STEPPER_STEPS } from '@/constants/documents';
import { useDocumentUpload } from '@/hooks/use-document-upload';
import { LockIcon, TrustIllustration } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { brandColors } from '@/theme/colors';
import { wp } from '@/utils/responsive';

export const KycDocumentsScreen = () => {
  const router = useRouter();
  const { documents, pickDocument, allVerified, isUploading } = useDocumentUpload();

  const canSubmit = allVerified && !isUploading;

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) {
      return;
    }
    const referenceId = generateKycReferenceId();
    router.push({
      pathname: ROUTES.AUTH.APPLICATION_SUBMITTED,
      params: { referenceId },
    } as unknown as Href);
  }, [canSubmit, router]);

  const businessCard = useMemo(
    () => (
      <View className="w-full flex-row items-center justify-between rounded-lg border border-brand-border bg-brand-white px-lg py-lg shadow-sm">
        <View className="flex-1 pr-md">
          <Typography variant="fieldLabel">Business Entity</Typography>
          <Typography variant="roleTitle" className="mt-xs text-brand-primary">
            {BUSINESS_ENTITY.name}
          </Typography>
          <Typography variant="roleDescription" className="mt-xs">
            {BUSINESS_ENTITY.type}
          </Typography>
        </View>
        <StatusBadge label="✔ Verified" variant="success" />
      </View>
    ),
    [],
  );

  return (
    <ScreenWrapper scrollable className="bg-brand-white" contentClassName="pb-xl">
      <AppHeader variant="back" title="KYC Verification" onBack={handleBack} />

      <View className="items-center pt-md">
        <TrustIllustration width={wp(42)} height={wp(38)} />
        <Typography variant="heading" className="mt-md">
          KYC Verification
        </Typography>
        <Typography variant="subheading" className="mt-sm px-sm">
          Complete your business profile to start trading on the PetroTrade Global exchange.
        </Typography>
      </View>

      <ProgressStepper steps={KYC_STEPPER_STEPS} className="mt-2xl" />

      <View className="mt-2xl">{businessCard}</View>

      <View className="mt-2xl">
        <Typography variant="headingLeft" className="text-[18px] text-brand-primary">
          Required Documents
        </Typography>
        <Typography variant="subheadingLeft" className="mt-xs">
          Upload valid digital copies for authentication.
        </Typography>
      </View>

      <View className="mt-lg gap-md">
        {documents.map((document) => (
          <DocumentUploadCard key={document.id} document={document} onUpload={pickDocument} />
        ))}
      </View>

      <VerificationBanner className="mt-xl" />

      <PrimaryButton
        label="Submit for Review"
        className="mt-xl"
        disabled={!canSubmit}
        onPress={handleSubmit}
        leftIcon={<LockIcon color={brandColors.white} size={16} />}
      />
    </ScreenWrapper>
  );
};
