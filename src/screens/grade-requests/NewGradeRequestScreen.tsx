import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
  type ScrollViewInstance,
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppHeader,
  InputField,
  PrimaryButton,
  ScreenWrapper,
  SecondaryButton,
  Typography,
} from '@/components';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { gradeRequestKeys } from '@/hooks/use-grade-requests';
import {
  EMPTY_GRADE_REQUEST_FORM,
  decimalOnly,
  digitsOnly,
  todayIso,
  validateGradeRequestForm,
  type GradeRequestFormErrors,
  type GradeRequestFormValues,
} from '@/lib/grade-request-validation';
import { ROUTES } from '@/navigation/routes';
import {
  GradeRequestError,
  createGradeRequest,
  fetchGradeRequestPrefill,
  newIdempotencyKey,
  toGradeRequestError,
  uploadGradeRequestDocument,
  type PickedGradeRequestFile,
} from '@/services/grade-requests';
import {
  GRADE_REQUEST_DOCUMENT_TYPES,
  GRADE_REQUEST_UNITS,
  type GradeRequest,
  type GradeRequestDocumentType,
  type GradeRequestPrefill,
} from '@/types/grade-request';
import { cn } from '@/utils/cn';
import { dayjs } from '@/utils/date';

const firstParam = (value?: string | string[]): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const DEFAULT_LIMITS = {
  maxDocuments: 5,
  maxFileSizeBytes: 10 * 1024 * 1024,
  allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  storageConfigured: true,
};

