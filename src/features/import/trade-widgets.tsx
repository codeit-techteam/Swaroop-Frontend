import { useEffect, useRef, useState } from 'react';

import {
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { InputField, PrimaryButton, SecondaryButton, Typography } from '@/components';
import {
  deleteListingDocument,
  downloadListingDocument,
  fetchImportPaymentTerms,
  fetchListingDocuments,
  uploadListingDocument,
} from '@/features/import/api';
import {
  Card,
  DateField,
  EmptyBlock,
  EnumField,
  LoadingBlock,
  Notice,
  SelectField,
  type Option,
} from '@/features/import/components';
import {
  DECIMAL_PRICE,
  DECIMAL_QTY,
  formatDate,
  importLabel,
  newIdempotencyKey,
  parseImportError,
} from '@/features/import/format';
import type { ImportDocument, ImportQuantityUnit, ImportTermsInput } from '@/features/import/types';
import { showConfirmDialog } from '@/store/dialog-store';

// Offer / counteroffer --------------------------------------------------------

export type TermsDefaults = {
  price?: string | null;
  quantity?: string | null;
  paymentTermId?: string | null;
  esd?: string | null;
  lsd?: string | null;
  inspectionType?: string | null;
};

export type FixedTerms = {
  currencyCode: string | null;
  priceUnit: ImportQuantityUnit | null;
  quantityUnit: ImportQuantityUnit | null;
  incoterm: string | null;
  priceBasis: string | null;
};

type TermsSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  submitLabel: string;
  fixed: FixedTerms;
  defaults: TermsDefaults;
  inspectionTypes: readonly string[];
  onSubmit: (terms: ImportTermsInput, idempotencyKey: string) => Promise<void>;
};

/** Currency, Incoterm and units are fixed by the listing and shown read-only. */
export function TermsSheet(props: TermsSheetProps) {
  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="slide"
      onRequestClose={props.onClose}
      statusBarTranslucent
    >
      {/* Mounted per open, so the form starts from the latest defaults. */}
      {props.visible ? <TermsForm {...props} /> : null}
    </Modal>
  );
}

