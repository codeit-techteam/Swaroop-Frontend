import { memo, useCallback } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  EstimatedVerificationChip,
  TransactionDetailsCard,
  VerificationInfoCard,
  VerificationTimeline,
} from '@/components/payment';
import { Typography } from '@/components/ui';
import {
  CREDIT_WORKFLOW_COPY,
  useCreditPaymentVerification,
} from '@/hooks/useCreditPaymentVerification';
import { BackArrowIcon, BellIcon, PaymentVerificationIllustration } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

export const CustomerCreditVerificationScreen = memo(function CustomerCreditVerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const copy = CREDIT_WORKFLOW_COPY.verification;
  const { order, paymentProof, timeline, badgeStatus, handleBack } = useCreditPaymentVerification();

  const handleNotifications = useCallback(() => {
    router.push(ROUTES.CUSTOMER.HOME as Href);
  }, [router]);

  if (!order || !paymentProof) {
    return (
      <View className="flex-1 bg-brand-background">
        <Header insetsTop={insets.top} onBack={handleBack} title={copy.headerTitle} />
        <View className="flex-1 items-center justify-center px-lg">
          <Typography variant="subheadingLeft" className="text-center text-brand-body">
            Payment proof not found. Please submit your payment proof to continue.
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-background">
      <Header
        insetsTop={insets.top}
        onBack={handleBack}
        onNotifications={handleNotifications}
        title={copy.headerTitle}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: insets.bottom + 40,
        }}
      >
        <View className="items-center rounded-2xl border border-brand-border bg-brand-white px-md py-lg">
          <PaymentVerificationIllustration width={200} height={160} />
        </View>

        <Typography variant="headingLeft" className="mt-xl text-center text-[22px] text-brand-heading">
          {copy.title}
        </Typography>
        <Typography
          variant="subheadingLeft"
          className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
        >
          {copy.description}
        </Typography>

        <EstimatedVerificationChip className="mt-lg" />
        <VerificationTimeline steps={timeline} className="mt-xl" />
        <TransactionDetailsCard
          paymentProof={paymentProof}
          badgeStatus={badgeStatus}
          className="mt-lg"
        />
        <VerificationInfoCard className="mt-lg" />
      </ScrollView>
    </View>
  );
});

const Header = memo(function Header({
  insetsTop,
  onBack,
  onNotifications,
  title,
}: {
  insetsTop: number;
  onBack: () => void;
  onNotifications?: () => void;
  title: string;
}) {
  return (
    <View
      className="border-b border-brand-border bg-brand-white px-lg"
      style={{ paddingTop: insetsTop }}
    >
      <View className="h-14 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable onPress={onBack} className="h-10 w-10 items-center justify-center">
            <BackArrowIcon color={brandColors.heading} />
          </Pressable>
          <Typography variant="roleTitle" className="ml-sm text-[17px] text-brand-heading">
            {title}
          </Typography>
        </View>
        {onNotifications ? (
          <Pressable onPress={onNotifications} className="h-10 w-10 items-center justify-center">
            <BellIcon size={iconSizes.lg} color={brandColors.primary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});
