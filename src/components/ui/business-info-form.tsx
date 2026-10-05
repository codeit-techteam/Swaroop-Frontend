import { memo, useMemo } from 'react';

import { Pressable, View } from 'react-native';

import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormClearErrors,
} from 'react-hook-form';

import { CountryPicker } from '@/components/ui/country-picker';
import { DropdownField } from '@/components/ui/dropdown-field';
import { InputField } from '@/components/ui/input-field';
import { Typography } from '@/components/ui/typography';
import {
  COMPANY_TYPE_OPTIONS,
  INDIAN_STATES,
  NATURE_OF_BUSINESS_OPTIONS,
  STATE_OPTIONS,
} from '@/constants/documents';

type BusinessFormValues = {
  businessEntityName: string;
  companyType: string;
  gstNumber: string;
  panNumber: string;
  businessEmail: string;
  mobileNumber: string;
  businessAddress: string;
  state: string;
  city: string;
  pincode: string;
  natureOfBusiness: string;
  annualPurchaseVolume: string;
  expectedMonthlyRequirement: string;
};

type BusinessInfoFormProps = {
  control: Control<BusinessFormValues>;
  errors: FieldErrors<BusinessFormValues>;
  stateValue: string;
  clearErrors: UseFormClearErrors<BusinessFormValues>;
  /** Verified identifiers are read-only until the user chooses to re-verify. */
  lockedIdentifiers?: { gstNumber?: boolean; panNumber?: boolean };
  /** Omit when identifiers cannot change at all (KYC submitted or approved). */
  onEditIdentifier?: (field: 'gstNumber' | 'panNumber') => void;
};

const ReverifyNotice = ({ onEdit }: { onEdit?: () => void }) => (
  <View className="mt-xs flex-row items-center justify-between gap-sm">
    <Typography variant="legal" className="flex-1 text-left text-brand-label">
      Changing this information requires re-verification.
    </Typography>
    {onEdit ? (
      <Pressable onPress={onEdit} hitSlop={8} accessibilityRole="button">
        <Typography variant="link" className="text-brand-primary">
          Change
        </Typography>
      </Pressable>
    ) : null}
  </View>
);

export const BusinessInfoForm = memo(function BusinessInfoForm({
  control,
  errors,
  stateValue,
  clearErrors,
  lockedIdentifiers,
  onEditIdentifier,
}: BusinessInfoFormProps) {
  const cityOptions = useMemo(
    () => (stateValue ? (INDIAN_STATES[stateValue] ?? []) : []),
    [stateValue],
  );

  return (
    <View className="w-full gap-lg">
      <Controller
        control={control}
        name="businessEntityName"
        render={({ field: { onChange, onBlur, value } }) => (
          <InputField
            label="Business Entity Name *"
            placeholder="Enter registered business name"
            autoCapitalize="words"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.businessEntityName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="companyType"
        render={({ field: { onChange, value } }) => (
          <DropdownField
            label="Company Type *"
            value={value}
            options={COMPANY_TYPE_OPTIONS}
            placeholder="Select company type"
            onChange={(selected) => {
              onChange(selected);
              clearErrors('companyType');
            }}
            error={errors.companyType?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="gstNumber"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <InputField
              label="GST Number *"
              placeholder="22AAAAA0000A1Z5"
              autoCapitalize="characters"
              value={value}
              editable={!lockedIdentifiers?.gstNumber}
              onChangeText={(text) => onChange(text.toUpperCase())}
              onBlur={onBlur}
              error={errors.gstNumber?.message}
            />
            {lockedIdentifiers?.gstNumber ? (
              <ReverifyNotice
                onEdit={onEditIdentifier ? () => onEditIdentifier('gstNumber') : undefined}
              />
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="panNumber"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <InputField
              label="PAN Number *"
              placeholder="AAAAA0000A"
              autoCapitalize="characters"
              maxLength={10}
              value={value}
              editable={!lockedIdentifiers?.panNumber}
              onChangeText={(text) => onChange(text.toUpperCase())}
              onBlur={onBlur}
              error={errors.panNumber?.message}
            />
            {lockedIdentifiers?.panNumber ? (
              <ReverifyNotice
                onEdit={onEditIdentifier ? () => onEditIdentifier('panNumber') : undefined}
              />
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="businessEmail"
        render={({ field: { onChange, onBlur, value } }) => (
          <InputField
            label="Business Email *"
            placeholder="accounts@company.com"
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
        name="mobileNumber"
        render={({ field: { onChange, onBlur, value } }) => (
          <InputField
            label="Mobile Number *"
            placeholder="98765 43210"
            keyboardType="phone-pad"
            maxLength={10}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.mobileNumber?.message}
            leftSlot={<CountryPicker />}
          />
        )}
      />

      <Controller
        control={control}
        name="businessAddress"
        render={({ field: { onChange, onBlur, value } }) => (
          <InputField
            label="Business Address *"
            placeholder="Registered office address"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.businessAddress?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="state"
        render={({ field: { onChange, value } }) => (
          <DropdownField
            label="State *"
            value={value}
            options={STATE_OPTIONS}
            placeholder="Select state"
            onChange={(selected) => {
              onChange(selected);
              clearErrors('state');
            }}
            error={errors.state?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="city"
        render={({ field: { onChange, value } }) => (
          <DropdownField
            label="City *"
            value={value}
            options={cityOptions}
            placeholder={stateValue ? 'Select city' : 'Select state first'}
            onChange={(city) => {
              onChange(city);
              clearErrors('city');
            }}
            disabled={!stateValue || cityOptions.length === 0}
            error={errors.city?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="pincode"
        render={({ field: { onChange, onBlur, value } }) => (
          <InputField
            label="Pincode *"
            placeholder="400001"
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
        render={({ field: { onChange, value } }) => (
          <DropdownField
            label="Nature of Business *"
            value={value}
            options={NATURE_OF_BUSINESS_OPTIONS}
            placeholder="Select nature of business"
            onChange={(selected) => {
              onChange(selected);
              clearErrors('natureOfBusiness');
            }}
            error={errors.natureOfBusiness?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="annualPurchaseVolume"
        render={({ field: { onChange, onBlur, value } }) => (
          <InputField
            label="Annual Purchase Volume (₹)"
            placeholder="Optional"
            keyboardType="number-pad"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="expectedMonthlyRequirement"
        render={({ field: { onChange, onBlur, value } }) => (
          <InputField
            label="Expected Monthly Requirement"
            placeholder="Optional"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
    </View>
  );
});
