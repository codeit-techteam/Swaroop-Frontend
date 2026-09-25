import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppHeader,
  DocumentUploadCard,
  PrimaryButton,
  ProgressStepper,
  ScreenWrapper,
  SecondaryButton,
  Typography,
  VerificationBanner,
} from '@/components';
import { getApiErrorMessage } from '@/api/client';
import { useCreditDocuments } from '@/hooks/use-credit-documents';
import { LockIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  fetchCreditEligibility,
  fetchCreditApplication,
  fetchLatestCreditApplication,
  saveCreditApplicationDraft,
  submitCreditApplication,
} from '@/services/customer-credit';
import type { CreditApplication } from '@/types/customer-credit';
import { isTerminalCreditStatus } from '@/types/customer-credit';
import type { StepperStep, StepperStepStatus } from '@/types/document';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/currency';

type WizardStep = 'details' | 'documents' | 'review';

const STEP_ORDER: WizardStep[] = ['details', 'documents', 'review'];

const STEP_LABELS: Record<WizardStep, string> = {
  details: 'Facility',
  documents: 'Documents',
  review: 'Review',
};

const DEFAULT_TENURE_OPTIONS = [15, 30];

const getCreditStepperSteps = (current: WizardStep): StepperStep[] => {
  const currentIndex = STEP_ORDER.indexOf(current);
  return STEP_ORDER.map((id, index) => {
    let status: StepperStepStatus = 'upcoming';
    if (index < currentIndex) status = 'completed';
    else if (index === currentIndex) status = 'current';
    return { id, label: STEP_LABELS[id], status };
  });
};

