import { memo, useCallback, useMemo } from 'react';

import { View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, ReferenceCard, TimelineCard, Typography } from '@/components';
import { formatPaymentCurrency } from '@/constants/payment';
import { HourglassIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { selectCurrentOrder, selectPaymentProof, useOrderStore } from '@/store/order-store';
import { brandColors } from '@/theme/colors';
import type { TimelineStep } from '@/types/document';
import { formatDateTime } from '@/utils/date';
import { wp } from '@/utils/responsive';

const buildPaymentVerificationTimeline = (submittedAt?: string): TimelineStep[] => [
  {
    id: 'submitted',
    title: 'Payment Proof Submitted',
    description: 'Your transaction details and receipt have been received.',
    status: 'completed',
    meta: submittedAt
      ? `Submitted ${formatDateTime(submittedAt, 'DD MMM YYYY, hh:mm A')}`
      : undefined,
  },
  {
    id: 'verification',
    title: 'Payment Verification',
    description: 'Our team is verifying your bank transfer against the order amount.',
    status: 'in_progress',
    meta: 'In Progress — Est. 15–30 minutes',
  },
  {
    id: 'confirmation',
    title: 'Procurement Confirmation',
    description: 'Once verified, your order moves to procurement confirmation.',
    status: 'pending',
    meta: 'Pending verification',
  },
];

export const CustomerPaymentVerificationInitiatedScreen = memo(
  function CustomerPaymentVerificationInitiatedScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const order = useOrderStore(selectCurrentOrder);
    const paymentProof = useOrderStore(selectPaymentProof);

    const timeline = useMemo(
      () => buildPaymentVerificationTimeline(paymentProof?.submittedAt),
      [paymentProof?.submittedAt],
    );

    const handleContinue = useCallback(() => {
      router.replace(ROUTES.CUSTOMER.ORDER_CONFIRMATION as Href);
    }, [router]);

    const handleBack = useCallback(() => {
      if (router.canGoBack()) {
        router.back();
        return;
      }
      router.replace(ROUTES.CUSTOMER.HOME as Href);
    }, [router]);

    return (
      <View
        className="flex-1 bg-brand-white px-lg"
        style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}
      >
        <View className="mt-lg items-center">
          <View className="mb-lg h-20 w-20 items-center justify-center rounded-full bg-brand-primary-light">
            <HourglassIcon size={wp(10)} color={brandColors.primary} />
          </View>

          <Typography variant="headingLeft" className="text-center text-[22px] text-brand-heading">
            Payment Verification Initiated
          </Typography>
          <Typography
            variant="subheadingLeft"
            className="mt-sm px-md text-center text-[14px] leading-[22px] text-brand-body"
          >
            Your payment proof for {order?.productName ?? 'this order'} is under review. We will
            notify you once verification is complete.
          </Typography>
        </View>

        {order ? (
          <View className="mt-xl rounded-2xl border border-brand-border bg-brand-surface p-lg">
            <Typography
              variant="fieldLabel"
              className="text-[10px] tracking-[0.6px] text-brand-muted"
            >
              ORDER AMOUNT
            </Typography>
            <Typography variant="roleTitle" className="mt-xs text-[20px] text-brand-primary">
              {formatPaymentCurrency(order.amount)}
            </Typography>
            <Typography variant="roleDescription" className="mt-sm text-brand-body">
              {order.quantityMt} MT · {order.warehouse}
            </Typography>
          </View>
        ) : null}

        {order ? <ReferenceCard referenceId={order.id} className="mt-lg" /> : null}

        <TimelineCard steps={timeline} className="mt-lg" />

        <View className="mt-auto" style={{ gap: 12 }}>
          <PrimaryButton label="Continue" onPress={handleContinue} showArrow />
          <PrimaryButton label="Back to Home" onPress={handleBack} className="bg-brand-heading" />
        </View>
      </View>
    );
  },
);
