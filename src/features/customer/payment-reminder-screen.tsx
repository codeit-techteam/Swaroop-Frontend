import { memo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, Typography } from '@/components/ui';
import { formatPaymentCurrency } from '@/constants/payment';
import { PAYMENT_WORKFLOW_COPY } from '@/constants/paymentWorkflow';
import { usePaymentReminder } from '@/hooks/usePaymentReminder';
import { BackArrowIcon, ClockIcon, WalletIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';

export const CustomerPaymentReminderScreen = memo(function CustomerPaymentReminderScreen() {
  const insets = useSafeAreaInsets();
  const { order, handlePayNow, handleBack } = usePaymentReminder();
  const copy = PAYMENT_WORKFLOW_COPY.paymentReminder;

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
            {copy.headerTitle}
          </Typography>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: insets.bottom + 120,
        }}
      >
        <Typography variant="headingLeft" className="text-[22px] text-brand-heading">
          {copy.title}
        </Typography>
        <Typography
          variant="subheadingLeft"
          className="mt-sm text-[14px] leading-[22px] text-brand-body"
        >
          {copy.subtitle}
        </Typography>

        {order ? (
          <View
            className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg"
            style={elevation.sm}
          >
            <View className="flex-row items-center justify-between">
              <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
                ORDER CONTEXT
              </Typography>
              <View className="rounded-full bg-brand-primary-tint px-sm py-xs">
                <Typography variant="badge" className="text-[10px] text-brand-primary">
                  Awaiting OLP
                </Typography>
              </View>
            </View>

            <Typography variant="roleTitle" className="mt-md text-[16px] text-brand-heading">
              {order.productName}
            </Typography>
            <Typography variant="roleDescription" className="mt-xs text-brand-body">
              {order.quantityMt} MT · {order.id}
            </Typography>

            <View className="my-lg border-t border-brand-border" />

            <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
              {copy.amountLabel}
            </Typography>
            <Typography variant="headingLeft" className="mt-xs text-[24px] text-brand-primary">
              {formatPaymentCurrency(order.amount)}
            </Typography>

            <View className="mt-md flex-row items-center gap-sm">
              <WalletIcon size={iconSizes.sm} color={brandColors.primary} />
              <Typography variant="roleDescription" className="text-[13px] text-brand-body">
                {copy.methodLabel}: {copy.methodValue}
              </Typography>
            </View>
          </View>
        ) : null}

        <View className="mt-lg flex-row items-center gap-sm rounded-xl border-l-4 border-brand-error bg-brand-white p-md">
          <ClockIcon size={iconSizes.md} color={brandColors.error} />
          <Typography variant="subheadingLeft" className="flex-1 text-[13px] text-brand-body">
            Complete payment promptly to avoid dispatch delays.
          </Typography>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <PrimaryButton
          label={copy.payNowLabel}
          onPress={handlePayNow}
          disabled={!order}
          leftIcon={<WalletIcon size={iconSizes.md} color={brandColors.white} />}
        />
      </View>
    </View>
  );
});
