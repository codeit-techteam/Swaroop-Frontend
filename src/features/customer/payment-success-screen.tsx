import { memo } from 'react';

import { View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, Typography } from '@/components/ui';
import { formatPaymentCurrency } from '@/constants/payment';
import { PAYMENT_WORKFLOW_COPY } from '@/constants/paymentWorkflow';
import { usePaymentSuccess } from '@/hooks/usePaymentSuccess';
import { CheckCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

export const CustomerPaymentSuccessScreen = memo(function CustomerPaymentSuccessScreen() {
  const insets = useSafeAreaInsets();
  const { order, handleContinue } = usePaymentSuccess();
  const copy = PAYMENT_WORKFLOW_COPY.paymentSuccess;

  return (
    <View className="flex-1 bg-brand-white px-lg" style={{ paddingTop: insets.top + 16 }}>
      <View className="mt-xl items-center">
        <View className="mb-lg h-16 w-16 items-center justify-center rounded-full bg-brand-success-light">
          <CheckCircleIcon size={iconSizes.xl} color={brandColors.success} />
        </View>

        <Typography variant="headingLeft" className="text-center text-[22px] text-brand-heading">
          {copy.title}
        </Typography>
        <Typography
          variant="subheadingLeft"
          className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
        >
          {copy.subtitle}
        </Typography>
      </View>

      {order ? (
        <View className="mt-xl rounded-2xl border border-brand-border bg-brand-surface p-lg">
          <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
            ORDER REFERENCE
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[16px] text-brand-heading">
            {order.id}
          </Typography>
          <Typography variant="roleDescription" className="mt-sm text-brand-body">
            {order.productName} · {order.quantityMt} MT
          </Typography>
          <Typography variant="roleTitle" className="mt-md text-[18px] text-brand-primary">
            {formatPaymentCurrency(order.amount)}
          </Typography>
        </View>
      ) : null}

      <View className="mt-xl">
        <PrimaryButton label={copy.continueLabel} onPress={handleContinue} />
      </View>
    </View>
  );
});
