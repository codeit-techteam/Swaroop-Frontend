import { useCallback } from 'react';

import { View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import {
  AppHeader,
  BusinessSummaryCard,
  DocumentSummaryCard,
  PrimaryButton,
  ProgressStepper,
  ScreenWrapper,
  Typography,
} from '@/components';
import { generateKycReferenceId, getKycStepperSteps } from '@/constants/documents';
import { TrustIllustration } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { useKycStore } from '@/store/kyc-store';
import { wp } from '@/utils/responsive';

export const ReviewSubmissionScreen = () => {
  const router = useRouter();
  const businessInfo = useKycStore((state) => state.businessInfo);
  const documents = useKycStore((state) => state.documents);
  const setReferenceId = useKycStore((state) => state.setReferenceId);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleEditBusiness = useCallback(() => {
    router.push(ROUTES.AUTH.BUSINESS_INFORMATION as Href);
  }, [router]);

  const handleEditDocuments = useCallback(() => {
    router.push(ROUTES.AUTH.KYC_DOCUMENTS as Href);
  }, [router]);

  const handleSubmit = useCallback(() => {
    const referenceId = generateKycReferenceId();
    setReferenceId(referenceId);
    router.push({
      pathname: ROUTES.AUTH.APPLICATION_SUBMITTED,
      params: { referenceId },
    } as unknown as Href);
  }, [router, setReferenceId]);

  return (
    <ScreenWrapper scrollable className="bg-brand-white" contentClassName="pb-xl">
      <AppHeader variant="back" title="KYC Verification" onBack={handleBack} />

      <View className="items-center pt-md">
        <TrustIllustration width={wp(42)} height={wp(38)} />
        <Typography variant="heading" className="mt-md">
          Review Submission
        </Typography>
        <Typography variant="subheading" className="mt-sm px-sm">
          Confirm your business details and documents before submitting.
        </Typography>
      </View>

      <ProgressStepper steps={getKycStepperSteps('review')} className="mt-2xl" />

      <Typography variant="headingLeft" className="mt-2xl text-[18px] text-brand-primary">
        Business Information
      </Typography>
      <BusinessSummaryCard
        businessInfo={businessInfo}
        className="mt-md"
        onEdit={handleEditBusiness}
      />

      <Typography variant="headingLeft" className="mt-2xl text-[18px] text-brand-primary">
        Documents
      </Typography>
      <DocumentSummaryCard documents={documents} className="mt-md" onEdit={handleEditDocuments} />

      <PrimaryButton label="Submit Application" className="mt-2xl" onPress={handleSubmit} />
    </ScreenWrapper>
  );
};