function TermsForm({
  onClose,
  title,
  description,
  submitLabel,
  fixed,
  defaults,
  inspectionTypes,
  onSubmit,
}: TermsSheetProps) {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<ImportTermsInput>(() => ({
    price: defaults.price ?? '',
    quantity: defaults.quantity ?? '',
    paymentTermId: defaults.paymentTermId ?? undefined,
    esd: defaults.esd ?? '',
    lsd: defaults.lsd ?? '',
    inspectionType: defaults.inspectionType ?? undefined,
    otherTerms: '',
    note: '',
  }));
  const [terms, setTerms] = useState<Option[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const keyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!fixed.currencyCode) return;
    let cancelled = false;
    fetchImportPaymentTerms(fixed.currencyCode)
      .then((list) => {
        if (!cancelled) {
          setTerms(list.map((t) => ({ value: t.id, label: t.displayName ?? t.name })));
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [fixed.currencyCode]);

  const set = (key: keyof ImportTermsInput, value: string | undefined) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit() {
    const local: Record<string, string> = {};
    if (!form.price || !DECIMAL_PRICE.test(form.price))
      local.price = 'Enter a price with up to 4 decimal places.';
    if (!form.quantity || !DECIMAL_QTY.test(form.quantity))
      local.quantity = 'Enter a quantity with up to 3 decimal places.';
    if (form.esd && form.lsd && form.esd > form.lsd)
      local.lsd = 'Latest shipment date must be on or after the earliest date.';
    setErrors(local);
    if (Object.keys(local).length) return;

    const payload: ImportTermsInput = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== undefined && v !== ''),
    );
    keyRef.current ??= newIdempotencyKey();
    setSubmitting(true);
    try {
      await onSubmit(payload, keyRef.current);
      keyRef.current = null;
      onClose();
    } catch (error) {
      const e = parseImportError(error);
      // Keep the key only when the request may not have reached the server.
      if (e.status !== null) keyRef.current = null;
      if (e.fields.length) {
        setErrors(Object.fromEntries(e.fields.map((f) => [f.field, f.message])));
      }
      Toast.show({ type: 'error', text1: e.message });
    } finally {
      setSubmitting(false);
    }
  }

  const qtyUnit = importLabel(fixed.quantityUnit ?? 'MT');
  const priceUnit = importLabel(fixed.priceUnit ?? 'MT');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 justify-end"
      style={{ backgroundColor: 'rgba(16, 52, 96, 0.52)' }}
    >
      <Pressable className="flex-1" onPress={onClose} accessibilityLabel="Close" />
      <View
        className="max-h-[90%] rounded-t-[28px] bg-brand-white px-lg pt-lg"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="mb-md h-1.5 w-12 self-center rounded-full bg-brand-border" />
        <Typography variant="headingLeft" className="text-[19px]">
          {title}
        </Typography>
        {description ? (
          <Typography variant="roleDescription" className="mt-xs text-brand-muted">
            {description}
          </Typography>
        ) : null}
        <ScrollView
          className="mt-md"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 14, paddingBottom: 12 }}
        >
          <Notice tone="neutral">
            Fixed by the listing: {fixed.currencyCode ?? '—'} per {priceUnit} ·{' '}
            {fixed.incoterm ?? '—'}
            {fixed.priceBasis ? ` ${fixed.priceBasis}` : ''}. Prices are only compared on the same
            Incoterm and location.
          </Notice>
          <InputField
            label={`Price (${fixed.currencyCode ?? ''} / ${priceUnit}) *`}
            value={form.price ?? ''}
            onChangeText={(v) => set('price', v.trim())}
            keyboardType="decimal-pad"
            error={errors.price}
          />
          <InputField
            label={`Quantity (${qtyUnit}) *`}
            value={form.quantity ?? ''}
            onChangeText={(v) => set('quantity', v.trim())}
            keyboardType="decimal-pad"
            error={errors.quantity}
          />
          <SelectField
            label="Payment terms"
            value={form.paymentTermId}
            options={terms}
            placeholder="Keep listing terms"
            onChange={(v) => set('paymentTermId', v ?? undefined)}
            error={errors.paymentTermId}
          />
          <DateField
            label="Earliest shipment"
            value={form.esd || null}
            onChange={(v) => set('esd', v ?? '')}
            error={errors.esd}
          />
          <DateField
            label="Latest shipment"
            value={form.lsd || null}
            minimumDate={form.esd || null}
            onChange={(v) => set('lsd', v ?? '')}
            error={errors.lsd}
          />
          <EnumField
            label="Inspection"
            value={form.inspectionType}
            values={inspectionTypes}
            placeholder="Keep listing terms"
            onChange={(v) => set('inspectionType', v ?? undefined)}
            error={errors.inspectionType}
          />
          <InputField
            label="Other terms"
            value={form.otherTerms ?? ''}
            onChangeText={(v) => set('otherTerms', v)}
            multiline
            maxLength={3000}
            error={errors.otherTerms}
          />
          <InputField
            label="Message"
            value={form.note ?? ''}
            onChangeText={(v) => set('note', v)}
            multiline
            maxLength={2000}
            error={errors.note}
          />
          <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
            Do not share contact details. Identities are revealed after the deal is confirmed.
          </Typography>
        </ScrollView>
        <View className="flex-row gap-sm pt-sm">
          <SecondaryButton
            variant="outline"
            label="Cancel"
            className="flex-1"
            disabled={submitting}
            onPress={onClose}
          />
          <PrimaryButton
            label={submitting ? 'Sending…' : submitLabel}
            className="flex-1"
            disabled={submitting}
            onPress={() => void submit()}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// Reason prompt -----------------------------------------------------------------

