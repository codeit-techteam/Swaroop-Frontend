import { useCallback, useEffect, useMemo, useState } from 'react';

import { ActivityIndicator, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { Controller } from 'react-hook-form';
import { z } from 'zod';

import { CountryPicker, DropdownField, ScreenWrapper, Typography } from '@/components';
import { useZodForm } from '@/lib/forms';
import { ROUTES } from '@/navigation/routes';
import {
  SellerCard,
  SellerGstValidateCard,
  SellerHeader,
  type SellerIdentityStatus,
  sellerIdentityStatus,
  SellerPanVerifyField,
  SellerPrimaryButton,
  SellerStepper,
  SellerTextField,
} from '@/seller/components';
import {
  SELLER_ENTITY_TYPE_OPTIONS,
  SELLER_NATURE_OF_BUSINESS_OPTIONS,
  SELLER_STATES,
  SELLER_STATE_OPTIONS,
} from '@/seller/constants';
import {
  isKnownExistingDemoSeller,
  resolveSellerHomeAccess,
} from '@/seller/navigation/resolveSellerHome';
import { useSellerStore } from '@/seller/store/sellerStore';
import { extractPanFromGstin, parseGstin } from '@/seller/utils/gst';
import type { KycVerificationDetails, KycVerifyResult } from '@/services/customer-kyc';
import {
  fetchSellerOnboardingIdentity,
  fetchSellerOnboardingStatus,
  type SellerOnboardingIdentity,
  type SellerOnboardingStatus,
  saveSellerOnboardingDraft,
  sellerOnboardingErrorMessage,
} from '@/services/seller-onboarding';
import { brandColors } from '@/theme/colors';
import {
  emailSchema,
  gstSchema,
  panSchema,
  phoneSchema,
  pincodeSchema,
  requiredString,
} from '@/utils/validators';

const sellerCompanySchema = z.object({
  companyName: requiredString('Company name'),
  gst: gstSchema,
  pan: panSchema,
  entityType: requiredString('Entity type'),
  businessEmail: emailSchema,
  mobile: phoneSchema,
  address: requiredString('Address'),
  state: requiredString('State'),
  city: requiredString('City'),
  pincode: pincodeSchema,
  natureOfBusiness: requiredString('Nature of business'),
  accountHolderName: requiredString('Account holder name'),
  bankName: requiredString('Bank name'),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{9,18}$/, 'Enter a valid 9–18 digit account number'),
  ifscCode: z
    .string()
    .trim()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid 11-character IFSC code'),
});

type SellerCompanyForm = z.infer<typeof sellerCompanySchema>;

type IdentityState = {
  value: string;
  status: SellerIdentityStatus;
  details: KycVerificationDetails | null;
  message: string | null;
};

const EMPTY_IDENTITY: IdentityState = { value: '', status: 'idle', details: null, message: null };

const isAccepted = (status: SellerIdentityStatus) =>
  status === 'verified' || status === 'manual_review';

function savedIdentityStatus(value: string | null | undefined): SellerIdentityStatus | null {
  if (value === 'verified') return 'verified';
  if (value === 'manual_review') return 'manual_review';
  return null;
}

/** Reconciles local identity state with what the backend has accepted. */
function reconcileIdentity(
  prev: IdentityState,
  savedValue: string | null | undefined,
  savedStatus: string | null | undefined,
  verification: { details: KycVerificationDetails; message: string } | null | undefined,
): IdentityState {
  const status = savedIdentityStatus(savedStatus);
  if (savedValue && status) {
    return {
      value: savedValue,
      status,
      details: verification?.details ?? null,
      message: verification?.message ?? null,
    };
  }
  return isAccepted(prev.status) ? { ...EMPTY_IDENTITY, value: prev.value } : prev;
}

