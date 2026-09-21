import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { FlatList, RefreshControl, Share, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import Toast from 'react-native-toast-message';

import { AppHeader, LoadingSpinner, ScreenWrapper, Typography } from '@/components';
import {
  DocumentFilterTabs,
  DocumentFiltersRow,
  DocumentListCard,
  DocumentPreviewModal,
  DocumentSearchBar,
} from '@/components/documents';
import { SkeletonRow } from '@/components/ui/skeleton';
import {
  DOCUMENT_TABS,
  INVOICE_DOC_STATUS_LABELS,
  PAYMENT_DOC_STATUS_LABELS,
  PROFORMA_STATUS_LABELS,
} from '@/constants/documents';
import { formatInr } from '@/constants/productDetails';
import { ROUTES } from '@/navigation/routes';
import {
  filterGstInvoices,
  filterInvoices,
  filterProformas,
  filterPurchaseOrders,
  getFacetOptions,
  useDocumentsStore,
} from '@/store/documents-store';
import { brandColors } from '@/theme/colors';
import type { DocumentKind, DocumentPreviewState, DocumentTab } from '@/types/documents';
import { formatDate } from '@/utils/date';
import {
  buildGstDocumentContent,
  buildInvoiceDocumentContent,
  buildPoDocumentContent,
  buildProformaDocumentContent,
} from '@/utils/document-content';

const TAB_IDS: DocumentTab[] = ['purchase_orders', 'invoices', 'proforma', 'gst_invoices'];

function parseTab(value?: string | string[]): DocumentTab {
  const raw = Array.isArray(value) ? value[0] : value;
  return TAB_IDS.includes(raw as DocumentTab) ? (raw as DocumentTab) : 'purchase_orders';
}

async function shareContent(title: string, content: string) {
  await Share.share({ title, message: content });
}

export const DocumentsScreen = memo(function DocumentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string | string[] }>();
  const [tab, setTab] = useState<DocumentTab>(() => parseTab(params.tab));
  const [preview, setPreview] = useState<DocumentPreviewState | null>(null);

  const isHydrated = useDocumentsStore((state) => state.isHydrated);
  const isLoading = useDocumentsStore((state) => state.isLoading);
  const loadError = useDocumentsStore((state) => state.loadError);
  const purchaseOrders = useDocumentsStore((state) => state.purchaseOrders);
  const invoices = useDocumentsStore((state) => state.invoices);
  const proformas = useDocumentsStore((state) => state.proformas);
  const gstInvoices = useDocumentsStore((state) => state.gstInvoices);
  const filters = useDocumentsStore((state) => state.filters);
  const setFilters = useDocumentsStore((state) => state.setFilters);
  const resetFilters = useDocumentsStore((state) => state.resetFilters);
  const fetchFromApi = useDocumentsStore((state) => state.fetchFromApi);
  const markDownloaded = useDocumentsStore((state) => state.markDownloaded);
  const duplicatePurchaseOrder = useDocumentsStore((state) => state.duplicatePurchaseOrder);
  const convertProformaToInvoice = useDocumentsStore((state) => state.convertProformaToInvoice);

  useEffect(() => {
    setTab(parseTab(params.tab));
  }, [params.tab]);

  useEffect(() => {
    void fetchFromApi();
  }, [fetchFromApi]);

  const activeTab = DOCUMENT_TABS.find((item) => item.id === tab) ?? DOCUMENT_TABS[0];

  const facets = useMemo(
    () => getFacetOptions({ purchaseOrders, invoices }),
    [purchaseOrders, invoices],
  );

  const poRows = useMemo(
    () => filterPurchaseOrders(purchaseOrders, filters),
    [purchaseOrders, filters],
  );
  const invoiceRows = useMemo(() => filterInvoices(invoices, filters), [invoices, filters]);
  const proformaRows = useMemo(() => filterProformas(proformas, filters), [proformas, filters]);
  const gstRows = useMemo(() => filterGstInvoices(gstInvoices, filters), [gstInvoices, filters]);

  const searchPlaceholder =
    tab === 'purchase_orders'
      ? 'Search PO number, order, product, warehouse…'
      : tab === 'invoices'
        ? 'Search invoice, order, PO, warehouse…'
        : tab === 'proforma'
          ? 'Search proforma, order, product…'
          : 'Search GST invoice, GSTIN, order, PO…';

  const openDetail = useCallback(
    (kind: DocumentKind, id: string) => {
      router.push({
        pathname: ROUTES.CUSTOMER.PROFILE_DOCUMENT_DETAIL,
        params: { kind, id },
      } as unknown as Href);
    },
    [router],
  );

  const handleDownload = useCallback(
    async (kind: DocumentKind, id: string, title: string, content: string) => {
      try {
        await shareContent(title, content);
        markDownloaded(kind, id);
        Toast.show({
          type: 'success',
          text1: 'Download started',
          text2: `${title} is ready to save or share.`,
        });
      } catch {
        Toast.show({ type: 'error', text1: 'Unable to download', text2: 'Please try again.' });
      }
    },
    [markDownloaded],
  );

  const handleShare = useCallback(async (title: string, content: string) => {
    try {
      await shareContent(title, content);
    } catch {
      Toast.show({ type: 'error', text1: 'Unable to share', text2: 'Please try again.' });
    }
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const listData = useMemo(() => {
    if (tab === 'purchase_orders')
      return poRows.map((item) => ({ type: 'purchase_order' as const, item }));
    if (tab === 'invoices') return invoiceRows.map((item) => ({ type: 'invoice' as const, item }));
    if (tab === 'proforma')
      return proformaRows.map((item) => ({ type: 'proforma' as const, item }));
    return gstRows.map((item) => ({ type: 'gst_invoice' as const, item }));
  }, [tab, poRows, invoiceRows, proformaRows, gstRows]);

  const totalCount =
    tab === 'purchase_orders'
      ? purchaseOrders.length
      : tab === 'invoices'
        ? invoices.length
        : tab === 'proforma'
          ? proformas.length
          : gstInvoices.length;

  const renderItem = useCallback(
    ({ item }: { item: (typeof listData)[number] }) => {
      if (item.type === 'purchase_order') {
        const po = item.item;
        const content = buildPoDocumentContent(po);
        return (
          <DocumentListCard
            title={po.poNumber}
            subtitle={`${po.product}${po.grade !== '—' ? ` · ${po.grade}` : ''}`}
            meta={`${po.orderNumber} · ${po.seller} · ${po.warehouse} · ${po.quantityMt} MT · ${formatDate(po.poDate, 'DD/MM/YYYY')}`}
            amount={formatInr(po.amount)}
            status={po.status}
            onView={() => openDetail('purchase_order', po.id)}
            onDownload={() => void handleDownload('purchase_order', po.id, po.poNumber, content)}
            onShare={() => void handleShare(po.poNumber, content)}
            onDuplicate={() => {
              const id = duplicatePurchaseOrder(po.id);
              if (id) {
                Toast.show({ type: 'success', text1: 'Purchase order duplicated' });
                openDetail('purchase_order', id);
              }
            }}
          />
        );
      }

      if (item.type === 'invoice') {
        const inv = item.item;
        const content = buildInvoiceDocumentContent(inv);
        return (
          <DocumentListCard
            title={inv.invoiceNumber}
            subtitle={`${inv.orderNumber} · ${inv.poNumber}`}
            meta={`${formatDate(inv.invoiceDate, 'DD/MM/YYYY')} · GST ${formatInr(inv.gst)}`}
            amount={formatInr(inv.totalAmount)}
            status={inv.status}
            extraBadge={`${PAYMENT_DOC_STATUS_LABELS[inv.paymentStatus]} · ${INVOICE_DOC_STATUS_LABELS[inv.invoiceStatus]}`}
            extraBadgeTone={
              inv.paymentStatus === 'paid'
                ? 'emerald'
                : inv.paymentStatus === 'overdue'
                  ? 'amber'
                  : 'sky'
            }
            onView={() => openDetail('invoice', inv.id)}
            onDownload={() => void handleDownload('invoice', inv.id, inv.invoiceNumber, content)}
            onShare={() => void handleShare(inv.invoiceNumber, content)}
          />
        );
      }

      if (item.type === 'proforma') {
        const pi = item.item;
        const content = buildProformaDocumentContent(pi);
        return (
          <DocumentListCard
            title={pi.proformaNumber}
            subtitle={`${pi.product}${pi.grade !== '—' ? ` · ${pi.grade}` : ''}`}
            meta={`${pi.orderNumber} · ${formatDate(pi.createdDate, 'DD/MM/YYYY')} · Expires ${formatDate(pi.expiryDate, 'DD/MM/YYYY')}`}
            amount={formatInr(pi.amount)}
            status={pi.docStatus}
            extraBadge={PROFORMA_STATUS_LABELS[pi.status]}
            extraBadgeTone={
              pi.status === 'converted'
                ? 'emerald'
                : pi.status === 'expired'
                  ? 'amber'
                  : pi.status === 'cancelled'
                    ? 'slate'
                    : 'sky'
            }
            onView={() => {
              setPreview({
                title: `Proforma ${pi.proformaNumber}`,
                categoryLabel: 'Proforma Invoice',
                fileName: `${pi.proformaNumber}.pdf`,
                documentNumber: pi.proformaNumber,
                orderNumber: pi.orderNumber,
                content,
              });
            }}
            onDownload={() => void handleDownload('proforma', pi.id, pi.proformaNumber, content)}
            onShare={() => void handleShare(pi.proformaNumber, content)}
            onConvert={() => {
              const invId = convertProformaToInvoice(pi.id);
              if (invId) {
                Toast.show({ type: 'success', text1: 'Converted to tax invoice' });
                openDetail('invoice', invId);
              } else {
                Toast.show({ type: 'error', text1: 'Unable to convert this proforma' });
              }
            }}
            convertDisabled={pi.status === 'converted' || pi.status === 'cancelled'}
          />
        );
      }

      const gst = item.item;
      const content = buildGstDocumentContent(gst);
      return (
        <DocumentListCard
          title={gst.invoiceNumber}
          subtitle={`${gst.orderNumber} · ${gst.product}`}
          meta={`${gst.seller} · ${gst.warehouse} · GST ${formatInr(gst.totalGst)} · ${formatDate(gst.invoiceDate, 'DD/MM/YYYY')}`}
          amount={formatInr(gst.grandTotal)}
          status={gst.status}
          onView={() => {
            setPreview({
              title: `GST Invoice ${gst.invoiceNumber}`,
              categoryLabel: 'GST Invoice',
              fileName: `${gst.invoiceNumber}.pdf`,
              documentNumber: gst.invoiceNumber,
              orderNumber: gst.orderNumber,
              content,
            });
          }}
          onDownload={() => void handleDownload('gst_invoice', gst.id, gst.invoiceNumber, content)}
          onShare={() => void handleShare(gst.invoiceNumber, content)}
        />
      );
    },
    [convertProformaToInvoice, duplicatePurchaseOrder, handleDownload, handleShare, openDetail],
  );

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <View className="px-xl">
        <AppHeader variant="back" title="Documents" onBack={handleBack} />
      </View>

      <View className="flex-1 px-xl">
        <Typography variant="legal" className="mt-sm text-left text-brand-muted">
          {activeTab.description}
        </Typography>

        <View className="mt-md">
          <DocumentFilterTabs selected={tab} onSelect={setTab} />
        </View>
        <View className="mt-md">
          <DocumentSearchBar
            value={filters.search}
            placeholder={searchPlaceholder}
            onChangeText={(search) => setFilters({ search })}
          />
        </View>
        <View className="mt-md">
          <DocumentFiltersRow
            filters={filters}
            warehouses={facets.warehouses}
            sellers={facets.sellers}
            onChange={setFilters}
            onReset={resetFilters}
          />
        </View>

        {!isHydrated && isLoading ? (
          <View className="mt-lg gap-md">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </View>
        ) : (
          <FlatList
            data={listData}
            keyExtractor={(row) => `${row.type}-${row.item.id}`}
            renderItem={renderItem}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 32, gap: 12, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading && isHydrated}
                onRefresh={() => void fetchFromApi()}
              />
            }
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-2xl">
                {isLoading ? (
                  <LoadingSpinner color={brandColors.primary} />
                ) : (
                  <>
                    <Typography variant="roleTitle" className="text-center text-brand-heading">
                      {loadError ? 'Unable to load documents' : 'No documents match your filters'}
                    </Typography>
                    <Typography variant="roleDescription" className="mt-sm text-center">
                      {loadError ??
                        'Documents appear automatically as each order advances through the procurement lifecycle.'}
                    </Typography>
                  </>
                )}
              </View>
            }
            ListFooterComponent={
              listData.length > 0 ? (
                <Typography variant="legal" className="mt-sm text-left text-brand-muted">
                  Showing {listData.length} of {totalCount} {activeTab.title.toLowerCase()}
                </Typography>
              ) : null
            }
          />
        )}
      </View>

      <DocumentPreviewModal
        preview={preview}
        onClose={() => setPreview(null)}
        onShare={preview ? () => void handleShare(preview.title, preview.content) : undefined}
      />
    </ScreenWrapper>
  );
});
