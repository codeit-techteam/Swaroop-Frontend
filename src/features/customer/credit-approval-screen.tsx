import { memo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, Typography } from '@/components/ui';
import { CREDIT_WORKFLOW_COPY } from '@/constants/creditWorkflow';
import { formatPaymentCurrency } from '@/constants/payment';
import { useCreditApproval } from '@/hooks/useCreditApproval';
import {
  BackArrowIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  SuccessShield,
  WalletIcon,
} from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';

type DetailRowProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

const DetailRow = memo(function DetailRow({ label, value, highlight }: DetailRowProps) {
  return (
    <View className="flex-row items-center justify-between py-sm">
      <Typography variant="roleDescription" className="text-[13px] text-brand-body">
        {label}
      </Typography>
      <Typography
        variant="roleTitle"
        className={highlight ? 'text-[14px] text-brand-primary' : 'text-[14px] text-brand-heading'}
      >
        {value}
      </Typography>
    </View>
  );
});

export const CustomerCreditApprovalScreen = memo(function CustomerCreditApprovalScreen() {
  const insets = useSafeAreaInsets();
  const { order, details, isApproved, handleContinue, handleBack } = useCreditApproval();
  const copy = CREDIT_WORKFLOW_COPY.approval;

  return (
    <View className="flex-1 bg-brand-background">
      <View
        className="border-b border-brand-border bg-brand-white px-lg"
        style={{ paddingTop: insets.top }}
      >
        <View className="h-14 flex-row items-center">
          <Pressable
            onPress={handleBack}
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
          paddingTop: 24,
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center">
          <SuccessShield width={200} height={170} />
          <View className="mt-md flex-row items-center gap-sm">
            <ShieldCheckIcon size={iconSizes.md} color={brandColors.primary} />
            <WalletIcon size={iconSizes.md} color={brandColors.success} />
            <CheckCircleIcon size={iconSizes.md} color={brandColors.success} />
          </View>
        </View>

        <Typography variant="headingLeft" className="mt-lg text-center text-[22px] text-brand-heading">
          {copy.title}
        </Typography>

        {details ? (
          <View
            className="mt-xl rounded-2xl border border-brand-border bg-brand-white p-lg"
            style={elevation.sm}
          >
            <DetailRow label={copy.creditTypeLabel} value={details.creditType} highlight />
            <View className="my-xs border-t border-brand-border" />
            <DetailRow label={copy.approvedLimitLabel} value={details.approvedLimit} />
            <DetailRow label={copy.availableLimitLabel} value={details.availableLimit} highlight />
            <DetailRow label={copy.interestLabel} value={details.interest} />
            <View className="my-xs border-t border-brand-border" />
            <DetailRow label={copy.dueAfterLabel} value={details.dueAfterDelivery} highlight />
          </View>
        ) : null}

        {order ? (
          <Typography
            variant="subheadingLeft"
            className="mt-md text-center text-[13px] text-brand-muted"
          >
            {order.productName} · {order.quantityMt} MT · {formatPaymentCurrency(order.amount)}
          </Typography>
        ) : null}
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <PrimaryButton
          label={copy.continueLabel}
          onPress={handleContinue}
          disabled={!order || !isApproved}
        />
      </View>
    </View>
  );
});
