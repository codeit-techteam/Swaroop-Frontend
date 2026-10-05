import { useCallback, useEffect, useState } from 'react';

import { View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { z } from 'zod';

import {
  AppHeader,
  BusinessInfoForm,
  PrimaryButton,
  ProgressStepper,
  ScreenWrapper,
  Typography,
} from '@/components';
import { KycVerificationSummary } from '@/components/kyc/kyc-verification-summary';
import { getKycStepperSteps } from '@/constants/documents';
import { useCustomerKycStatus } from '@/hooks/use-customer-kyc-status';
import { TrustIllustration } from '@/icons';
import { useZodForm } from '@/lib/forms';
import { ROUTES } from '@/navigation/routes';
import {
  customerKycErrorMessage,
  normalizeIdentifier,
  verificationAccepted,
  verifyCustomerGst,
  verifyCustomerPan,
  type CustomerKycOverview,
  type KycVerification,
} from '@/services/customer-kyc';
import { useKycStore } from '@/store/kyc-store';
import type { CompanyType } from '@/types/kyc';
import { wp } from '@/utils/responsive';
import {
  emailSchema,
  gstSchema,
  panSchema,
  phoneSchema,
  pincodeSchema,
  requiredString,
} from '@/utils/validators';

const businessInfoSchema = z.object({
  businessEntityName: requiredString('Business entity name'),
  companyType: requiredString('Company type'),
  gstNumber: gstSchema,
  panNumber: panSchema,
  businessEmail: emailSchema,
  mobileNumber: phoneSchema,
  businessAddress: requiredString('Business address'),
  state: requiredString('State'),
  city: requiredString('City'),
  pincode: pincodeSchema,
  natureOfBusiness: requiredString('Nature of business'),
  annualPurchaseVolume: z.string(),
  expectedMonthlyRequirement: z.string(),
});

type BusinessInfoFormValues = z.infer<typeof businessInfoSchema>;

type Verifications = { pan: KycVerification | null; gst: KycVerification | null };

const PAN_GST_MISMATCH =
  'GST/PAN mismatch: the PAN associated with the GSTIN does not match the entered PAN.';

/** An earlier backend result can be reused only if it was for the same identifier. */
function alreadyAccepted(
  overview: CustomerKycOverview | null,
  kind: 'pan' | 'gst',
  value: string,
): boolean {
  if (!overview) return false;
  const saved = kind === 'pan' ? overview.organization.pan : overview.organization.gstin;
  return saved === value && verificationAccepted(overview.verifications[kind]);
}

export const BusinessInformationScreen = () => {
  const router = useRouter();
  const businessInfo = useKycStore((state) => state.businessInfo);
  const setBusinessInfo = useKycStore((state) => state.setBusinessInfo);
  const { overview, refresh } = useCustomerKycStatus();
  const [verifying, setVerifying] = useState<'PAN' | 'GST' | null>(null);
  const [verifications, setVerifications] = useState<Verifications | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ gstNumber: boolean; panNumber: boolean }>({
    gstNumber: false,
    panNumber: false,
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { isValid, errors },
  } = useZodForm(businessInfoSchema, {
    defaultValues: businessInfo,
    mode: 'onChange',
  });

  const stateValue = watch('state');
  const panValue = normalizeIdentifier(watch('panNumber') ?? '');
  const gstValue = normalizeIdentifier(watch('gstNumber') ?? '');
  const locked = Boolean(overview?.locked || overview?.kycVerified);
  const lockedIdentifiers = {
    panNumber: locked || (!editing.panNumber && alreadyAccepted(overview, 'pan', panValue)),
    gstNumber: locked || (!editing.gstNumber && alreadyAccepted(overview, 'gst', gstValue)),
  };

  useEffect(() => {
    const subscription = watch((_values, info) => {
      if (info.name === 'state') {
        setValue('city', '', { shouldValidate: false, shouldDirty: true });
        clearErrors('city');
      }
      if (info.name === 'panNumber' || info.name === 'gstNumber') {
        setWarning(null);
        setVerifyError(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [clearErrors, setValue, watch]);

  // The backend record is shared with the web app; prefill what was verified there.
  useEffect(() => {
    if (!overview) return;
    const { pan, gstin } = overview.organization;
    if (pan && !getValues('panNumber')) setValue('panNumber', pan, { shouldValidate: true });
    if (gstin && !getValues('gstNumber')) setValue('gstNumber', gstin, { shouldValidate: true });
  }, [getValues, overview, setValue]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const onContinue = useCallback(
    async (values: BusinessInfoFormValues) => {
      const pan = normalizeIdentifier(values.panNumber);
      const gstin = normalizeIdentifier(values.gstNumber);
      const next = { ...values, panNumber: pan, gstNumber: gstin };
      setBusinessInfo({ ...next, companyType: values.companyType as CompanyType });

      if (locked) {
        router.push(ROUTES.AUTH.KYC_DOCUMENTS as Href);
        return;
      }

      setVerifyError(null);
      setWarning(null);
      const results: Verifications = {
        pan: overview?.verifications.pan ?? null,
        gst: overview?.verifications.gst ?? null,
      };
      let mismatch: string | null = null;
      let mismatchChecked = false;
      try {
        if (!alreadyAccepted(overview, 'pan', pan)) {
          setVerifying('PAN');
          const result = await verifyCustomerPan(pan);
          results.pan = result;
          mismatch = result.warning;
          mismatchChecked = typeof result.mismatch === 'boolean';
        }
        if (verificationAccepted(results.pan) && !alreadyAccepted(overview, 'gst', gstin)) {
          setVerifying('GST');
          const result = await verifyCustomerGst(gstin);
          results.gst = result;
          mismatch = result.warning ?? mismatch;
          mismatchChecked = mismatchChecked || typeof result.mismatch === 'boolean';
        }
      } catch (error) {
        setVerifyError(
          customerKycErrorMessage(
            error,
            'Verification service is unavailable. Please try again shortly.',
          ),
        );
        return;
      } finally {
        setVerifying(null);
        setVerifications(results);
        setEditing({ gstNumber: false, panNumber: false });
        void refresh();
      }

      if (!verificationAccepted(results.pan) || !verificationAccepted(results.gst)) return;
      if (!mismatch && !mismatchChecked && overview?.verifications.mismatch) {
        mismatch = PAN_GST_MISMATCH;
      }
      if (mismatch) {
        setWarning(mismatch);
        return;
      }
      router.push(ROUTES.AUTH.KYC_DOCUMENTS as Href);
    },
    [locked, overview, refresh, router, setBusinessInfo],
  );

  const shown = verifications ?? overview?.verifications ?? null;

  return (
    <ScreenWrapper scrollable className="bg-brand-white" contentClassName="pb-xl">
      <AppHeader variant="back" title="KYC Verification" onBack={handleBack} />

      <View className="items-center pt-md">
        <TrustIllustration width={wp(42)} height={wp(38)} />
        <Typography variant="heading" className="mt-md">
          Business Information
        </Typography>
        <Typography variant="subheading" className="mt-sm px-sm">
          {locked
            ? 'Your KYC is under review or verified, so PAN and GST details are locked.'
            : 'We verify your PAN and GSTIN securely before you upload documents.'}
        </Typography>
      </View>

      <ProgressStepper steps={getKycStepperSteps('basic-info')} className="mt-2xl" />

      <View className="mt-2xl">
        <BusinessInfoForm
          control={control}
          errors={errors}
          stateValue={stateValue}
          clearErrors={clearErrors}
          lockedIdentifiers={lockedIdentifiers}
          onEditIdentifier={
            locked ? undefined : (field) => setEditing((prev) => ({ ...prev, [field]: true }))
          }
        />
      </View>

      {shown && (shown.pan || shown.gst) ? (
        <KycVerificationSummary
          pan={shown.pan}
          gst={shown.gst}
          warning={
            warning ??
            (verifications === null && overview?.verifications.mismatch ? PAN_GST_MISMATCH : null)
          }
          className="mt-xl"
        />
      ) : null}
      {verifyError ? (
        <Typography variant="error" className="mt-md text-left">
          {verifyError}
        </Typography>
      ) : null}

      <PrimaryButton
        label={
          verifying === 'PAN'
            ? 'Verifying PAN…'
            : verifying === 'GST'
              ? 'Verifying GST…'
              : locked
                ? 'Continue'
                : 'Verify & Continue'
        }
        className="mt-2xl"
        disabled={!isValid || verifying !== null}
        onPress={handleSubmit(onContinue)}
      />
    </ScreenWrapper>
  );
};
