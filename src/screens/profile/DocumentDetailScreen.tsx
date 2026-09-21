import { memo, useCallback, useEffect, useMemo } from 'react';

import { Pressable, Share, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import Toast from 'react-native-toast-message';

import { AppHeader, LoadingSpinner, ScreenWrapper, Typography } from '@/components';
import { DocumentStatusBadge } from '@/components/documents';
import { ProfileInfoRow } from '@/components/profile';
import { INVOICE_DOC_STATUS_LABELS, PAYMENT_DOC_STATUS_LABELS } from '@/constants/documents';
import { formatInr } from '@/constants/productDetails';
import { ROUTES } from '@/navigation/routes';
import { useDocumentsStore } from '@/store/documents-store';
import { brandColors } from '@/theme/colors';
import type { DocumentKind } from '@/types/documents';
import { formatDate } from '@/utils/date';
import { buildInvoiceDocumentContent, buildPoDocumentContent } from '@/utils/document-content';

function parseKind(value?: string | string[]): DocumentKind {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'invoice' || raw === 'proforma' || raw === 'gst_invoice') return raw;
  return 'purchase_order';
}

export const DocumentDetailScreen = memo(function DocumentDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ kind?: string | string[]; id?: string | string[] }>();
  const kind = parseKind(params.kind);
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const isHydrated = useDocumentsStore((state) => state.isHydrated);
  const isLoading = useDocumentsStore((state) => state.isLoading);
  const fetchFromApi = useDocumentsStore((state) => state.fetchFromApi);
  const markDownloaded = useDocumentsStore((state) => state.markDownloaded);
  const purchaseOrders = useDocumentsStore((state) => state.purchaseOrders);
  const invoices = useDocumentsStore((state) => state.invoices);

  useEffect(() => {
    if (!isHydrated) {
      void fetchFromApi();
    }
  }, [fetchFromApi, isHydrated]);

  const po = useMemo(
    () => (kind === 'purchase_order' ? purchaseOrders.find((item) => item.id === id) : undefined),
    [kind, id, purchaseOrders],
  );
  const invoice = useMemo(
    () => (kind === 'invoice' ? invoices.find((item) => item.id === id) : undefined),
    [kind, id, invoices],
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleShare = useCallback(
    async (title: string, content: string, downloadKind?: DocumentKind, downloadId?: string) => {
      try {
        await Share.share({ title, message: content });
        if (downloadKind && downloadId) {
          markDownloaded(downloadKind, downloadId);
        }
        Toast.show({
          type: 'success',
          text1: 'Document ready',
          text2: 'Use share to save or send this document.',
        });
      } catch {
        Toast.show({ type: 'error', text1: 'Unable to share', text2: 'Please try again.' });
      }
    },
    [markDownloaded],
  );

  if (!isHydrated && isLoading) {
    return (
      <ScreenWrapper className="bg-brand-background">
        <AppHeader variant="back" title="Document" onBack={handleBack} />
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner color={brandColors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (kind === 'purchase_order' && !po) {
    return (
      <ScreenWrapper scrollable className="bg-brand-background" contentClassName="pb-xl">
        <AppHeader variant="back" title="Purchase Order" onBack={handleBack} />
        <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
          <Typography variant="roleTitle">Purchase order not found</Typography>
          <Typography variant="roleDescription" className="mt-sm">
            This purchase order is not available.
          </Typography>
        </View>
      </ScreenWrapper>
    );
  }

  if (kind === 'invoice' && !invoice) {
    return (
      <ScreenWrapper scrollable className="bg-brand-background" contentClassName="pb-xl">
        <AppHeader variant="back" title="Invoice" onBack={handleBack} />
        <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
          <Typography variant="roleTitle">Invoice not found</Typography>
          <Typography variant="roleDescription" className="mt-sm">
            This invoice is not available.
          </Typography>
        </View>
      </ScreenWrapper>
    );
  }

  if (po) {
    const content = buildPoDocumentContent(po);
    return (
      <ScreenWrapper scrollable className="bg-brand-background" contentClassName="pb-xl">
        <AppHeader variant="back" title={po.poNumber} onBack={handleBack} />

        <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-md">
              <Typography variant="roleTitle">{po.poNumber}</Typography>
              <Typography variant="roleDescription" className="mt-xs">
                {po.orderNumber} · {po.product} ({po.grade})
              </Typography>
            </View>
            <DocumentStatusBadge status={po.status} />
          </View>

          <View className="mt-lg gap-md">
            <ProfileInfoRow label="SUPPLY SOURCE" value={po.seller} />
            <ProfileInfoRow label="WAREHOUSE" value={po.warehouse} />
            <ProfileInfoRow label="QUANTITY" value={`${po.quantityMt} MT`} />
            <ProfileInfoRow label="PO DATE" value={formatDate(po.poDate, 'DD/MM/YYYY')} />
            <ProfileInfoRow label="AMOUNT" value={formatInr(po.amount)} />
            <ProfileInfoRow label="PAYMENT TERMS" value={po.paymentTerms} />
            <ProfileInfoRow label="DELIVERY TERMS" value={po.deliveryTerms} />
          </View>
        </View>

        <View className="mt-md rounded-2xl border border-brand-border bg-brand-white p-lg">
          <Typography variant="roleTitle" className="mb-md text-[15px]">
            Pricing
          </Typography>
          <ProfileInfoRow label="TAXABLE VALUE" value={formatInr(po.pricing.taxableValue)} />
          <View className="mt-md">
            <ProfileInfoRow
              label="CGST / SGST"
              value={`${formatInr(po.pricing.cgst)} / ${formatInr(po.pricing.sgst)}`}
            />
          </View>
          <View className="mt-md">
            <ProfileInfoRow label="GRAND TOTAL" value={formatInr(po.pricing.grandTotal)} />
          </View>
        </View>

        <View className="mt-md flex-row gap-sm">
          <ActionButton
            label="Download PDF"
            primary
            onPress={() => void handleShare(po.poNumber, content, 'purchase_order', po.id)}
          />
          <ActionButton label="Share" onPress={() => void handleShare(po.poNumber, content)} />
        </View>
      </ScreenWrapper>
    );
  }

  if (invoice) {
    const content = buildInvoiceDocumentContent(invoice);
    return (
      <ScreenWrapper scrollable className="bg-brand-background" contentClassName="pb-xl">
        <AppHeader variant="back" title={invoice.invoiceNumber} onBack={handleBack} />

        <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-md">
              <Typography variant="roleTitle">{invoice.invoiceNumber}</Typography>
              <Typography variant="roleDescription" className="mt-xs">
                {invoice.orderNumber} · {invoice.poNumber}
              </Typography>
            </View>
            <DocumentStatusBadge status={invoice.status} />
          </View>

          <View className="mt-lg gap-md">
            <ProfileInfoRow
              label="INVOICE DATE"
              value={formatDate(invoice.invoiceDate, 'DD/MM/YYYY')}
            />
            <ProfileInfoRow label="PRODUCT" value={`${invoice.product} (${invoice.grade})`} />
            <ProfileInfoRow label="SUPPLY SOURCE" value={invoice.seller} />
            <ProfileInfoRow label="WAREHOUSE" value={invoice.warehouse} />
            <ProfileInfoRow label="AMOUNT" value={formatInr(invoice.amount)} />
            <ProfileInfoRow label="GST" value={formatInr(invoice.gst)} />
            <ProfileInfoRow label="TOTAL" value={formatInr(invoice.totalAmount)} />
            <ProfileInfoRow
              label="PAYMENT STATUS"
              value={PAYMENT_DOC_STATUS_LABELS[invoice.paymentStatus]}
            />
            <ProfileInfoRow
              label="INVOICE STATUS"
              value={INVOICE_DOC_STATUS_LABELS[invoice.invoiceStatus]}
            />
          </View>
        </View>

        <View className="mt-md flex-row gap-sm">
          <ActionButton
            label="Download PDF"
            primary
            onPress={() => void handleShare(invoice.invoiceNumber, content, 'invoice', invoice.id)}
          />
          <ActionButton
            label="Share"
            onPress={() => void handleShare(invoice.invoiceNumber, content)}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-brand-background">
      <AppHeader
        variant="back"
        title="Document"
        onBack={() => router.replace(ROUTES.CUSTOMER.PROFILE_DOCUMENTS as Href)}
      />
    </ScreenWrapper>
  );
});

function ActionButton({
  label,
  onPress,
  primary,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 items-center rounded-xl py-md ${primary ? 'bg-brand-primary' : 'border border-brand-border bg-brand-white'}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      <Typography
        variant={primary ? 'button' : 'buttonSecondary'}
        className={primary ? 'text-[13px]' : 'text-[13px] text-brand-heading'}
      >
        {label}
      </Typography>
    </Pressable>
  );
}
