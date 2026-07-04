import { memo, useCallback } from 'react';

import { Pressable, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { formatPaymentCurrency } from '@/constants/payment';
import { BackArrowIcon, CheckCircleIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { selectPaymentCalculation, usePaymentStore } from '@/store/payment-store';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

export const CustomerOrderConfirmationScreen = memo(function CustomerOrderConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const payment = usePaymentStore(selectPaymentCalculation);

  const handleBackHome = useCallback(() => {
    router.replace(ROUTES.CUSTOMER.HOME as Href);
  }, [router]);

  return (
    <View className="flex-1 bg-brand-white px-lg" style={{ paddingTop: insets.top + 16 }}>
      <Pressable
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          handleBackHome();
        }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        className="h-10 w-10 items-center justify-center"
      >
        <BackArrowIcon color={brandColors.heading} />
      </Pressable>

      <View className="mt-xl items-center">
        <View className="mb-lg h-16 w-16 items-center justify-center rounded-full bg-brand-success-light">
          <CheckCircleIcon size={iconSizes.xl} color={brandColors.success} />
        </View>

        <Typography variant="headingLeft" className="text-center text-[22px] text-brand-heading">
          Order Confirmation
        </Typography>
        <Typography
          variant="subheadingLeft"
          className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
        >
          Frontend placeholder only. No order has been placed and no payment was processed.
        </Typography>
      </View>

      <View className="mt-xl rounded-2xl border border-brand-border bg-brand-surface p-lg">
        <Typography variant="fieldLabel" className="text-[10px] tracking-[0.6px] text-brand-muted">
          SELECTED PAYMENT METHOD
        </Typography>
        <Typography variant="roleTitle" className="mt-xs text-[16px] text-brand-heading">
          {payment.methodTitle}
        </Typography>

        {payment.discount > 0 ? (
          <Typography variant="roleDescription" className="mt-sm text-brand-success">
            Discount: −{formatPaymentCurrency(payment.discount)}
          </Typography>
        ) : null}

        {payment.interestRate > 0 ? (
          <Typography variant="roleDescription" className="mt-sm text-brand-body">
            Interest ({payment.interestRate}%): {formatPaymentCurrency(payment.interest)}
          </Typography>
        ) : null}

        <Typography variant="roleTitle" className="mt-md text-[18px] text-brand-primary">
          Payable: {formatPaymentCurrency(payment.payableAmount)}
        </Typography>
      </View>

      <Pressable
        onPress={handleBackHome}
        accessibilityRole="button"
        accessibilityLabel="Back to home"
        className="mt-xl h-12 items-center justify-center rounded-xl bg-brand-heading"
      >
        <Typography variant="button" className="text-[14px] tracking-normal">
          Back to Home
        </Typography>
      </Pressable>
    </View>
  );
});