export const NewGradeRequestScreen = memo(function NewGradeRequestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ search?: string | string[] }>();

  const [form, setForm] = useState<GradeRequestFormValues>(() => ({
    ...EMPTY_GRADE_REQUEST_FORM,
    gradeName: (firstParam(params.search) ?? '').slice(0, 120),
  }));
  const [errors, setErrors] = useState<GradeRequestFormErrors>({});
  const [fileError, setFileError] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<GradeRequestPrefill | null>(null);
  const [files, setFiles] = useState<PickedGradeRequestFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<GradeRequestError | null>(null);
  const [acknowledgeExisting, setAcknowledgeExisting] = useState(false);
  const [result, setResult] = useState<GradeRequest | null>(null);
  const [uploadFailures, setUploadFailures] = useState<PickedGradeRequestFile[]>([]);
  const [retrying, setRetrying] = useState(false);

  // One key per screen session: a network retry can never create a second request.
  const idempotencyKey = useRef(newIdempotencyKey());
  const scrollRef = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    let active = true;
    fetchGradeRequestPrefill()
      .then((data) => {
        if (!active) return;
        setPrefill(data);
        setForm((current) => ({
          ...current,
          contactName: current.contactName || data.contactName || '',
          contactPhone:
            current.contactPhone || digitsOnly((data.contactPhone ?? '').replace(/^\+?91/, ''), 10),
          contactEmail: current.contactEmail || data.contactEmail || '',
          deliveryLocation: current.deliveryLocation || data.defaultAddress?.formatted || '',
          deliveryPincode: current.deliveryPincode || data.defaultAddress?.postalCode || '',
        }));
      })
      .catch(() => {
        // Prefill is a convenience; the customer can type everything manually.
      });
    return () => {
      active = false;
    };
  }, []);

  const limits = prefill?.limits ?? DEFAULT_LIMITS;

  const set = useCallback(
    <K extends keyof GradeRequestFormValues>(key: K, value: GradeRequestFormValues[K]) => {
      setForm((f) => ({ ...f, [key]: value }));
      setErrors((e) => ({ ...e, [key]: undefined }));
      if (key === 'gradeName' || key === 'manufacturer') {
        setAcknowledgeExisting(false);
        setSubmitError((err) => (err?.code === 'GRADE_ALREADY_IN_CATALOGUE' ? null : err));
      }
    },
    [],
  );

  const pickFiles = useCallback(async () => {
    setFileError(null);
    if (files.length >= limits.maxDocuments) {
      setFileError(`You can attach up to ${limits.maxDocuments} files.`);
      return;
    }
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: limits.allowedMimeTypes,
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (picked.canceled || !picked.assets?.length) return;
      const next = [...files];
      let message: string | null = null;
      for (const asset of picked.assets) {
        if (next.length >= limits.maxDocuments) {
          message = `You can attach up to ${limits.maxDocuments} files.`;
          break;
        }
        const mimeType = asset.mimeType ?? 'application/octet-stream';
        if (!limits.allowedMimeTypes.includes(mimeType)) {
          message = `${asset.name}: only PDF, JPG, PNG or WebP files are allowed.`;
          continue;
        }
        if ((asset.size ?? 0) > limits.maxFileSizeBytes) {
          message = `${asset.name} is larger than ${Math.round(limits.maxFileSizeBytes / 1024 / 1024)} MB.`;
          continue;
        }
        next.push({
          uri: asset.uri,
          fileName: asset.name,
          mimeType,
          fileSizeBytes: asset.size ?? 0,
          documentType: 'TDS',
        });
      }
      setFiles(next);
      setFileError(message);
    } catch {
      setFileError('Unable to open the file picker.');
    }
  }, [files, limits]);

  const setFileType = (index: number, documentType: GradeRequestDocumentType) =>
    setFiles((cur) => cur.map((f, i) => (i === index ? { ...f, documentType } : f)));

  const uploadAll = async (requestId: string, pending: PickedGradeRequestFile[]) => {
    const failed: PickedGradeRequestFile[] = [];
    for (const file of pending) {
      try {
        await uploadGradeRequestDocument(requestId, file);
      } catch {
        failed.push(file);
      }
    }
    return failed;
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    const found = validateGradeRequestForm(form);
    setErrors(found);
    if (Object.keys(found).length) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createGradeRequest({
        gradeName: form.gradeName.trim(),
        materialCategory: form.materialCategory.trim(),
        manufacturer: form.manufacturer.trim() || undefined,
        gradeGroup: form.gradeGroup.trim() || undefined,
        application: form.application.trim() || undefined,
        technicalSpecs: form.technicalSpecs.trim() || undefined,
        remarks: form.remarks.trim() || undefined,
        quantity: Number(form.quantity),
        unit: form.unit,
        deliveryLocation: form.deliveryLocation.trim(),
        deliveryPincode: form.deliveryPincode || undefined,
        deliveryAddressId:
          prefill?.defaultAddress &&
          form.deliveryLocation.trim() === prefill.defaultAddress.formatted
            ? prefill.defaultAddress.id
            : undefined,
        requiredByDate: form.requiredByDate || undefined,
        preferredPackaging: form.preferredPackaging.trim() || undefined,
        contactName: form.contactName.trim(),
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail.trim() || undefined,
        idempotencyKey: idempotencyKey.current,
        acknowledgeExisting: acknowledgeExisting || undefined,
      });
      setResult(created);
      void queryClient.invalidateQueries({ queryKey: gradeRequestKeys.all });
      if (files.length) setUploadFailures(await uploadAll(created.id, files));
    } catch (error) {
      setSubmitError(toGradeRequestError(error, 'Unable to submit your request.'));
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } finally {
      setSubmitting(false);
    }
  }, [acknowledgeExisting, files, form, prefill, queryClient, submitting]);

  const retryUploads = useCallback(async () => {
    if (!result) return;
    setRetrying(true);
    setUploadFailures(await uploadAll(result.id, uploadFailures));
    void queryClient.invalidateQueries({ queryKey: gradeRequestKeys.detail(result.id) });
    setRetrying(false);
  }, [queryClient, result, uploadFailures]);

  const openGradeRequest = useCallback(
    (id: string) =>
      router.replace({
        pathname: ROUTES.CUSTOMER.GRADE_REQUEST_DETAILS,
        params: { id },
      } as unknown as Href),
    [router],
  );

  const requiredByDate = useMemo(
    () => (form.requiredByDate ? dayjs(form.requiredByDate).toDate() : null),
    [form.requiredByDate],
  );

  if (result) {
    return (
      <ScreenWrapper padded={false} className="bg-brand-background">
        <AppHeader
          variant="back"
          title="Request submitted"
          onBack={() => router.replace(ROUTES.CUSTOMER.GRADE_REQUESTS as Href)}
        />
        <ScrollView
          className="flex-1 px-lg"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-xl items-center rounded-2xl border border-brand-border bg-brand-white p-xl">
            <Typography variant="roleTitle" className="text-[18px] text-brand-success">
              Request submitted
            </Typography>
            <Typography variant="subheading" className="mt-sm">
              Your reference number
            </Typography>
            <Typography
              variant="headingLeft"
              selectable
              className="mt-xs text-[24px] tracking-[1px] text-brand-primary"
            >
              {result.referenceNumber}
            </Typography>
            <Typography variant="subheading" className="mt-md">
              {result.statusLabel}. {result.statusDescription}
            </Typography>
          </View>

          {uploadFailures.length ? (
            <View className="mt-lg rounded-xl border border-brand-error bg-brand-white p-lg">
              <Typography variant="roleTitle" className="text-[14px]">
                {uploadFailures.length} file{uploadFailures.length > 1 ? 's' : ''} could not be
                attached
              </Typography>
              <Typography variant="subheadingLeft" className="mt-xs">
                Your request is saved. You can retry now.
              </Typography>
              {uploadFailures.map((f) => (
                <Typography key={f.uri} variant="roleDescription" className="mt-xs">
                  • {f.fileName}
                </Typography>
              ))}
              <SecondaryButton
                label={retrying ? 'Retrying…' : 'Retry upload'}
                onPress={() => void retryUploads()}
                disabled={retrying}
                className="mt-md"
              />
            </View>
          ) : null}

          <View className="mt-lg rounded-xl border border-brand-border bg-brand-white p-lg">
            <Typography variant="roleTitle" className="text-[14px]">
              What happens next
            </Typography>
            {[
              'Our team reviews the technical details.',
              'We may ask you for more information — you will be notified.',
              'Once the grade is identified, you can raise a purchase request.',
            ].map((line, i) => (
              <Typography key={line} variant="roleDescription" className="mt-xs">
                {i + 1}. {line}
              </Typography>
            ))}
          </View>

          <PrimaryButton
            label="Track this request"
            onPress={() => openGradeRequest(result.id)}
            className="mt-xl"
          />
          <SecondaryButton
            label="Back to grades"
            onPress={() => router.replace(ROUTES.CUSTOMER.GRADES as Href)}
            className="mt-md"
          />
        </ScrollView>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <AppHeader variant="back" title="Request a new grade" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          <Typography variant="subheadingLeft" className="mt-md">
            Can&apos;t find the grade you need? Tell us about it and our team will source or add it.
          </Typography>

          <Pressable
            onPress={() => router.push(ROUTES.CUSTOMER.GRADES as Href)}
            accessibilityRole="button"
            className="mt-md rounded-lg border border-brand-border bg-brand-white px-md py-sm"
          >
            <Typography variant="link">Search existing grades first →</Typography>
          </Pressable>

          <SubmitProblem
            error={submitError}
            onOpenGrade={(id) =>
              router.push({
                pathname: ROUTES.CUSTOMER.GRADE_DETAILS,
                params: { id },
              } as unknown as Href)
            }
            onOpenExisting={openGradeRequest}
            onConfirmAnyway={() => {
              setAcknowledgeExisting(true);
              setSubmitError(null);
            }}
          />

          <Section title="Grade details">
            <InputField
              label="Grade name / number *"
              value={form.gradeName}
              onChangeText={(v) => set('gradeName', v)}
              error={errors.gradeName}
              maxLength={120}
              placeholder="e.g. F4811"
              autoCapitalize="characters"
            />
            <InputField
              containerClassName="mt-md"
              label="Material / category *"
              value={form.materialCategory}
              onChangeText={(v) => set('materialCategory', v)}
              error={errors.materialCategory}
              maxLength={120}
              placeholder="e.g. White Masterbatch"
            />
            <InputField
              containerClassName="mt-md"
              label="Manufacturer"
              value={form.manufacturer}
              onChangeText={(v) => set('manufacturer', v)}
              maxLength={120}
            />
            <InputField
              containerClassName="mt-md"
              label="Grade group"
              value={form.gradeGroup}
              onChangeText={(v) => set('gradeGroup', v)}
              maxLength={120}
            />
            <InputField
              containerClassName="mt-md"
              label="Application / intended use"
              value={form.application}
              onChangeText={(v) => set('application', v)}
              maxLength={200}
            />
            <InputField
              containerClassName="mt-md"
              label="Technical specifications"
              value={form.technicalSpecs}
              onChangeText={(v) => set('technicalSpecs', v)}
              maxLength={4000}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholder="MFI, density, additives, certifications…"
            />
          </Section>

          <Section title="Quantity and delivery">
            <InputField
              label="Required quantity *"
              value={form.quantity}
              onChangeText={(v) => set('quantity', decimalOnly(v))}
              error={errors.quantity}
              keyboardType="decimal-pad"
              placeholder="e.g. 25"
            />
            <View className="mt-md flex-row gap-sm">
              {GRADE_REQUEST_UNITS.map((unit) => (
                <Pressable
                  key={unit}
                  onPress={() => set('unit', unit)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: form.unit === unit }}
                  className={cn(
                    'rounded-full border px-lg py-sm',
                    form.unit === unit
                      ? 'border-brand-primary bg-brand-primary'
                      : 'border-brand-border bg-brand-white',
                  )}
                >
                  <Typography
                    variant="roleDescription"
                    className={form.unit === unit ? 'text-brand-white' : 'text-brand-heading'}
                  >
                    {unit}
                  </Typography>
                </Pressable>
              ))}
            </View>
            <InputField
              containerClassName="mt-md"
              label="Delivery location *"
              value={form.deliveryLocation}
              onChangeText={(v) => set('deliveryLocation', v)}
              error={errors.deliveryLocation}
              maxLength={255}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              placeholder="City, state — or a full delivery address"
            />
            <InputField
              containerClassName="mt-md"
              label="Pincode"
              value={form.deliveryPincode}
              onChangeText={(v) => set('deliveryPincode', digitsOnly(v, 6))}
              error={errors.deliveryPincode}
              keyboardType="number-pad"
              maxLength={6}
            />
            <View className="mt-md">
              {requiredByDate ? (
                <View>
                  <DatePickerField
                    label="Required by"
                    value={requiredByDate}
                    onChange={(d) => set('requiredByDate', dayjs(d).format('YYYY-MM-DD'))}
                    error={errors.requiredByDate}
                  />
                  <Pressable
                    onPress={() => set('requiredByDate', '')}
                    hitSlop={8}
                    className="mt-xs"
                  >
                    <Typography variant="link">Remove date</Typography>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => set('requiredByDate', todayIso())}
                  accessibilityRole="button"
                  className="rounded-lg border border-dashed border-brand-border px-md py-sm"
                >
                  <Typography variant="link">+ Add a required-by date</Typography>
                </Pressable>
              )}
            </View>
            <InputField
              containerClassName="mt-md"
              label="Packaging"
              value={form.preferredPackaging}
              onChangeText={(v) => set('preferredPackaging', v)}
              maxLength={120}
              placeholder="e.g. 25 kg bags"
            />
          </Section>

          <Section title="Contact">
            <InputField
              label="Contact person *"
              value={form.contactName}
              onChangeText={(v) => set('contactName', v)}
              error={errors.contactName}
              maxLength={120}
            />
            <InputField
              containerClassName="mt-md"
              label="Mobile number *"
              value={form.contactPhone}
              onChangeText={(v) => set('contactPhone', digitsOnly(v, 10))}
              error={errors.contactPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <InputField
              containerClassName="mt-md"
              label="Email"
              value={form.contactEmail}
              onChangeText={(v) => set('contactEmail', v)}
              error={errors.contactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={160}
            />
            {prefill?.companyName ? (
              <Typography variant="roleDescription" className="mt-sm text-brand-muted">
                Requesting on behalf of {prefill.companyName}.
              </Typography>
            ) : null}
          </Section>

          <Section title="Attachments (optional)">
            <Typography variant="roleDescription" className="text-brand-muted">
              TDS, specification, MSDS or COA — PDF, JPG, PNG or WebP, up to {limits.maxDocuments}{' '}
              files, {Math.round(limits.maxFileSizeBytes / 1024 / 1024)} MB each.
            </Typography>
            {!limits.storageConfigured ? (
              <Typography variant="error" className="mt-xs">
                File upload is temporarily unavailable. You can still submit and attach files later.
              </Typography>
            ) : null}
            <SecondaryButton label="Add files" onPress={() => void pickFiles()} className="mt-md" />
            {fileError ? (
              <Typography variant="error" className="mt-xs">
                {fileError}
              </Typography>
            ) : null}
            {files.map((file, index) => (
              <View
                key={`${file.uri}-${index}`}
                className="mt-sm rounded-lg border border-brand-border bg-brand-white p-sm"
              >
                <View className="flex-row items-center justify-between">
                  <Typography variant="roleDescription" numberOfLines={1} className="mr-sm flex-1">
                    {file.fileName}
                  </Typography>
                  <Pressable
                    onPress={() => setFiles((cur) => cur.filter((_, i) => i !== index))}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${file.fileName}`}
                  >
                    <Typography variant="link">Remove</Typography>
                  </Pressable>
                </View>
                <View className="mt-xs flex-row flex-wrap gap-xs">
                  {GRADE_REQUEST_DOCUMENT_TYPES.map((t) => (
                    <Pressable
                      key={t.value}
                      onPress={() => setFileType(index, t.value)}
                      className={cn(
                        'rounded-full border px-md py-xs',
                        file.documentType === t.value
                          ? 'border-brand-primary bg-brand-primary'
                          : 'border-brand-border',
                      )}
                    >
                      <Typography
                        variant="roleDescription"
                        className={cn(
                          'text-[11px]',
                          file.documentType === t.value ? 'text-brand-white' : 'text-brand-heading',
                        )}
                      >
                        {t.label}
                      </Typography>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </Section>

          <Section title="Additional remarks (optional)">
            <InputField
              label="Remarks"
              value={form.remarks}
              onChangeText={(v) => set('remarks', v)}
              maxLength={2000}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Section>

          <PrimaryButton
            label={acknowledgeExisting ? 'Submit anyway' : 'Submit request'}
            onPress={() => void handleSubmit()}
            loading={submitting}
            className="mt-xl"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
});

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
    <Typography variant="fieldLabel" className="mb-md text-brand-muted">
      {title}
    </Typography>
    {children}
  </View>
);

const SubmitProblem = ({
  error,
  onOpenGrade,
  onOpenExisting,
  onConfirmAnyway,
}: {
  error: GradeRequestError | null;
  onOpenGrade: (id: string) => void;
  onOpenExisting: (id: string) => void;
  onConfirmAnyway: () => void;
}) => {
  if (!error) return null;

  if (error.code === 'GRADE_ALREADY_IN_CATALOGUE' && error.matches?.length) {
    return (
      <View className="mt-md rounded-xl border border-brand-primary bg-brand-white p-lg">
        <Typography variant="roleTitle" className="text-[14px]">
          This grade may already be in the catalogue
        </Typography>
        <Typography variant="subheadingLeft" className="mt-xs">
          Open one of these, or confirm you still want a new request.
        </Typography>
        {error.matches.map((m) => (
          <Pressable key={m.id} onPress={() => onOpenGrade(m.id)} className="mt-sm" hitSlop={6}>
            <Typography variant="link">
              {m.name}
              {m.manufacturer ? ` · ${m.manufacturer}` : ''}
            </Typography>
          </Pressable>
        ))}
        <SecondaryButton
          label="None of these — request a new grade"
          onPress={onConfirmAnyway}
          className="mt-md"
        />
      </View>
    );
  }

  if (error.code === 'DUPLICATE_OPEN_REQUEST' && error.existing) {
    const existing = error.existing;
    return (
      <View className="mt-md rounded-xl border border-brand-border bg-brand-white p-lg">
        <Typography variant="roleTitle" className="text-[14px]">
          You already have an open request for this grade
        </Typography>
        <Typography variant="subheadingLeft" className="mt-xs">
          Reference {existing.referenceNumber}. We will update you there.
        </Typography>
        <SecondaryButton
          label={`View ${existing.referenceNumber}`}
          onPress={() => onOpenExisting(existing.id)}
          className="mt-md"
        />
      </View>
    );
  }

  return (
    <View
      accessibilityRole="alert"
      className="mt-md rounded-xl border border-brand-error bg-brand-white p-md"
    >
      <Typography variant="error">{error.message}</Typography>
    </View>
  );
};