export function ReasonSheet({
  visible,
  title,
  message,
  confirmLabel,
  inputLabel = 'Reason (optional)',
  busy,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  inputLabel?: string;
  busy: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState('');
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(16, 52, 96, 0.52)' }}
      >
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel="Close" />
        <View
          className="gap-md rounded-t-[28px] bg-brand-white px-lg pt-lg"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Typography variant="headingLeft" className="text-[19px]">
            {title}
          </Typography>
          <Typography variant="roleDescription">{message}</Typography>
          <InputField
            label={inputLabel}
            value={reason}
            onChangeText={setReason}
            multiline
            maxLength={2000}
          />
          <View className="flex-row gap-sm">
            <SecondaryButton variant="outline" label="Back" className="flex-1" onPress={onClose} />
            <PrimaryButton
              label={busy ? 'Working…' : confirmLabel}
              className="flex-1"
              disabled={busy}
              onPress={() => onConfirm(reason.trim())}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Attachments -------------------------------------------------------------------

/** Categories accepted by the backend for Import listing attachments. */
const DOCUMENT_CATEGORIES = [
  'COA',
  'TDS',
  'SDS',
  'MSDS',
  'CERTIFICATE_OF_ORIGIN',
  'PRODUCT_SPECIFICATION',
  'INSPECTION_CERTIFICATE',
  'COMMERCIAL_INVOICE',
  'PACKING_LIST',
  'BILL_OF_LADING',
  'INSURANCE_CERTIFICATE',
  'OTHER',
];

const MAX_BYTES = 10 * 1024 * 1024;

function sizeLabel(bytes: string | null): string {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsCard({ listingId, canManage }: { listingId: string; canManage: boolean }) {
  const [docs, setDocs] = useState<ImportDocument[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('COA');
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    try {
      setDocs(await fetchListingDocuments(listingId));
      setError(null);
    } catch (err) {
      setError(parseImportError(err).message);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchListingDocuments(listingId)
      .then((list) => !cancelled && setDocs(list))
      .catch((err: unknown) => !cancelled && setError(parseImportError(err).message));
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  async function upload() {
    let asset: DocumentPicker.DocumentPickerAsset | undefined;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets?.[0]) return;
      asset = result.assets[0];
    } catch {
      Toast.show({ type: 'error', text1: 'Unable to open the document picker.' });
      return;
    }
    const size = asset.size ?? 0;
    if (size > MAX_BYTES) {
      Toast.show({ type: 'error', text1: 'File must be 10 MB or smaller.' });
      return;
    }
    setBusy('upload');
    try {
      await uploadListingDocument(listingId, category, {
        uri: asset.uri,
        name: asset.name,
        size,
        mimeType: asset.mimeType ?? 'application/octet-stream',
      });
      Toast.show({ type: 'success', text1: `${asset.name} uploaded` });
      await load();
    } catch (err) {
      Toast.show({ type: 'error', text1: parseImportError(err).message });
    } finally {
      setBusy(null);
    }
  }

  async function open(doc: ImportDocument) {
    setBusy(doc.id);
    try {
      const { url } = await downloadListingDocument(listingId, doc.id);
      await Linking.openURL(url);
    } catch (err) {
      Toast.show({ type: 'error', text1: parseImportError(err).message });
    } finally {
      setBusy(null);
    }
  }

  function remove(doc: ImportDocument) {
    showConfirmDialog({
      title: 'Remove attachment?',
      message: `${doc.fileName} will be removed from this listing.`,
      confirmLabel: 'Remove',
      onConfirm: () => {
        setBusy(doc.id);
        deleteListingDocument(listingId, doc.id)
          .then(load)
          .catch((err: unknown) =>
            Toast.show({ type: 'error', text1: parseImportError(err).message }),
          )
          .finally(() => setBusy(null));
      },
    });
  }

  return (
    <Card title="Attachments">
      {error ? (
        <Typography variant="error">{error}</Typography>
      ) : !docs ? (
        <LoadingBlock />
      ) : docs.length === 0 ? (
        <EmptyBlock
          title="No attachments"
          message={canManage ? 'Add a COA, TDS or certificate.' : undefined}
        />
      ) : (
        <View className="gap-sm">
          {docs.map((d) => (
            <View
              key={d.id}
              className="flex-row items-center justify-between gap-sm rounded-xl border border-brand-border px-md py-sm"
            >
              <View className="flex-1">
                <Typography
                  variant="roleDescription"
                  className="font-medium text-brand-heading"
                  numberOfLines={1}
                >
                  {d.fileName}
                </Typography>
                <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
                  {importLabel(d.category)} · {formatDate(d.createdAt)} {sizeLabel(d.fileSizeBytes)}
                </Typography>
              </View>
              <Pressable onPress={() => void open(d)} disabled={busy === d.id} hitSlop={6}>
                <Typography variant="link">Open</Typography>
              </Pressable>
              {canManage ? (
                <Pressable onPress={() => remove(d)} disabled={busy === d.id} hitSlop={6}>
                  <Typography variant="link" className="text-brand-error">
                    Remove
                  </Typography>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      )}
      {canManage ? (
        <View className="mt-md gap-sm">
          <SelectField
            label="Attachment type"
            value={category}
            required
            options={DOCUMENT_CATEGORIES.map((c) => ({ value: c, label: importLabel(c) }))}
            onChange={(v) => v && setCategory(v)}
          />
          <SecondaryButton
            variant="outline"
            label={busy === 'upload' ? 'Uploading…' : 'Upload PDF or image'}
            disabled={busy === 'upload'}
            onPress={() => void upload()}
          />
        </View>
      ) : null}
    </Card>
  );
}
