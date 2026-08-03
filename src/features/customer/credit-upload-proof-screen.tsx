import { memo, useCallback, useEffect } from 'react';

import { View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {
  OrderDetailsCard,
  PaymentProofHeader,
  PaymentVerificationInfoCard,
  ReceiptUploader,
  TransactionForm,
  TransferBankCard,
} from '@/components/payment';
import { PrimaryButton, Typography } from '@/components/ui';
import { CREDIT_WORKFLOW_COPY } from '@/constants/creditWorkflow';
import { formatPaymentCurrency } from '@/constants/payment';
import { getRouteAfterCreditPaymentUpload } from '@/constants/paymentNavigation';
import { usePaymentProof } from '@/hooks/use-payment-proof';
import { SendIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';

export const CustomerCreditUploadProofScreen = memo(function CustomerCreditUploadProofScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const copy = CREDIT_WORKFLOW_COPY.upload;

  const order = useOrderStore(selectCurrentOrder);
  const isOrderHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const submitCreditPaymentProof = useOrderStore((state) => state.submitCreditPaymentProof);

  useEffect(() => {
    if (!isOrderHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isOrderHydrated]);

  useEffect(() => {
    if (order?.paymentStatus === 'submitted' && order.credit?.workflowPhase === 'payment_uploaded') {
      router.replace(getRouteAfterCreditPaymentUpload());
    }
  }, [order?.credit?.workflowPhase, order?.paymentStatus, router]);

  const handleCreditSubmit = useCallback(
    (proof: Parameters<typeof submitCreditPaymentProof>[0]) => {
      submitCreditPaymentProof(proof);
    },
    [submitCreditPaymentProof],
  );

  const {
    transactionDate,
    setTransactionDate,
    bank,
    setBank,
    paymentMode,
    setPaymentMode,
    utr,
    receipt,
    errors,
    isSubmitting,
    isFormValid,
    handleUtrChange,
    pickFromGallery,
    pickFromCamera,
    removeReceipt,
    replaceReceipt,
    submitPaymentProof,
  } = usePaymentProof(order?.id ?? '', order?.amount ?? 0, {
    onSubmit: handleCreditSubmit,
  });

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.CREDIT_PAYMENT_REMINDER as Href);
  }, [router]);

  const handleHelp = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Credit settlement help',
      text2: 'Transfer the due amount and upload your transaction receipt with UTR details.',
      visibilityTime: 2800,
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!order) {
      return;
    }

    const success = await submitPaymentProof();
    if (success) {
      router.push(getRouteAfterCreditPaymentUpload());
    }
  }, [order, router, submitPaymentProof]);

  if (!order) {
    return (
      <View className="flex-1 bg-brand-background">
        <PaymentProofHeader title={copy.headerTitle} onBackPress={handleBack} onHelpPress={handleHelp} />
        <View className="flex-1 items-center justify-center px-lg">
          <Typography variant="subheadingLeft" className="text-center text-brand-body">
            Order not found.
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-background">
      <PaymentProofHeader title={copy.headerTitle} onBackPress={handleBack} onHelpPress={handleHelp} />

      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 120,
        }}
      >
        <View className="rounded-2xl border border-brand-border bg-brand-white p-lg">
          <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
            {copy.sectionTitle}
          </Typography>
          <View className="mt-md flex-row justify-between">
            <Typography variant="roleDescription" className="text-[13px] text-brand-body">
              {copy.invoiceNumberLabel}
            </Typography>
            <Typography variant="roleTitle" className="text-[13px] text-brand-heading">
              {order.credit?.invoiceNumber ?? '—'}
            </Typography>
          </View>
          <View className="mt-sm flex-row justify-between">
            <Typography variant="roleDescription" className="text-[13px] text-brand-body">
              {copy.dueAmountLabel}
            </Typography>
            <Typography variant="roleTitle" className="text-[13px] text-brand-primary">
              {formatPaymentCurrency(order.amount)}
            </Typography>
          </View>
        </View>

        <OrderDetailsCard order={order} className="mt-lg" />
        <TransferBankCard className="mt-lg" />

        <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
          <TransactionForm
            amount={order.amount}
            transactionDate={transactionDate}
            onTransactionDateChange={setTransactionDate}
            bank={bank}
            onBankChange={setBank}
            bankError={errors.bank}
            paymentMode={paymentMode}
            onPaymentModeChange={setPaymentMode}
            utr={utr}
            onUtrChange={handleUtrChange}
            utrError={errors.utr}
          />
        </View>

        <ReceiptUploader
          className="mt-lg"
          receipt={receipt}
          error={errors.receipt}
          onPickGallery={pickFromGallery}
          onPickCamera={pickFromCamera}
          onRemove={removeReceipt}
          onReplace={replaceReceipt}
        />

        <PaymentVerificationInfoCard className="mt-lg" />
      </KeyboardAwareScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <PrimaryButton
          label={copy.submitLabel}
          onPress={handleSubmit}
          disabled={!isFormValid}
          loading={isSubmitting}
          leftIcon={<SendIcon />}
        />
      </View>
    </View>
  );
});
