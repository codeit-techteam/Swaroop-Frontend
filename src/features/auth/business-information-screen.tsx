import { useCallback, useEffect } from 'react';

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
import { getKycStepperSteps } from '@/constants/documents';
import { TrustIllustration } from '@/icons';
import { useZodForm } from '@/lib/forms';
import { ROUTES } from '@/navigation/routes';
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

export const BusinessInformationScreen = () => {
  const router = useRouter();
  const businessInfo = useKycStore((state) => state.businessInfo);
  const setBusinessInfo = useKycStore((state) => state.setBusinessInfo);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { isValid, errors },
  } = useZodForm(businessInfoSchema, {
    defaultValues: businessInfo,
    mode: 'onChange',
  });

  const stateValue = watch('state');

  useEffect(() => {
    const subscription = watch((_values, info) => {
      if (info.name === 'state') {
        setValue('city', '', { shouldValidate: false, shouldDirty: true });
        clearErrors('city');
      }
    });
    return () => subscription.unsubscribe();
  }, [clearErrors, setValue, watch]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const onContinue = useCallback(
    (values: BusinessInfoFormValues) => {
      setBusinessInfo({
        ...values,
        companyType: values.companyType as CompanyType,
      });
      router.push(ROUTES.AUTH.KYC_DOCUMENTS as Href);
    },
    [router, setBusinessInfo],
  );

  return (
    <ScreenWrapper scrollable className="bg-brand-white" contentClassName="pb-xl">
      <AppHeader variant="back" title="KYC Verification" onBack={handleBack} />

      <View className="items-center pt-md">
        <TrustIllustration width={wp(42)} height={wp(38)} />
        <Typography variant="heading" className="mt-md">
          Business Information
        </Typography>
        <Typography variant="subheading" className="mt-sm px-sm">
          Complete your company information before uploading documents.
        </Typography>
      </View>

      <ProgressStepper steps={getKycStepperSteps('basic-info')} className="mt-2xl" />

      <View className="mt-2xl">
        <BusinessInfoForm
          control={control}
          errors={errors}
          stateValue={stateValue}
          clearErrors={clearErrors}
        />
      </View>

      <PrimaryButton
        label="Continue"
        className="mt-2xl"
        disabled={!isValid}
        onPress={handleSubmit(onContinue)}
      />
    </ScreenWrapper>
  );
};