const toAmount = (value: number): string =>
  formatCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const CustomerCreditRequestScreen = memo(function CustomerCreditRequestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<WizardStep>('details');
  const [application, setApplication] = useState<CreditApplication | null>(null);
  const [tenureOptions, setTenureOptions] = useState<number[]>(DEFAULT_TENURE_OPTIONS);

  const [requestedLimit, setRequestedLimit] = useState('');
  const [tenureDays, setTenureDays] = useState<number>(DEFAULT_TENURE_OPTIONS[1]);
  const [purpose, setPurpose] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshApplication = useCallback(async () => {
    if (!application) return;
    const next = await fetchCreditApplication(application.id);
    setApplication(next);
  }, [application]);

  const { documents, pickDocument, isUploading, requiredReady, missingRequired } =
    useCreditDocuments({ application, onUploaded: refreshApplication });

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const [latest, eligibility] = await Promise.all([
          fetchLatestCreditApplication(),
          fetchCreditEligibility().catch(() => null),
        ]);
        if (cancelled) return;

        if (eligibility?.tenureOptions?.length) {
          setTenureOptions(eligibility.tenureOptions);
          setTenureDays(eligibility.tenureOptions[eligibility.tenureOptions.length - 1]);
        }

        if (latest && !isTerminalCreditStatus(latest.status)) {
          if (latest.status !== 'DRAFT') {
            // An application is already with the credit team — show its status instead.
            router.replace({
              pathname: ROUTES.CUSTOMER.CREDIT_APPLICATION_STATUS,
              params: { id: latest.id },
            } as unknown as Href);
            return;
          }
          setApplication(latest);
          setRequestedLimit(
            Number(latest.requestedLimit) > 0 ? String(Number(latest.requestedLimit)) : '',
          );
          if (latest.requestedTenureDays) setTenureDays(latest.requestedTenureDays);
          setPurpose(latest.purpose ?? '');
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const parsedLimit = useMemo(() => {
    const parsed = Number(requestedLimit.replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }, [requestedLimit]);

  const handleSaveDetails = useCallback(async () => {
    if (parsedLimit <= 0) {
      setError('Enter the credit limit you need.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const saved = await saveCreditApplicationDraft({
        requestedLimit: parsedLimit,
        requestedTenureDays: tenureDays,
        purpose,
      });
      setApplication(saved);
      setStep('documents');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }, [parsedLimit, purpose, tenureDays]);

  const handleSubmit = useCallback(async () => {
    if (!application) return;
    setIsSaving(true);
    setError(null);
    try {
      const submitted = await submitCreditApplication(application.id);
      router.replace({
        pathname: ROUTES.CUSTOMER.CREDIT_APPLICATION_STATUS,
        params: { id: submitted.id },
      } as unknown as Href);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }, [application, router]);

  const handleBack = useCallback(() => {
    const index = STEP_ORDER.indexOf(step);
    if (index > 0) {
      setStep(STEP_ORDER[index - 1]);
      return;
    }
    router.back();
  }, [router, step]);

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <AppHeader variant="back" title="Request Credit" onBack={handleBack} />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <ProgressStepper steps={getCreditStepperSteps(step)} className="mt-lg" />

        {isLoading ? (
          <Typography variant="subheadingLeft" className="mt-xl text-brand-body">
            Loading your credit application…
          </Typography>
        ) : null}

        {!isLoading && step === 'details' ? (
          <View className="mt-xl">
            <Typography variant="headingLeft" className="text-[18px] text-brand-primary">
              Facility Details
            </Typography>
            <Typography variant="subheadingLeft" className="mt-xs">
              Tell us the limit and payment terms you need for your trading volume.
            </Typography>

            <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
              <Typography variant="fieldLabel" className="mb-sm">
                Requested Credit Limit
              </Typography>
              <View className="min-h-[48px] flex-row items-center rounded-md border border-brand-border bg-brand-white px-md">
                <Typography variant="roleTitle" className="mr-sm text-brand-muted">
                  ₹
                </Typography>
                <TextInput
                  value={requestedLimit}
                  onChangeText={(value) => setRequestedLimit(value.replace(/[^0-9.]/g, ''))}
                  keyboardType="numeric"
                  placeholder="2500000"
                  placeholderTextColor={brandColors.footer}
                  className="flex-1 py-md font-sans text-[15px] text-brand-heading"
                />
              </View>
              {parsedLimit > 0 ? (
                <Typography variant="legal" className="mt-xs text-left text-brand-muted">
                  {toAmount(parsedLimit)}
                </Typography>
              ) : null}

              <Typography variant="fieldLabel" className="mb-sm mt-lg">
                Payment Terms
              </Typography>
              <View className="flex-row flex-wrap gap-sm">
                {tenureOptions.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setTenureDays(option)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: tenureDays === option }}
                    className={cn(
                      'rounded-full px-lg py-sm',
                      tenureDays === option
                        ? 'bg-brand-primary'
                        : 'border border-brand-border bg-brand-white',
                    )}
                  >
                    <Typography
                      variant="badge"
                      className={tenureDays === option ? 'text-brand-white' : 'text-brand-body'}
                    >
                      Net-{option}
                    </Typography>
                  </Pressable>
                ))}
              </View>

              <Typography variant="fieldLabel" className="mb-sm mt-lg">
                Purpose
              </Typography>
              <TextInput
                value={purpose}
                onChangeText={setPurpose}
                placeholder="How will this credit line be used?"
                placeholderTextColor={brandColors.footer}
                multiline
                textAlignVertical="top"
                className="min-h-[96px] rounded-md border border-brand-border bg-brand-white px-md py-md font-sans text-[15px] text-brand-heading"
              />
            </View>

            <PrimaryButton
              className="mt-xl"
              label="Save & Continue"
              loading={isSaving}
              disabled={parsedLimit <= 0 || isSaving}
              onPress={() => void handleSaveDetails()}
            />
          </View>
        ) : null}

        {!isLoading && step === 'documents' ? (
          <View className="mt-xl">
            <Typography variant="headingLeft" className="text-[18px] text-brand-primary">
              Required Documents
            </Typography>
            <Typography variant="subheadingLeft" className="mt-xs">
              GST registration, bank statement and ITR / financials are mandatory. Others help
              speed up the review.
            </Typography>

            <View className="mt-lg gap-md">
              {documents.map((document) => (
                <DocumentUploadCard
                  key={document.id}
                  document={document}
                  onUpload={(id) => void pickDocument(id)}
                />
              ))}
            </View>

            {missingRequired.length > 0 ? (
              <Typography variant="legal" className="mt-lg text-left text-brand-muted">
                Still needed: {missingRequired.map((item) => item.label).join(', ')}
              </Typography>
            ) : null}

            <VerificationBanner className="mt-xl" />

            <PrimaryButton
              className="mt-xl"
              label="Continue to Review"
              disabled={!requiredReady || isUploading}
              onPress={() => setStep('review')}
            />
          </View>
        ) : null}

        {!isLoading && step === 'review' && application ? (
          <View className="mt-xl">
            <Typography variant="headingLeft" className="text-[18px] text-brand-primary">
              Review & Submit
            </Typography>
            <Typography variant="subheadingLeft" className="mt-xs">
              Confirm the details below. PetroTrade Credit Management reviews every application
              before a limit is issued.
            </Typography>

            <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
              <Typography variant="fieldLabel" className="text-brand-muted">
                Application
              </Typography>
              <Typography variant="roleTitle" className="mt-xs">
                {application.applicationNumber}
              </Typography>

              <View className="mt-lg gap-md border-t border-brand-border pt-lg">
                <View className="flex-row justify-between gap-md">
                  <Typography variant="subheadingLeft" className="text-brand-muted">
                    Requested Limit
                  </Typography>
                  <Typography variant="roleTitle" className="text-[14px]">
                    {toAmount(Number(application.requestedLimit))}
                  </Typography>
                </View>
                <View className="flex-row justify-between gap-md">
                  <Typography variant="subheadingLeft" className="text-brand-muted">
                    Payment Terms
                  </Typography>
                  <Typography variant="roleTitle" className="text-[14px]">
                    {application.requestedTenureDays
                      ? `Net-${application.requestedTenureDays}`
                      : '—'}
                  </Typography>
                </View>
                <View className="flex-row justify-between gap-md">
                  <Typography variant="subheadingLeft" className="text-brand-muted">
                    Documents
                  </Typography>
                  <Typography variant="roleTitle" className="text-[14px]">
                    {application.documents.length} attached
                  </Typography>
                </View>
              </View>

              {application.purpose ? (
                <View className="mt-lg border-t border-brand-border pt-lg">
                  <Typography variant="fieldLabel" className="text-brand-muted">
                    Purpose
                  </Typography>
                  <Typography variant="subheadingLeft" className="mt-xs text-brand-body">
                    {application.purpose}
                  </Typography>
                </View>
              ) : null}
            </View>

            <SecondaryButton
              className="mt-lg"
              variant="outline"
              label="Edit Documents"
              onPress={() => setStep('documents')}
            />

            <PrimaryButton
              className="mt-md"
              label="Submit Application"
              loading={isSaving}
              disabled={!application.canSubmit || isSaving}
              leftIcon={<LockIcon color={brandColors.white} size={16} />}
              onPress={() => void handleSubmit()}
            />

            {!application.canSubmit ? (
              <Typography variant="legal" className="mt-md text-brand-muted">
                Upload all mandatory documents before submitting.
              </Typography>
            ) : null}
          </View>
        ) : null}

        {error ? (
          <View className="mt-lg rounded-2xl border border-brand-error bg-brand-white px-lg py-md">
            <Typography variant="error">{error}</Typography>
          </View>
        ) : null}
      </ScrollView>
    </ScreenWrapper>
  );
});
