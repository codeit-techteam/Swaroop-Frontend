import { memo } from 'react';

import { ActivityIndicator, Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, Typography } from '@/components/ui';
import { PAYMENT_WORKFLOW_COPY } from '@/constants/paymentWorkflow';
import { useCreditApproval } from '@/hooks/useCreditApproval';
import { BackArrowIcon, CheckCircleIcon, ShieldCheckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

export const CustomerCreditApprovalScreen = memo(function CustomerCreditApprovalScreen() {
  const insets = useSafeAreaInsets();
  const { order, isApproved, isChecking, handleContinue, handleBack } = useCreditApproval();
  const copy = PAYMENT_WORKFLOW_COPY.creditApproval;

  return (
    <View className="flex-1 bg-brand-background px-lg" style={{ paddingTop: insets.top + 16 }}>
      <Pressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        className="h-10 w-10 items-center justify-center"
      >
        <BackArrowIcon color={brandColors.heading} />
      </Pressable>

      <View className="mt-xl items-center">
        {isChecking ? (
          <ActivityIndicator size="large" color={brandColors.primary} />
        ) : (
          <View className="mb-lg h-16 w-16 items-center justify-center rounded-full bg-brand-success-light">
            <CheckCircleIcon size={iconSizes.xl} color={brandColors.success} />
          </View>
        )}

        <Typography variant="headingLeft" className="text-center text-[22px] text-brand-heading">
          {isChecking ? copy.title : copy.approvedTitle}
        </Typography>
        <Typography
          variant="subheadingLeft"
          className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
        >
          {isChecking ? copy.subtitle : copy.approvedSubtitle}
        </Typography>
      </View>

      {order ? (
        <View className="mt-xl rounded-2xl border border-brand-border bg-brand-white p-lg">
          <View className="flex-row items-center gap-sm">
            <ShieldCheckIcon size={iconSizes.md} color={brandColors.primary} />
            <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
              Order Reference: {order.id}
            </Typography>
          </View>
          <Typography variant="roleDescription" className="mt-sm text-brand-body">
            {order.productName} · {order.quantityMt} MT · {order.paymentMethod}
          </Typography>
        </View>
      ) : null}

      {isApproved && !isChecking ? (
        <View className="mt-xl">
          <PrimaryButton label={copy.continueLabel} onPress={handleContinue} disabled={!order} />
        </View>
      ) : null}
    </View>
  );
});
