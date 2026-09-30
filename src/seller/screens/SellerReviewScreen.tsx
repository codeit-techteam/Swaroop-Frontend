import { useMemo, useState } from 'react';

import { View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { SellerCard, SellerHeader, SellerPrimaryButton, SellerStepper } from '@/seller/components';
import { useSellerStore } from '@/seller/store/sellerStore';
import {
  fetchSellerOnboardingStatus,
  sellerOnboardingErrorMessage,
  submitSellerOnboarding,
} from '@/services/seller-onboarding';

const ALREADY_SUBMITTED = new Set(['SUBMITTED', 'UNDER_REVIEW', 'APPROVED']);

export const SellerReviewScreen = () => {
  const router = useRouter();
  const company = useSellerStore((state) => state.company);
  const documents = useSellerStore((state) => state.documents);
  const submitVerification = useSellerStore((state) => state.submitVerification);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const uploadedDocuments = useMemo(
    () => documents.filter((document) => document.status === 'uploaded'),
    [documents],
  );
  const allUploaded = uploadedDocuments.length === documents.length;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const current = await fetchSellerOnboardingStatus();
      if (!current || !ALREADY_SUBMITTED.has(current.status)) {
        await submitSellerOnboarding(company);
      }
      submitVerification();
      router.replace(ROUTES.SELLER.VERIFICATION_SUBMITTED as Href);
    } catch (error) {
      setSubmitError(sellerOnboardingErrorMessage(error, 'Could not submit for verification.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper scrollable className="bg-brand-background">
      <SellerHeader
        showBack
        title="Seller Onboarding"
        rightActionLabel="Save & Exit"
        onBack={() => router.back()}
        onRightActionPress={() => router.replace(ROUTES.AUTH.ROLE_SELECTION as Href)}
      />

      <SellerStepper currentStep="review" className="mt-md" />

      <SellerCard
        title="Business Info"
        className="mt-lg"
        actionLabel="Edit"
        onActionPress={() => router.push(ROUTES.SELLER.COMPANY as Href)}
      >
        <View className="gap-sm">
          <Typography variant="body">{company.companyName}</Typography>
          <Typography variant="legal" className="text-left">
            GST: {company.gst}
          </Typography>
          {company.gstVerified ? (
            <Typography variant="legal" className="text-left">
              GST State: {company.gstState} ({company.gstStateCode})
            </Typography>
          ) : null}
          <Typography variant="legal" className="text-left">
            PAN: {company.pan}
          </Typography>
          <Typography variant="legal" className="text-left">
            {company.city}, {company.state} - {company.pincode}
          </Typography>
          {company.accountNumber ? (
            <Typography variant="legal" className="text-left">
              Bank: {company.bankName} · A/C ••••{company.accountNumber.slice(-4)} ·{' '}
              {company.ifscCode}
            </Typography>
          ) : null}
        </View>
      </SellerCard>

      <SellerCard
        title="Documents"
        className="mt-lg"
        actionLabel="Edit"
        onActionPress={() => router.push(ROUTES.SELLER.VERIFICATION as Href)}
      >
        <View className="gap-sm">
          {uploadedDocuments.map((document) => (
            <View
              key={document.id}
              className="flex-row items-center justify-between rounded-xl bg-brand-surface px-md py-md"
            >
              <Typography variant="body">{document.title}</Typography>
              <Typography variant="badge" className="text-brand-uploaded-text">
                {document.reviewStatus === 'verified' ? 'Verified' : 'Stored'}
              </Typography>
            </View>
          ))}
        </View>
      </SellerCard>

      {submitError ? (
        <Typography variant="error" className="mt-md text-left">
          {submitError}
        </Typography>
      ) : null}

      <View className="mt-lg">
        <SellerPrimaryButton
          label="Submit For Verification"
          showArrow
          loading={submitting}
          disabled={!allUploaded}
          onPress={() => void handleSubmit()}
        />
      </View>
    </ScreenWrapper>
  );
};
