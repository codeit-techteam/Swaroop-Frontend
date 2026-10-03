import { useCallback, useMemo, useState } from 'react';

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
import { KycVerificationSummary } from '@/components/kyc/kyc-verification-summary';
import { generateKycReferenceId, getKycStepperSteps } from '@/constants/documents';
import { useCustomerKycStatus } from '@/hooks/use-customer-kyc-status';
import { TrustIllustration } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  customerKycErrorMessage,
  fetchCustomerKyc,
  submitCustomerKyc,
} from '@/services/customer-kyc';
import { useAuthStore } from '@/store/auth-store';
import { useKycStore } from '@/store/kyc-store';
import { wp } from '@/utils/responsive';

const isDocumentUploaded = (status: string): boolean =>
  status === 'verified' || status === 'uploaded';

export const ReviewSubmissionScreen = () => {
  const router = useRouter();
  const businessInfo = useKycStore((state) => state.businessInfo);
  const documents = useKycStore((state) => state.documents);
  const setReferenceId = useKycStore((state) => state.setReferenceId);

  const reviewDocuments = useMemo(
    () =>
      documents.filter(
        (document) =>
          document.required ||
          (document.id === 'cancelled_cheque' && isDocumentUploaded(document.status)),
      ),
    [documents],
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleEditBusiness = useCallback(() => {
    router.push(ROUTES.AUTH.BUSINESS_INFORMATION as Href);
  }, [router]);

  const handleEditDocuments = useCallback(() => {
    router.push(ROUTES.AUTH.KYC_DOCUMENTS as Href);
  }, [router]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { overview, refresh } = useCustomerKycStatus();
  const alreadySubmitted = Boolean(overview?.locked || overview?.kycVerified);
  const missing = overview && !alreadySubmitted ? overview.missingRequired : [];

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const current = await fetchCustomerKyc();
      const next =
        current.locked || current.kycVerified ? current : await submitCustomerKyc(businessInfo);
      useAuthStore.getState().syncKycStatus(next);
      const referenceId = generateKycReferenceId();
      setReferenceId(referenceId);
      router.push({
        pathname: ROUTES.AUTH.APPLICATION_SUBMITTED,
        params: { referenceId },
      } as unknown as Href);
    } catch (error) {
      setSubmitError(
        customerKycErrorMessage(error, 'Could not submit your KYC. Please try again.'),
      );
      void refresh();
    } finally {
      setSubmitting(false);
    }
  }, [businessInfo, refresh, router, setReferenceId]);

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
      <DocumentSummaryCard
        documents={reviewDocuments}
        className="mt-md"
        onEdit={handleEditDocuments}
      />

      <Typography variant="headingLeft" className="mt-2xl text-[18px] text-brand-primary">
        PAN &amp; GST Verification
      </Typography>
      <KycVerificationSummary
        pan={overview?.verifications.pan}
        gst={overview?.verifications.gst}
        className="mt-md"
      />

      {missing.length ? (
        <Typography variant="legal" className="mt-xl text-left text-amber-800">
          Still required: {missing.join(', ')}
        </Typography>
      ) : null}
      {submitError ? (
        <Typography variant="error" className="mt-xl text-left">
          {submitError}
        </Typography>
      ) : null}

      <PrimaryButton
        label={
          submitting
            ? 'Submitting KYC…'
            : alreadySubmitted
              ? 'View Application Status'
              : 'Submit Application'
        }
        className="mt-2xl"
        disabled={submitting || !overview || (!alreadySubmitted && !overview.canSubmit)}
        onPress={() => void handleSubmit()}
      />
    </ScreenWrapper>
  );
};
