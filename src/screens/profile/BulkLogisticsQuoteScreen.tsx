import { memo, useCallback, useMemo, useState } from 'react';

import { View } from 'react-native';

import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { AppHeader, InputField, PrimaryButton, ScreenWrapper, Typography } from '@/components';
import { useProfile } from '@/hooks/useProfile';
import {
  bulkLogisticsQuoteErrorMessage,
  submitBulkLogisticsQuote,
} from '@/services/bulk-logistics-quote';
import { emailSchema, phoneSchema } from '@/utils/validators';

export const BulkLogisticsQuoteScreen = memo(function BulkLogisticsQuoteScreen() {
  const router = useRouter();
  const { profile } = useProfile();

  const [contactName, setContactName] = useState(profile.displayName);
  const [companyName, setCompanyName] = useState(profile.companyName);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [materialName, setMaterialName] = useState('');
  const [quantityMt, setQuantityMt] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState(
    [profile.city, profile.state].filter(Boolean).join(', '),
  );
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const primaryAddress = useMemo(
    () => profile.savedAddresses.find((addr) => addr.isPrimary)?.addressLine ?? '',
    [profile.savedAddresses],
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const onSubmit = useCallback(async () => {
    if (!contactName.trim()) {
      setError('Contact name is required.');
      return;
    }
    if (!companyName.trim()) {
      setError('Company name is required.');
      return;
    }
    if (!emailSchema.safeParse(email.trim()).success) {
      setError('Enter a valid email address.');
      return;
    }
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    if (!phoneSchema.safeParse(normalizedPhone).success) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (!materialName.trim()) {
      setError('Material / grade is required.');
      return;
    }
    const qty = Number(quantityMt);
    if (!Number.isFinite(qty) || qty < 1) {
      setError('Enter a valid quantity of at least 1 MT.');
      return;
    }
    if (!pickupLocation.trim()) {
      setError('Pickup location is required.');
      return;
    }
    if (!deliveryLocation.trim()) {
      setError('Delivery location is required.');
      return;
    }
    if (preferredDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate.trim())) {
      setError('Preferred date must be YYYY-MM-DD.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const result = await submitBulkLogisticsQuote({
        contactName: contactName.trim(),
        companyName: companyName.trim(),
        email: email.trim(),
        phone: normalizedPhone,
        materialName: materialName.trim(),
        quantityMt: qty,
        pickupLocation: pickupLocation.trim() || primaryAddress,
        deliveryLocation: deliveryLocation.trim(),
        preferredDate: preferredDate.trim() || undefined,
        message: message.trim() || undefined,
      });

      Toast.show({
        type: 'success',
        text1: 'Request submitted',
        text2: `${result.requestNumber} sent to PetroTrade logistics team.`,
        visibilityTime: 2500,
      });
      router.back();
    } catch (err) {
      setError(bulkLogisticsQuoteErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [
    companyName,
    contactName,
    deliveryLocation,
    email,
    materialName,
    message,
    phone,
    pickupLocation,
    preferredDate,
    primaryAddress,
    quantityMt,
    router,
  ]);

  return (
    <ScreenWrapper scrollable className="bg-brand-background" contentClassName="pb-xl">
      <AppHeader variant="back" title="Get Bulk Logistics" onBack={handleBack} />

      <View className="mt-md gap-sm">
        <Typography variant="headingLeft" className="text-[20px] text-brand-navy">
          Enterprise logistics quote
        </Typography>
        <Typography variant="subheadingLeft" className="text-[13px] leading-5 text-brand-body">
          Share shipment details and our logistics team will respond with a customized quote.
        </Typography>
      </View>

      <View className="mt-lg gap-md">
        <InputField
          label="Contact name"
          value={contactName}
          onChangeText={setContactName}
          placeholder="Full name"
          autoCapitalize="words"
        />
        <InputField
          label="Company name"
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="Registered business name"
          autoCapitalize="words"
        />
        <InputField
          label="Work email"
          value={email}
          onChangeText={setEmail}
          placeholder="name@company.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <InputField
          label="Mobile number"
          value={phone}
          onChangeText={setPhone}
          placeholder="10-digit mobile"
          keyboardType="phone-pad"
        />
        <InputField
          label="Material / grade"
          value={materialName}
          onChangeText={setMaterialName}
          placeholder="e.g. HDPE Film, PP Raffia"
        />
        <InputField
          label="Quantity (MT)"
          value={quantityMt}
          onChangeText={setQuantityMt}
          placeholder="Minimum 1 MT"
          keyboardType="decimal-pad"
        />
        <InputField
          label="Pickup / loading location"
          value={pickupLocation}
          onChangeText={setPickupLocation}
          placeholder="Plant, port, or city"
        />
        <InputField
          label="Delivery location"
          value={deliveryLocation}
          onChangeText={setDeliveryLocation}
          placeholder="City, state, or warehouse"
        />
        <InputField
          label="Preferred delivery date (optional)"
          value={preferredDate}
          onChangeText={setPreferredDate}
          placeholder="YYYY-MM-DD"
        />
        <InputField
          label="Additional requirements (optional)"
          value={message}
          onChangeText={setMessage}
          placeholder="Fleet type, multi-drop, packaging, etc."
          multiline
        />
      </View>

      {error ? (
        <Typography variant="legal" className="mt-md text-brand-error">
          {error}
        </Typography>
      ) : null}

      <View className="mt-xl">
        <PrimaryButton
          label={submitting ? 'Submitting...' : 'Submit Request'}
          onPress={() => void onSubmit()}
          disabled={submitting}
        />
      </View>
    </ScreenWrapper>
  );
});