export const SellerCompanyScreen = () => {
  const router = useRouter();
  const company = useSellerStore((state) => state.company);
  const saveCompany = useSellerStore((state) => state.saveCompany);
  const {
    control,
    watch,
    clearErrors,
    setValue,
    handleSubmit,
    formState: { errors, isValid },
  } = useZodForm(sellerCompanySchema, {
    defaultValues: company,
    mode: 'onChange',
  });
  const [gstIdentity, setGstIdentity] = useState<IdentityState>(EMPTY_IDENTITY);
  const [panIdentity, setPanIdentity] = useState<IdentityState>(EMPTY_IDENTITY);
  const [identityLocked, setIdentityLocked] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [checkingAccount, setCheckingAccount] = useState(true);

  const applyIdentity = useCallback(
    (status: SellerOnboardingStatus | null, saved: SellerOnboardingIdentity | null) => {
      setIdentityLocked(Boolean(status?.locked));
      setMismatch(Boolean(status?.verifications?.mismatch));
      setGstIdentity((prev) =>
        reconcileIdentity(prev, saved?.gstin, saved?.gstStatus, status?.verifications?.gst),
      );
      setPanIdentity((prev) =>
        reconcileIdentity(prev, saved?.pan, saved?.panStatus, status?.verifications?.pan),
      );
      if (saved?.gstin && savedIdentityStatus(saved.gstStatus)) {
        setValue('gst', saved.gstin, { shouldValidate: true });
      }
      if (saved?.pan && savedIdentityStatus(saved.panStatus)) {
        setValue('pan', saved.pan, { shouldValidate: true });
      }
    },
    [setValue],
  );

  const refreshIdentity = useCallback(async () => {
    try {
      const [status, saved] = await Promise.all([
        fetchSellerOnboardingStatus(),
        fetchSellerOnboardingIdentity(),
      ]);
      applyIdentity(status, saved);
    } catch {
      // Keep the current state; the backend re-checks verification on submit.
    }
  }, [applyIdentity]);

  useEffect(() => {
    let active = true;

    void (async () => {
      const access = await resolveSellerHomeAccess();
      if (!active) return;

      const snapshot = useSellerStore.getState();
      const openHome =
        access === 'home' ||
        (access === 'unknown' &&
          snapshot.otpVerified &&
          isKnownExistingDemoSeller(snapshot.mobile));

      if (openHome) {
        if (access !== 'home') {
          snapshot.grantExistingSellerAccess();
        }
        router.replace(ROUTES.SELLER.DASHBOARD as Href);
        return;
      }

      await refreshIdentity();
      if (!active) return;
      setCheckingAccount(false);
    })();

    return () => {
      active = false;
    };
  }, [refreshIdentity, router]);

  const stateValue = watch('state');
  const gstValue = watch('gst');
  const panValue = watch('pan');
  const gstStatus: SellerIdentityStatus =
    gstIdentity.value === gstValue ? gstIdentity.status : 'idle';
  const panStatus: SellerIdentityStatus =
    panIdentity.value === panValue ? panIdentity.status : 'idle';
  const identityAccepted = isAccepted(gstStatus) && isAccepted(panStatus) && !mismatch;
  const cityOptions = useMemo(
    () => (stateValue ? [...(SELLER_STATES[stateValue as keyof typeof SELLER_STATES] ?? [])] : []),
    [stateValue],
  );

  const handleGstResult = (result: KycVerifyResult, gstin: string) => {
    const status = sellerIdentityStatus(result.status);
    setGstIdentity({ value: gstin, status, details: result.details, message: result.message });
    setValue('gst', gstin, { shouldValidate: true });
    if (typeof result.mismatch === 'boolean') setMismatch(result.mismatch);
    if (isAccepted(status)) {
      const state = result.details.state;
      if (state && state in SELLER_STATES) {
        setValue('state', state, { shouldValidate: true });
        setValue('city', '');
      }
      if (!panValue) setValue('pan', extractPanFromGstin(gstin), { shouldValidate: true });
      clearErrors(['gst']);
    }
    void refreshIdentity();
  };

  const handlePanResult = (result: KycVerifyResult, pan: string) => {
    const status = sellerIdentityStatus(result.status);
    setPanIdentity({ value: pan, status, details: result.details, message: result.message });
    setValue('pan', pan, { shouldValidate: true });
    if (typeof result.mismatch === 'boolean') setMismatch(result.mismatch);
    if (isAccepted(status)) clearErrors(['pan']);
    void refreshIdentity();
  };

  const handleContinue = async (values: SellerCompanyForm) => {
    if (!identityAccepted) {
      return;
    }
    const decoded = parseGstin(values.gst);
    const nextCompany = {
      ...values,
      gstVerified: true,
      panVerified: true,
      gstStateCode: gstIdentity.details?.stateCode ?? decoded.stateCode,
      gstState: gstIdentity.details?.state ?? decoded.state,
    };
    saveCompany(nextCompany);
    setSaving(true);
    setSaveError(null);
    try {
      await saveSellerOnboardingDraft(nextCompany, 'documents');
      router.push(ROUTES.SELLER.VERIFICATION as Href);
    } catch (error) {
      setSaveError(sellerOnboardingErrorMessage(error, 'Could not save business details.'));
    } finally {
      setSaving(false);
    }
  };

  if (checkingAccount) {
    return (
      <ScreenWrapper className="bg-brand-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={brandColors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable className="bg-brand-background">
      <SellerHeader
        showBack
        title="Seller Onboarding"
        rightActionLabel="Save & Exit"
        onBack={() => router.back()}
        onRightActionPress={() => router.replace(ROUTES.AUTH.ROLE_SELECTION as Href)}
      />

      <SellerStepper currentStep="company" className="mt-md" />

      <Controller
        control={control}
        name="gst"
        render={({ field: { value, onChange, onBlur } }) => (
          <SellerGstValidateCard
            className="mt-lg"
            value={value}
            status={gstStatus}
            details={gstIdentity.details}
            message={gstIdentity.message}
            locked={identityLocked}
            error={errors.gst?.message}
            onChange={onChange}
            onResult={handleGstResult}
            onEdit={() => setGstIdentity((prev) => ({ ...EMPTY_IDENTITY, value: prev.value }))}
            onBlur={onBlur}
          />
        )}
      />

      <SellerCard title="Business Details" className="mt-lg">
        <View className="gap-lg">
          <Controller
            control={control}
            name="companyName"
            render={({ field: { value, onChange, onBlur } }) => (
              <SellerTextField
                label="Company Name"
                placeholder="PetroLink Logistics Pvt Ltd"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.companyName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="pan"
            render={({ field: { value, onChange, onBlur } }) => (
              <SellerPanVerifyField
                value={value}
                status={panStatus}
                details={panIdentity.details}
                message={panIdentity.message}
                locked={identityLocked}
                error={errors.pan?.message}
                onChange={onChange}
                onResult={handlePanResult}
                onEdit={() => setPanIdentity((prev) => ({ ...EMPTY_IDENTITY, value: prev.value }))}
                onBlur={onBlur}
              />
            )}
          />

          <Controller
            control={control}
            name="entityType"
            render={({ field: { value, onChange } }) => (
              <DropdownField
                label="Entity Type"
                value={value}
                options={SELLER_ENTITY_TYPE_OPTIONS}
                placeholder="Select entity type"
                onChange={(selected) => {
                  onChange(selected);
                  clearErrors('entityType');
                }}
                error={errors.entityType?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="businessEmail"
            render={({ field: { value, onChange, onBlur } }) => (
              <SellerTextField
                label="Business Email"
                placeholder="ops@petrotrade.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.businessEmail?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="mobile"
            render={({ field: { value, onChange, onBlur } }) => (
              <SellerTextField
                label="Mobile"
                placeholder="82408 90242"
                keyboardType="phone-pad"
                maxLength={10}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.mobile?.message}
                leftSlot={<CountryPicker />}
              />
            )}
          />

          <Controller
            control={control}
            name="address"
            render={({ field: { value, onChange, onBlur } }) => (
              <SellerTextField
                label="Address"
                placeholder="Registered office address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.address?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="state"
            render={({ field: { value, onChange } }) => (
              <DropdownField
                label="State"
                value={value}
                options={SELLER_STATE_OPTIONS}
                placeholder="Select state"
                onChange={(selected) => {
                  onChange(selected);
                  setValue('city', '');
                  clearErrors(['state', 'city']);
                }}
                error={errors.state?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="city"
            render={({ field: { value, onChange } }) => (
              <DropdownField
                label="City"
                value={value}
                options={cityOptions}
                placeholder={stateValue ? 'Select city' : 'Select state first'}
                disabled={!stateValue}
                onChange={(selected) => {
                  onChange(selected);
                  clearErrors('city');
                }}
                error={errors.city?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="pincode"
            render={({ field: { value, onChange, onBlur } }) => (
              <SellerTextField
                label="Pincode"
                placeholder="700001"
                keyboardType="number-pad"
                maxLength={6}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.pincode?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="natureOfBusiness"
            render={({ field: { value, onChange } }) => (
              <DropdownField
                label="Nature of Business"
                value={value}
                options={SELLER_NATURE_OF_BUSINESS_OPTIONS}
                placeholder="Select business type"
                onChange={(selected) => {
                  onChange(selected);
                  clearErrors('natureOfBusiness');
                }}
                error={errors.natureOfBusiness?.message}
              />
            )}
          />
        </View>
      </SellerCard>

      <SellerCard title="Bank Details" className="mt-lg">
        <View className="gap-lg">
          <Controller
            control={control}
            name="accountHolderName"
            render={({ field: { value, onChange, onBlur } }) => (
              <SellerTextField
                label="Account Holder Name"
                placeholder="As printed on the cheque"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.accountHolderName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="bankName"
            render={({ field: { value, onChange, onBlur } }) => (
              <SellerTextField
                label="Bank Name"
                placeholder="HDFC Bank"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.bankName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="accountNumber"
            render={({ field: { value, onChange, onBlur } }) => (
              <SellerTextField
                label="Account Number"
                placeholder="Bank account number"
                keyboardType="number-pad"
                maxLength={18}
                value={value}
                onChangeText={(text) => onChange(text.replace(/\D/g, ''))}
                onBlur={onBlur}
                error={errors.accountNumber?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="ifscCode"
            render={({ field: { value, onChange, onBlur } }) => (
              <SellerTextField
                label="IFSC Code"
                placeholder="HDFC0001234"
                autoCapitalize="characters"
                maxLength={11}
                value={value}
                onChangeText={(text) => onChange(text.toUpperCase())}
                onBlur={onBlur}
                error={errors.ifscCode?.message}
              />
            )}
          />
        </View>
      </SellerCard>

      {mismatch ? (
        <Typography variant="error" className="mt-md text-left">
          GST/PAN mismatch: the PAN associated with the GSTIN does not match the entered PAN.
        </Typography>
      ) : null}

      {saveError ? (
        <Typography variant="error" className="mt-md text-left">
          {saveError}
        </Typography>
      ) : null}

      <View className="mt-lg">
        <SellerPrimaryButton
          label="Save & Continue"
          showArrow
          loading={saving}
          disabled={!isValid || !identityAccepted}
          onPress={handleSubmit(handleContinue)}
        />
      </View>
    </ScreenWrapper>
  );
};
