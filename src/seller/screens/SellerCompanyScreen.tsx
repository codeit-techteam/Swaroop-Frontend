import { useEffect, useMemo, useState } from 'react';

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
import { useSellerStore } from '@/seller/store/sellerStore';
import {
  isKnownExistingDemoSeller,
  resolveSellerHomeAccess,
} from '@/seller/navigation/resolveSellerHome';
import { brandColors } from '@/theme/colors';
import { type GstParseResult, parseGstin } from '@/seller/utils/gst';
import {
  saveSellerOnboardingDraft,
  sellerOnboardingErrorMessage,
} from '@/services/seller-onboarding';
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
  const [gstResult, setGstResult] = useState<GstParseResult | null>(() =>
    company.gstVerified ? parseGstin(company.gst) : null,
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [checkingAccount, setCheckingAccount] = useState(true);

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

      setCheckingAccount(false);
    })();

    return () => {
      active = false;
    };
  }, [router]);

  const stateValue = watch('state');
  const gstValue = watch('gst');
  const gstVerified = Boolean(gstResult?.isValid && gstResult.gstNumber === gstValue);
  const cityOptions = useMemo(
    () => (stateValue ? [...(SELLER_STATES[stateValue as keyof typeof SELLER_STATES] ?? [])] : []),
    [stateValue],
  );

  const handleGstVerified = (result: GstParseResult) => {
    setGstResult(result);
    setValue('gst', result.gstNumber, { shouldValidate: true });
    setValue('pan', result.pan, { shouldValidate: true });
    if (result.state in SELLER_STATES) {
      setValue('state', result.state, { shouldValidate: true });
      setValue('city', '');
    }
    clearErrors(['gst', 'pan']);
  };

  const handleContinue = async (values: SellerCompanyForm) => {
    if (!gstVerified || !gstResult?.isValid) {
      return;
    }
    const nextCompany = {
      ...values,
      gstVerified: true,
      gstStateCode: gstResult.stateCode,
      gstState: gstResult.state,
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
            verified={gstVerified}
            result={gstVerified ? gstResult : null}
            error={errors.gst?.message}
            onChange={(text) => {
              onChange(text);
              if (gstResult && gstResult.gstNumber !== text) {
                setGstResult(null);
              }
            }}
            onVerified={handleGstVerified}
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
              <SellerTextField
                label="Permanent Account Number (PAN)"
                placeholder="Validate GST to auto-fill PAN"
                autoCapitalize="characters"
                value={value}
                onChangeText={(text) => onChange(text.toUpperCase())}
                onBlur={onBlur}
                error={errors.pan?.message}
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
          disabled={!isValid || !gstVerified}
          onPress={handleSubmit(handleContinue)}
        />
      </View>
    </ScreenWrapper>
  );
};
