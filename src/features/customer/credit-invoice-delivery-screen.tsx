import { memo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { PrimaryButton, Typography } from '@/components/ui';
import { CREDIT_WORKFLOW_COPY } from '@/constants/creditWorkflow';
import { useCreditInvoiceDelivery } from '@/hooks/useCreditInvoiceDelivery';
import { BackArrowIcon, DeliverySuccessIllustration, DownloadIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';

type DocButtonProps = {
  label: string;
  onPress: () => void;
};

const DocButton = memo(function DocButton({ label, onPress }: DocButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-xl border border-brand-border bg-brand-surface px-md py-md"
    >
      <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
        {label}
      </Typography>
      <DownloadIcon size={iconSizes.md} color={brandColors.primary} />
    </Pressable>
  );
});

export const CustomerCreditInvoiceDeliveryScreen = memo(function CustomerCreditInvoiceDeliveryScreen() {
  const insets = useSafeAreaInsets();
  const copy = CREDIT_WORKFLOW_COPY.invoiceDelivery;
  const {
    order,
    invoiceNumber,
    invoiceDate,
    dueDate,
    paymentMethodLabel,
    deliveredTime,
    handleBack,
    handleContinue,
    handleDownloadDocument,
  } = useCreditInvoiceDelivery();

  const onDownload = (docType: string, label: string) => {
    handleDownloadDocument(docType);
    Toast.show({ type: 'info', text1: 'Download started', text2: label });
  };

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
          paddingBottom: insets.bottom + 120,
        }}
      >
        <View className="items-center">
          <DeliverySuccessIllustration width={220} height={160} />
        </View>

        {order ? (
          <View
            className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg"
            style={elevation.sm}
          >
            <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
              PRODUCT
            </Typography>
            <Typography variant="roleTitle" className="mt-xs text-[16px] text-brand-heading">
              {order.productName}
            </Typography>

            <View className="my-md border-t border-brand-border" />

            <InfoRow label="Warehouse" value={order.warehouse} />
            <InfoRow label="Destination" value={order.destination} />
            <InfoRow label="Delivered Time" value={deliveredTime} />
            <InfoRow label="Delivered Quantity" value={`${order.quantityMt} MT`} />
            <InfoRow label={copy.invoiceNumberLabel} value={invoiceNumber ?? '—'} />
            <InfoRow label={copy.invoiceDateLabel} value={invoiceDate ?? '—'} />
            <InfoRow label={copy.paymentMethodLabel} value={paymentMethodLabel} highlight />
          </View>
        ) : null}

        <Typography variant="roleTitle" className="mb-md mt-lg text-[14px] text-brand-heading">
          {copy.documentsHeading}
        </Typography>
        <View className="gap-sm">
          <DocButton label={copy.invoicePdf} onPress={() => onDownload('invoice', copy.invoicePdf)} />
          <DocButton
            label={copy.deliveryChallan}
            onPress={() => onDownload('challan', copy.deliveryChallan)}
          />
          <DocButton
            label={copy.taxInvoice}
            onPress={() => onDownload('tax', copy.taxInvoice)}
          />
        </View>

        <View className="mt-lg rounded-2xl border border-brand-primary bg-brand-primary-tint p-lg">
          <Typography variant="roleTitle" className="text-[16px] text-brand-primary">
            {copy.paymentDueTitle}
          </Typography>
          <Typography variant="subheadingLeft" className="mt-xs text-[13px] text-brand-body">
            {order?.credit?.creditDays ?? 15} {copy.paymentDueSubtitle}
          </Typography>
          <Typography variant="fieldLabel" className="mt-md text-[10px] text-brand-muted">
            {copy.dueDateLabel}
          </Typography>
          <Typography variant="headingLeft" className="mt-xs text-[20px] text-brand-heading">
            {dueDate ?? '—'}
          </Typography>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <PrimaryButton label={copy.continueLabel} onPress={handleContinue} disabled={!order} />
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
    <View className="mb-sm flex-row items-start justify-between gap-md">
      <Typography variant="roleDescription" className="text-[13px] text-brand-body">
        {label}
      </Typography>
      <Typography
        variant="roleTitle"
        className={`max-w-[55%] text-right text-[13px] ${highlight ? 'text-brand-primary' : 'text-brand-heading'}`}
        numberOfLines={2}
      >
        {value}
      </Typography>
    </View>
  );
});
