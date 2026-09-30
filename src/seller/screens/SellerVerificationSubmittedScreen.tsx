import { View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { AppLogo, ScreenWrapper, Typography } from '@/components';
import { CheckCircleIcon, SuccessShield } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  SellerCard,
  SellerPrimaryButton,
  SellerVerificationStatusBanner,
} from '@/seller/components';
import { useSellerVerificationStatus } from '@/seller/hooks/useSellerVerificationStatus';
import { brandColors } from '@/theme/colors';

const NEXT_STEPS = [
  {
    title: 'Document review',
    detail: 'GST, PAN, and bank proof are checked against the submitted files.',
  },
  {
    title: 'Business verification',
    detail: 'Company details are matched with the GST portal record.',
  },
  { title: 'Dashboard access', detail: 'Once approved, inventory, offers, and payouts go live.' },
];

export const SellerVerificationSubmittedScreen = () => {
  const router = useRouter();
  const { status } = useSellerVerificationStatus();
  const needsAction = Boolean(status?.canResubmit);

  return (
    <ScreenWrapper className="bg-brand-background">
      <View className="items-center pt-lg">
        <AppLogo />
      </View>

      <View className="mt-xl items-center">
        <SuccessShield width={160} height={140} />
        <View className="mt-md flex-row items-center rounded-full bg-brand-success-light px-md py-sm">
          <CheckCircleIcon size={16} color={brandColors.success} />
          <Typography variant="badge" className="ml-sm text-[11px] text-brand-success">
            Application received
          </Typography>
        </View>
      </View>

      {needsAction ? null : (
        <SellerCard className="mt-lg items-center">
          <Typography variant="headingLeft" className="text-center text-[24px]">
            Verification in progress
          </Typography>
          <Typography variant="subheading" className="mt-sm">
            Typical review time is 2–4 business hours.
          </Typography>
        </SellerCard>
      )}

      <SellerVerificationStatusBanner
        status={status}
        showReviewStates={needsAction || status?.status === 'APPROVED'}
        actionLabel="Update & Resubmit"
        onAction={() => router.replace(ROUTES.SELLER.VERIFICATION as Href)}
        className="mt-lg"
      />

      <SellerCard title="What happens next" className="mt-lg">
        <View className="gap-md">
          {NEXT_STEPS.map((step, index) => (
            <View key={step.title} className="flex-row">
              <View className="mr-md h-7 w-7 items-center justify-center rounded-full bg-brand-primary-light">
                <Typography variant="badge" className="text-[11px] text-brand-primary-dark">
                  {index + 1}
                </Typography>
              </View>
              <View className="flex-1">
                <Typography variant="roleTitle" className="text-[14px]">
                  {step.title}
                </Typography>
                <Typography variant="legal" className="mt-xs text-left text-brand-body">
                  {step.detail}
                </Typography>
              </View>
            </View>
          ))}
        </View>
      </SellerCard>

      <SellerPrimaryButton
        label="Go To Dashboard"
        className="mt-auto"
        onPress={() => router.replace(ROUTES.SELLER.DASHBOARD as Href)}
      />
    </ScreenWrapper>
  );
};
