import { memo, useCallback } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationBadge } from '@/components/home/notification-badge';
import {
  BlindMarketplaceInfoCard,
  OrderProgressTimeline,
  ProcurementEngineCard,
  ProcurementHero,
  ProcurementProgressCard,
} from '@/components/procurement';
import { PrimaryButton, SecondaryButton, Typography } from '@/components/ui';
import { formatInr } from '@/constants/productDetails';
import { requiresAdvancePaymentVerified } from '@/constants/paymentNavigation';
import { PROCUREMENT_SCREEN_COPY } from '@/constants/procurementSteps';
import { useProcurement } from '@/hooks/use-procurement';
import {
  BackArrowIcon,
  BellIcon,
  ClipboardCheckIcon,
  CloudUploadIcon,
  ShieldCheckIcon,
  WalletIcon,
} from '@/icons';
import { ROUTES } from '@/navigation/routes';
import type { Order } from '@/types/order';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';

type ScreenHeaderProps = {
  title: string;
  onBack: () => void;
  onNotifications?: () => void;
  showNotifications?: boolean;
  topInset: number;
};

const ScreenHeader = memo(function ScreenHeader({
  title,
  onBack,
  onNotifications,
  showNotifications = false,
  topInset,
}: ScreenHeaderProps) {
  return (
    <View
      className="border-b border-brand-border bg-brand-white px-lg"
      style={{ paddingTop: topInset }}
    >
      <View className="h-14 flex-row items-center justify-between">
        <View className="min-w-0 flex-1 flex-row items-center">
          <Pressable
            onPress={onBack}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="mr-sm h-10 w-10 items-center justify-center"
          >
            <BackArrowIcon color={brandColors.heading} />
          </Pressable>
          <Typography variant="roleTitle" className="text-[17px] text-brand-heading" numberOfLines={1}>
            {title}
          </Typography>
        </View>
        {showNotifications && onNotifications ? (
          <Pressable
            onPress={onNotifications}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            className="relative h-10 w-10 items-center justify-center"
          >
            <BellIcon size={iconSizes.lg} color={brandColors.primary} />
            <NotificationBadge visible />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

type PaymentGateProps = {
  order: Order;
  onUpload: () => void;
  onBack: () => void;
  topInset: number;
  bottomInset: number;
};

const ProcurementPaymentGate = memo(function ProcurementPaymentGate({
  order,
  onUpload,
  onBack,
  topInset,
  bottomInset,
}: PaymentGateProps) {
  return (
    <View className="flex-1 bg-brand-background">
      <ScreenHeader
        title={PROCUREMENT_SCREEN_COPY.headerTitle}
        onBack={onBack}
        topInset={topInset}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: bottomInset + 120,
          flexGrow: 1,
        }}
      >
        <Animated.View entering={FadeInDown.duration(400)} className="items-center">
          <View
            className="h-20 w-20 items-center justify-center rounded-full bg-brand-primary-tint"
            style={elevation.sm}
          >
            <WalletIcon size={36} color={brandColors.primary} />
          </View>
          <Typography
            variant="headingLeft"
            className="mt-xl text-center text-[22px] text-brand-heading"
          >
            Payment verification needed
          </Typography>
          <Typography
            variant="subheadingLeft"
            className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
          >
            Upload your payment proof so PetroTrade can verify funds and start procurement for this
            order.
          </Typography>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          className="mt-xl rounded-2xl border border-brand-border bg-brand-white p-lg"
          style={elevation.sm}
        >
          <Typography variant="fieldLabel" className="text-[10px] tracking-[0.8px] text-brand-muted">
            ORDER DETAILS
          </Typography>
          <Typography variant="roleTitle" className="mt-sm text-[16px] text-brand-heading">
            {order.poNumber ? `#${order.poNumber}` : order.productName}
          </Typography>
          <Typography variant="roleDescription" className="mt-xs text-[13px] text-brand-body">
            {order.productName}
          </Typography>
          <View className="mt-md flex-row flex-wrap gap-sm">
            <View className="rounded-full bg-brand-surface px-md py-sm">
              <Typography variant="caption" className="text-[12px] normal-case text-brand-body">
                {order.quantityMt} MT
              </Typography>
            </View>
            <View className="rounded-full bg-brand-surface px-md py-sm">
              <Typography variant="caption" className="text-[12px] normal-case text-brand-body">
                {order.paymentMethod}
              </Typography>
            </View>
          </View>
          <Typography variant="roleTitle" className="mt-md text-[20px] text-brand-primary">
            {formatInr(order.amount)}
          </Typography>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(180).duration(400)}
          className="mt-lg gap-md"
        >
          {[
            {
              icon: <CloudUploadIcon size={iconSizes.md} color={brandColors.primary} />,
              title: 'Upload UTR / receipt',
              body: 'Share bank transfer proof with transaction reference.',
            },
            {
              icon: <ClipboardCheckIcon size={iconSizes.md} color={brandColors.primary} />,
              title: 'PetroTrade verifies',
              body: 'Our finance team confirms payment against your order.',
            },
            {
              icon: <ShieldCheckIcon size={iconSizes.md} color={brandColors.primary} />,
              title: 'Procurement unlocks',
              body: 'Matching and inventory allocation begin automatically.',
            },
          ].map((step) => (
            <View
              key={step.title}
              className="flex-row items-start gap-md rounded-2xl border border-brand-border bg-brand-white px-md py-md"
              style={elevation.sm}
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-primary-tint">
                {step.icon}
              </View>
              <View className="min-w-0 flex-1">
                <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                  {step.title}
                </Typography>
                <Typography
                  variant="caption"
                  className="mt-xs text-[12px] leading-[18px] normal-case text-brand-body"
                >
                  {step.body}
                </Typography>
              </View>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      <View
        className="border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: Math.max(bottomInset, 16), gap: 10 }}
      >
        <PrimaryButton label="Upload Payment Proof" onPress={onUpload} />
        <SecondaryButton label="Back" onPress={onBack} variant="outline" />
      </View>
    </View>
  );
});

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
      handleBack,
      handleNotifications,
    } = useProcurement();

    const handleUploadProof = useCallback(() => {
      router.replace(ROUTES.CUSTOMER.PAYMENT_UPLOAD_PROOF as Href);
    }, [router]);

    if (!order) {
      return (
        <View className="flex-1 bg-brand-background">
          <ScreenHeader
            title={PROCUREMENT_SCREEN_COPY.headerTitle}
            onBack={handleBack}
            topInset={insets.top}
          />
          <View className="flex-1 items-center justify-center px-lg">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-surface">
              <ClipboardCheckIcon size={28} color={brandColors.muted} />
            </View>
            <Typography
              variant="headingLeft"
              className="mt-lg text-center text-[20px] text-brand-heading"
            >
              No active order
            </Typography>
            <Typography
              variant="subheadingLeft"
              className="mt-sm text-center text-[14px] text-brand-body"
            >
              Complete checkout to start procurement tracking.
            </Typography>
            <PrimaryButton
              label="Back to Payment"
              onPress={() => router.replace(ROUTES.CUSTOMER.PAYMENT as Href)}
              className="mt-xl"
            />
          </View>
        </View>
      );
    }

    if (
      requiresAdvancePaymentVerified(order) &&
      (!paymentProof || order.verificationStatus !== 'verified')
    ) {
      return (
        <ProcurementPaymentGate
          order={order}
          onUpload={handleUploadProof}
          onBack={handleBack}
          topInset={insets.top}
          bottomInset={insets.bottom}
        />
      );
    }

    if (!procurement) {
      return (
        <View className="flex-1 bg-brand-background">
          <ScreenHeader
            title={PROCUREMENT_SCREEN_COPY.headerTitle}
            onBack={handleBack}
            topInset={insets.top}
          />
          <View className="flex-1 items-center justify-center px-lg">
            <ProcurementHero
              title="Preparing procurement"
              subtitle="Initializing the matching engine for your verified order…"
            />
          </View>
        </View>
      );
    }

    return (
      <View className="flex-1 bg-brand-background">
        <ScreenHeader
          title={PROCUREMENT_SCREEN_COPY.headerTitle}
          onBack={handleBack}
          onNotifications={handleNotifications}
          showNotifications
          topInset={insets.top}
        />

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
      </View>
    );
  },
);
