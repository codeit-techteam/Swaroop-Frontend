import { memo, useCallback, useEffect, useMemo } from 'react';

import { View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {
  CheckoutFlowStepper,
  OrderDetailsCard,
  PaymentProofHeader,
  PaymentVerificationInfoCard,
  ReceiptUploader,
  TransactionForm,
  TransferBankCard,
} from '@/components/payment';
import { PrimaryButton } from '@/components/ui/primary-button';
import { usePaymentProof } from '@/hooks/use-payment-proof';
import { SendIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { selectCartItems, useCartStore } from '@/store/cart-store';
import { selectCheckoutAddress, useCheckoutStore } from '@/store/checkout-store';
import {
  createOrderId,
  selectCurrentOrder,
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';
import { selectPaymentCalculation, usePaymentStore } from '@/store/payment-store';
import type { Order } from '@/types/order';

const toTitleCase = (value: string): string =>
  value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const buildBlindProductName = (productType: string, name: string): string => {
  const typeLabel = toTitleCase(productType.replace(/_/g, ' '));
  const suffix = name.replace(/^PP\s+[A-Z0-9]+\s*/i, '').trim();
  if (suffix) {
    return `${typeLabel} (PP) ${suffix}`;
  }
  return `${typeLabel} (PP)`;
};

const buildOrderFromStores = (
  cartItems: ReturnType<typeof selectCartItems>,
  shippingAddress: ReturnType<typeof selectCheckoutAddress>,
  payment: ReturnType<typeof selectPaymentCalculation>,
): Order | null => {
  const primary = cartItems[0];
  if (!primary) {
    return null;
  }

  const totalQty = cartItems.reduce((sum, item) => sum + item.quantityMt, 0);

  return {
    id: createOrderId(),
    productName: buildBlindProductName(primary.productType, primary.name),
    grade: primary.grade ?? '',
    productCategory: 'PP',
    quantityMt: totalQty,
    warehouse: shippingAddress.warehouseName,
    destination: `${shippingAddress.line2}, ${shippingAddress.state}`,
    eta: null,
    progress: 0,
    shipmentStatus: 'processing',
    insuranceCovered: false,
    isMasterShipment: false,
    documents: [],
    amount: payment.payableAmount,
    paymentMethod: payment.methodTitle,
    paymentMethodId: payment.methodId,
    paymentStatus: 'pending',
    verificationStatus: 'none',
    procurement: null,
    paymentVerifiedAt: null,
    orderStatus: 'draft',
    priceLockStatus: 'active',
    priceLockStartedAt: null,
    priceLockDurationSeconds: 0,
    validationTimeline: null,
    confirmationStatus: 'pending_petrotrade',
    supplierConfirmation: 'pending',
    inventoryReserved: false,
    poNumber: null,
    poGenerated: false,
    procurementCompleted: false,
    dispatchStatus: null,
    documentsReady: false,
    workflowTimeline: null,
    dispatchReadiness: null,
    transitWindow: null,
    createdAt: new Date().toISOString(),
  };
};

export const CustomerPaymentUploadProofScreen = memo(function CustomerPaymentUploadProofScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const cartItems = useCartStore(selectCartItems);
  const shippingAddress = useCheckoutStore(selectCheckoutAddress);
  const payment = usePaymentStore(selectPaymentCalculation);
  const currentOrder = useOrderStore(selectCurrentOrder);
  const isOrderHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);

  useEffect(() => {
    if (!isOrderHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isOrderHydrated]);

  useEffect(() => {
    if (currentOrder?.paymentStatus === 'submitted') {
      router.replace(ROUTES.CUSTOMER.PAYMENT_VERIFICATION_INITIATED as Href);
    }
  }, [currentOrder?.paymentStatus, router]);

  const order = useMemo(() => {
    if (currentOrder) {
      return currentOrder;
    }

    return buildOrderFromStores(cartItems, shippingAddress, payment);
  }, [cartItems, currentOrder, payment, shippingAddress]);

  useEffect(() => {
    if (order && order.paymentStatus === 'pending' && !currentOrder) {
      setCurrentOrder(order);
    }
  }, [currentOrder, order, setCurrentOrder]);

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
  } = usePaymentProof(order?.id ?? '', order?.amount ?? 0);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.PAYMENT as Href);
  }, [router]);

  const handleHelp = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Payment proof help',
      text2: 'Transfer the amount and upload your transaction receipt with UTR details.',
      visibilityTime: 2800,
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!order) {
      Toast.show({
        type: 'error',
        text1: 'Order unavailable',
        text2: 'Return to checkout and try again.',
        visibilityTime: 2400,
      });
      return;
    }

    const success = await submitPaymentProof();
    if (success) {
      router.push(ROUTES.CUSTOMER.PAYMENT_VERIFICATION_INITIATED as Href);
    }
  }, [order, router, submitPaymentProof]);

  if (!order) {
    return (
      <View className="flex-1 bg-brand-background">
        <PaymentProofHeader onBackPress={handleBack} onHelpPress={handleHelp} />
        <View className="flex-1 items-center justify-center px-lg">
          <PrimaryButton
            label="Back to Payment"
            onPress={() => router.replace(ROUTES.CUSTOMER.PAYMENT as Href)}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-background">
      <PaymentProofHeader onBackPress={handleBack} onHelpPress={handleHelp} />

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
        <CheckoutFlowStepper />

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
          label="Submit Payment Proof"
          onPress={handleSubmit}
          disabled={!isFormValid}
          loading={isSubmitting}
          leftIcon={<SendIcon />}
          accessibilityLabel="Submit payment proof"
        />
      </View>
    </View>
  );
});
