import { memo, useCallback } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationBadge } from '@/components/home/notification-badge';
import {
  BlindMarketplaceInfoCard,
  OrderProgressTimeline,
  ProcurementEngineCard,
  ProcurementHero,
  ProcurementProgressCard,
} from '@/components/procurement';
import { PrimaryButton, Typography } from '@/components/ui';
import { PROCUREMENT_SCREEN_COPY } from '@/constants/procurementSteps';
import { useProcurement } from '@/hooks/use-procurement';
import { BackArrowIcon, BellIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

export const CustomerProcurementConfirmationScreen = memo(
  function CustomerProcurementConfirmationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {
      order,
      paymentProof,
      procurement,
      timeline,
      statusLabel,
      canContinue,
      handleContinueTracking,
      handleBack,
      handleNotifications,
    } = useProcurement();

    const handleUploadProof = useCallback(() => {
      router.replace(ROUTES.CUSTOMER.PAYMENT_UPLOAD_PROOF as Href);
    }, [router]);

    if (!order || !paymentProof || order.verificationStatus !== 'verified') {
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
                {PROCUREMENT_SCREEN_COPY.headerTitle}
              </Typography>
            </View>
          </View>
          <View className="flex-1 items-center justify-center px-lg">
            <Typography variant="subheadingLeft" className="text-center text-brand-body">
              Verified payment is required before procurement can begin.
            </Typography>
            <PrimaryButton
              label="Upload Payment Proof"
              onPress={handleUploadProof}
              className="mt-lg"
            />
          </View>
        </View>
      );
    }

    if (!procurement) {
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
                {PROCUREMENT_SCREEN_COPY.headerTitle}
              </Typography>
            </View>
          </View>
          <View className="flex-1 items-center justify-center px-lg">
            <Typography variant="subheadingLeft" className="text-center text-brand-body">
              Initializing procurement engine...
            </Typography>
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
                {PROCUREMENT_SCREEN_COPY.headerTitle}
              </Typography>
            </View>
            <Pressable
              onPress={handleNotifications}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              className="relative h-10 w-10 items-center justify-center"
            >
              <BellIcon size={iconSizes.lg} color={brandColors.primary} />
              <NotificationBadge visible />
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
          <ProcurementHero />

          <ProcurementProgressCard
            procurement={procurement}
            statusLabel={statusLabel}
            className="mt-xl"
          />

          <OrderProgressTimeline
            steps={timeline}
            heading={PROCUREMENT_SCREEN_COPY.progressHeading}
            className="mt-lg"
          />

          <ProcurementEngineCard checks={procurement.engineChecks} className="mt-lg" />

          <BlindMarketplaceInfoCard className="mt-lg" />
        </ScrollView>

        <View
          className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <PrimaryButton
            label={PROCUREMENT_SCREEN_COPY.continueTracking}
            onPress={handleContinueTracking}
            disabled={!canContinue}
          />
        </View>
      </View>
    );
  },
);
