import { useCallback, useEffect, useMemo } from 'react';

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
import {
  buildSubmissionTimeline,
  generateKycReferenceId,
  SUPPORT_PHONE,
} from '@/constants/documents';
import { SuccessShield } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { shouldAutoApproveKyc } from '@/services/dev-auth';
import { useAuthStore } from '@/store/auth-store';
import { useKycStore } from '@/store/kyc-store';
import { wp } from '@/utils/responsive';

export const ApplicationSubmittedScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ referenceId?: string }>();
  const businessInfo = useKycStore((state) => state.businessInfo);
  const storedReferenceId = useKycStore((state) => state.referenceId);
  const approveKyc = useAuthStore((state) => state.approveKyc);
  const setReviewSubmitted = useAuthStore((state) => state.setReviewSubmitted);

  const referenceId = useMemo(
    () => params.referenceId ?? storedReferenceId ?? generateKycReferenceId(),
    [params.referenceId, storedReferenceId],
  );
  const timeline = useMemo(() => buildSubmissionTimeline(), []);
  const companyName = businessInfo.businessEntityName || 'your business';

  useEffect(() => {
    setReviewSubmitted(referenceId);
    if (shouldAutoApproveKyc()) {
      approveKyc();
    }
  }, [approveKyc, referenceId, setReviewSubmitted]);

  const handleDashboard = useCallback(() => {
    if (shouldAutoApproveKyc()) {
      approveKyc();
    }
    router.replace(ROUTES.CUSTOMER.HOME as Href);
  }, [approveKyc, router]);

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

      <ReferenceCard referenceId={referenceId} className="mt-2xl" />

      <TimelineCard steps={timeline} className="mt-lg" />

      <PrimaryButton label="Go to Dashboard" className="mt-2xl" onPress={handleDashboard} />
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
