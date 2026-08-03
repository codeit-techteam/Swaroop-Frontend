import { memo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, SecondaryButton, Typography } from '@/components/ui';
import { CREDIT_WORKFLOW_COPY } from '@/constants/creditWorkflow';
import { useCreditPaymentReminder } from '@/hooks/useCreditPaymentReminder';
import { AlertCircleIcon, BackArrowIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';

export const CustomerCreditPaymentReminderScreen = memo(function CustomerCreditPaymentReminderScreen() {
  const insets = useSafeAreaInsets();
  const copy = CREDIT_WORKFLOW_COPY.reminder;
  const {
    order,
    reminderTitle,
    invoiceAmount,
    dueDate,
    creditType,
    handlePayNow,
    handleContactSupport,
    handleBack,
  } = useCreditPaymentReminder();

  return (
    <View className="flex-1 bg-brand-background">
      <View
        className="border-b border-brand-border bg-brand-white px-lg"
        style={{ paddingTop: insets.top }}
      >
        <View className="h-14 flex-row items-center">
          <Pressable onPress={handleBack} className="h-10 w-10 items-center justify-center">
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
          paddingBottom: insets.bottom + 140,
        }}
      >
        <View className="rounded-2xl bg-brand-error px-lg py-lg">
          <View className="flex-row items-center gap-sm">
            <AlertCircleIcon size={iconSizes.lg} color={brandColors.white} />
            <View>
              <Typography variant="roleTitle" className="text-[14px] text-brand-white">
                {copy.paymentDueTitle}
              </Typography>
              <Typography variant="headingLeft" className="text-[24px] text-brand-white">
                {reminderTitle}
              </Typography>
            </View>
          </View>
        </View>

        {order ? (
          <View
            className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg"
            style={elevation.sm}
          >
            <InfoRow label={copy.invoiceAmountLabel} value={invoiceAmount} highlight />
            <InfoRow label={copy.dueDateLabel} value={dueDate} />
            <InfoRow label={copy.creditTypeLabel} value={creditType} />
            {order.credit?.invoiceNumber ? (
              <InfoRow label="Invoice Number" value={order.credit.invoiceNumber} />
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: insets.bottom + 12, gap: 12 }}
      >
        <PrimaryButton label={copy.payNowLabel} onPress={handlePayNow} disabled={!order} />
        <SecondaryButton
          label={copy.contactSupportLabel}
          variant="outline"
          onPress={handleContactSupport}
        />
      </View>
    </View>
  );
});

const InfoRow = memo(function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className="mb-md">
      <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
        {label}
      </Typography>
      <Typography
        variant="roleTitle"
        className={`mt-xs text-[16px] ${highlight ? 'text-brand-primary' : 'text-brand-heading'}`}
      >
        {value}
      </Typography>
    </View>
  );
});
