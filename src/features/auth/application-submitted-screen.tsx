import { useCallback, useEffect, useMemo, useState } from 'react';

import { View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import {
  AppLogo,
  PrimaryButton,
  ReferenceCard,
  ScreenWrapper,
  SecondaryButton,
  TimelineCard,
  Typography,
} from '@/components';
import { KycStatusBanner } from '@/components/kyc/kyc-status-banner';
import {
  buildSubmissionTimeline,
  generateKycReferenceId,
  SUPPORT_PHONE,
} from '@/constants/documents';
import { useCustomerKycStatus } from '@/hooks/use-customer-kyc-status';
import { SuccessShield } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  getVerificationRemainingMs,
  isVerificationPeriodComplete,
} from '@/services/kyc-verification';
import { getKYC } from '@/services/storage';
import { useAuthStore } from '@/store/auth-store';
import { useKycStore } from '@/store/kyc-store';
import { wp } from '@/utils/responsive';

const formatCountdown = (remainingMs: number): string => {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export const ApplicationSubmittedScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ referenceId?: string }>();
  const businessInfo = useKycStore((state) => state.businessInfo);
  const storedReferenceId = useKycStore((state) => state.referenceId);
  const setReviewSubmitted = useAuthStore((state) => state.setReviewSubmitted);
  const resolvePendingKycApproval = useAuthStore((state) => state.resolvePendingKycApproval);
  const kycApproved = useAuthStore((state) => state.kycApproved);
  const { overview: kycOverview } = useCustomerKycStatus();

  const referenceId = useMemo(
    () => params.referenceId ?? storedReferenceId ?? generateKycReferenceId(),
    [params.referenceId, storedReferenceId],
  );
  const timeline = useMemo(() => buildSubmissionTimeline(), []);
  const companyName = businessInfo.businessEntityName || 'your business';

  const [remainingMs, setRemainingMs] = useState(() =>
    getVerificationRemainingMs(getKYC().submittedAt),
  );
  const isVerified = kycApproved || isVerificationPeriodComplete(getKYC().submittedAt);

  useEffect(() => {
    setReviewSubmitted(referenceId);
  }, [referenceId, setReviewSubmitted]);

  useEffect(() => {
    const tick = () => {
      const submittedAt = getKYC().submittedAt;
      setRemainingMs(getVerificationRemainingMs(submittedAt));

      if (resolvePendingKycApproval()) {
        setRemainingMs(0);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [resolvePendingKycApproval]);

  const handleDashboard = useCallback(() => {
    if (!resolvePendingKycApproval()) {
      return;
    }

    router.replace(ROUTES.CUSTOMER.HOME as Href);
  }, [resolvePendingKycApproval, router]);

  const handleSupport = useCallback(() => {
    // Frontend-only contact action
  }, []);

  return (
    <ScreenWrapper scrollable className="bg-brand-white" contentClassName="pb-xl">
      <View className="items-center pt-lg">
        <AppLogo />
      </View>

      <View className="mt-2xl items-center">
        <SuccessShield width={wp(48)} height={wp(42)} />
        <Typography variant="heading" className="mt-lg">
          Application Submitted
        </Typography>
        <Typography variant="subheading" className="mt-sm px-sm">
          Your KYC documents for {companyName} have been successfully submitted for review.
        </Typography>
      </View>

      <KycStatusBanner
        overview={kycOverview}
        showReviewStates
        actionLabel="Update documents"
        onAction={() => router.push(ROUTES.AUTH.KYC_DOCUMENTS as Href)}
        className="mt-2xl"
      />

      <ReferenceCard referenceId={referenceId} className="mt-2xl" />

      <TimelineCard steps={timeline} className="mt-lg" />

      {!isVerified && remainingMs > 0 ? (
        <Typography variant="legal" className="mt-xl text-center">
          Verification in progress. Dashboard access in {formatCountdown(remainingMs)}.
        </Typography>
      ) : null}

      <PrimaryButton
        label={isVerified ? 'Go to Dashboard' : 'Verification in Progress'}
        className="mt-2xl"
        disabled={!isVerified}
        onPress={handleDashboard}
      />
      <SecondaryButton
        label="Contact Support"
        variant="outline"
        className="mt-md"
        onPress={handleSupport}
      />

      <Typography variant="legal" className="mt-xl">
        Need immediate assistance? Call us at {SUPPORT_PHONE}
      </Typography>
    </ScreenWrapper>
  );
};
