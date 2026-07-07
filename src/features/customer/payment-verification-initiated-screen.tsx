import { memo, useCallback } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  EstimatedVerificationChip,
  TransactionDetailsCard,
  VerificationErrorCard,
  VerificationInfoCard,
  VerificationTimeline,
} from '@/components/payment';
import { PrimaryButton, Typography } from '@/components/ui';
import { VERIFICATION_SCREEN_COPY } from '@/constants/verificationStatus';
import { usePaymentVerification } from '@/hooks/use-payment-verification';
import { BackArrowIcon, BellIcon, PaymentVerificationIllustration } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

export const CustomerPaymentVerificationInitiatedScreen = memo(
  function CustomerPaymentVerificationInitiatedScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {
      order,
      paymentProof,
      timeline,
      badgeStatus,
      verificationError,
      handleBack,
    } = usePaymentVerification();

    const handleNotifications = useCallback(() => {
      router.push(ROUTES.CUSTOMER.HOME as Href);
    }, [router]);

    if (!order || !paymentProof) {
      return (
        <View className="flex-1 bg-brand-background">
          <View
            className="border-b border-brand-border bg-brand-white px-lg"
            style={{ paddingTop: insets.top }}
          >
            <View className="h-14 flex-row items-center">
              <Pressable
                onPress={handleBack}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                className="h-10 w-10 items-center justify-center"
              >
                <BackArrowIcon color={brandColors.heading} />
              </Pressable>
              <Typography variant="roleTitle" className="ml-sm text-[17px] text-brand-heading">
                Payment Verification
              </Typography>
            </View>
          </View>
          <View className="flex-1 items-center justify-center px-lg">
            <Typography variant="subheadingLeft" className="text-center text-brand-body">
              Payment proof not found. Please submit your payment proof to continue.
            </Typography>
            <PrimaryButton
              label="Upload Payment Proof"
              onPress={() => router.replace(ROUTES.CUSTOMER.PAYMENT_UPLOAD_PROOF as Href)}
              className="mt-lg"
            />
          </View>
        </View>
      );
    }

    return (
      <View className="flex-1 bg-brand-background">
        <View
          className="border-b border-brand-border bg-brand-white px-lg"
          style={{ paddingTop: insets.top }}
        >
          <View className="h-14 flex-row items-center justify-between">
            <View className="min-w-0 flex-1 flex-row items-center">
              <Pressable
                onPress={handleBack}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                className="mr-sm h-10 w-10 items-center justify-center"
              >
                <BackArrowIcon color={brandColors.heading} />
              </Pressable>
              <Typography
                variant="roleTitle"
                className="text-[17px] text-brand-heading"
                numberOfLines={1}
              >
                Payment Verification
              </Typography>
            </View>
            <Pressable
              onPress={handleNotifications}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              className="h-10 w-10 items-center justify-center"
            >
              <BellIcon size={iconSizes.lg} color={brandColors.primary} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: insets.bottom + 100,
          }}
        >
          <View className="items-center rounded-2xl border border-brand-border bg-brand-white px-md py-lg">
            <PaymentVerificationIllustration width={200} height={160} />
            <Typography
              variant="illustrationLabel"
              className="mt-md px-sm text-[11px] leading-4 text-brand-navy"
            >
              {VERIFICATION_SCREEN_COPY.illustrationLabel}
            </Typography>
          </View>

          <Typography
            variant="headingLeft"
            className="mt-xl text-center text-[22px] text-brand-heading"
          >
            {VERIFICATION_SCREEN_COPY.title}
          </Typography>
          <Typography
            variant="subheadingLeft"
            className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
          >
            {VERIFICATION_SCREEN_COPY.description}
          </Typography>

          <EstimatedVerificationChip className="mt-lg" />

          <VerificationTimeline steps={timeline} className="mt-xl" />

          <TransactionDetailsCard
            paymentProof={paymentProof}
            badgeStatus={badgeStatus}
            className="mt-lg"
          />

          {verificationError ? (
            <VerificationErrorCard error={verificationError} className="mt-lg" />
          ) : null}

          <VerificationInfoCard className="mt-lg" />
        </ScrollView>
      </View>
    );
  },
);
