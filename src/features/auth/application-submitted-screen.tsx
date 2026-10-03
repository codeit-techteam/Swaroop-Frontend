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
import { kycNeedsAction } from '@/services/customer-kyc';
import { useAuthStore } from '@/store/auth-store';
import { useKycStore } from '@/store/kyc-store';
import { wp } from '@/utils/responsive';

/** How often to re-check the backend while the application is under review. */
const REVIEW_POLL_MS = 15_000;

export const ApplicationSubmittedScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ referenceId?: string }>();
  const businessInfo = useKycStore((state) => state.businessInfo);
  const storedReferenceId = useKycStore((state) => state.referenceId);
  const setReviewSubmitted = useAuthStore((state) => state.setReviewSubmitted);
  const kycApproved = useAuthStore((state) => state.kycApproved);
  const { overview, loaded, refresh } = useCustomerKycStatus({ pollMs: REVIEW_POLL_MS });
  const [checking, setChecking] = useState(false);

  const referenceId = useMemo(
    () => params.referenceId ?? storedReferenceId ?? generateKycReferenceId(),
    [params.referenceId, storedReferenceId],
  );
  const timeline = useMemo(() => buildSubmissionTimeline(overview?.checklist), [overview]);
  const companyName =
    overview?.organization.name || businessInfo.businessEntityName || 'your business';
  const needsAction = kycNeedsAction(overview?.status);
  const notSubmitted = overview?.status === 'NOT_SUBMITTED' && !kycApproved;

  useEffect(() => {
    setReviewSubmitted(referenceId);
  }, [referenceId, setReviewSubmitted]);

  const handleDashboard = useCallback(() => {
    if (!useAuthStore.getState().kycApproved) return;
    router.replace(ROUTES.CUSTOMER.HOME as Href);
  }, [router]);

  const handleResubmit = useCallback(() => {
    router.push(ROUTES.AUTH.BUSINESS_INFORMATION as Href);
  }, [router]);

  const handleCheckStatus = useCallback(async () => {
    setChecking(true);
    try {
      await refresh();
    } finally {
      setChecking(false);
    }
  }, [refresh]);

  const handleSupport = useCallback(() => {
    // Frontend-only contact action
  }, []);

  const heading = kycApproved
    ? 'KYC Verified'
    : needsAction
      ? 'KYC Needs Correction'
      : 'Application Submitted';
  const subheading = kycApproved
    ? `${companyName} is verified. You now have full access to PetroTrade.`
    : needsAction
      ? 'Our compliance team reviewed your KYC and needs a few corrections before approval.'
      : notSubmitted
        ? 'Your KYC has not been submitted yet. Complete the remaining steps to submit it for review.'
        : `Your KYC for ${companyName} is under review by the PetroTrade compliance team.`;

  return (
    <ScreenWrapper scrollable className="bg-brand-white" contentClassName="pb-xl">
      <View className="items-center pt-lg">
        <AppLogo />
      </View>

      <View className="mt-2xl items-center">
        <SuccessShield width={wp(48)} height={wp(42)} />
        <Typography variant="heading" className="mt-lg">
          {heading}
        </Typography>
        <Typography variant="subheading" className="mt-sm px-sm">
          {subheading}
        </Typography>
      </View>

      <KycStatusBanner
        overview={overview}
        showReviewStates
        actionLabel="Update & Resubmit"
        onAction={handleResubmit}
        className="mt-2xl"
      />

      <ReferenceCard referenceId={referenceId} className="mt-2xl" />

      <TimelineCard steps={timeline} className="mt-lg" />

      {!loaded ? (
        <Typography variant="legal" className="mt-xl text-center">
          Checking your verification status…
        </Typography>
      ) : !overview ? (
        <Typography variant="legal" className="mt-xl text-center">
          Couldn&apos;t reach PetroTrade to check your status. Tap &quot;Check status&quot; to
          retry.
        </Typography>
      ) : null}

      {kycApproved ? (
        <PrimaryButton label="Go to Dashboard" className="mt-2xl" onPress={handleDashboard} />
      ) : needsAction || notSubmitted ? (
        <PrimaryButton
          label={needsAction ? 'Update & Resubmit' : 'Complete KYC'}
          className="mt-2xl"
          onPress={handleResubmit}
        />
      ) : (
        <PrimaryButton
          label="Check status"
          className="mt-2xl"
          loading={checking}
          onPress={() => void handleCheckStatus()}
        />
      )}
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
