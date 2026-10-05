import { memo, useState } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import {
  SELLER_REVERIFY_NOTICE,
  type SellerIdentityStatus,
  verifyButtonLabel,
} from '@/seller/components/SellerGstValidateCard';
import { SellerPrimaryButton, SellerTextField } from '@/seller/components/SellerPrimitives';
import {
  PAN_PATTERN,
  type KycVerificationDetails,
  type KycVerifyResult,
} from '@/services/customer-kyc';
import { sellerOnboardingErrorMessage, verifySellerPan } from '@/services/seller-onboarding';
import { cn } from '@/utils/cn';

type SellerPanVerifyFieldProps = {
  value: string;
  status: SellerIdentityStatus;
  details?: KycVerificationDetails | null;
  message?: string | null;
  locked?: boolean;
  error?: string;
  onChange: (pan: string) => void;
  onResult: (result: KycVerifyResult, pan: string) => void;
  onEdit?: () => void;
  onBlur?: () => void;
};

export const SellerPanVerifyField = memo(function SellerPanVerifyField({
  value,
  status,
  details,
  message,
  locked = false,
  error,
  onChange,
  onResult,
  onEdit,
  onBlur,
}: SellerPanVerifyFieldProps) {
  const [verifying, setVerifying] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();
  const accepted = status === 'verified' || status === 'manual_review';
  const inputLocked = locked || accepted;

  const handleVerify = async () => {
    const pan = value.trim().toUpperCase();
    if (!PAN_PATTERN.test(pan)) {
      setLocalError('Enter a valid 10-character PAN (for example ABCDE1234F).');
      return;
    }
    setLocalError(undefined);
    setVerifying(true);
    try {
      const result = await verifySellerPan(pan);
      if (result.status === 'FAILED') setLocalError(result.message);
      onResult(result, pan);
    } catch (err) {
      setLocalError(
        sellerOnboardingErrorMessage(err, 'PAN verification failed. Please try again.'),
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <View className="gap-sm">
      <SellerTextField
        label="Permanent Account Number (PAN)"
        placeholder="ABCDE1234F"
        autoCapitalize="characters"
        maxLength={10}
        value={value}
        editable={!inputLocked && !verifying}
        onChangeText={(text) => {
          onChange(text.replace(/\s/g, '').toUpperCase().slice(0, 10));
          setLocalError(undefined);
        }}
        onBlur={onBlur}
        error={localError ?? error}
      />
      <SellerPrimaryButton
        label={verifyButtonLabel(status, verifying)}
        loading={verifying}
        disabled={inputLocked || value.length !== 10}
        onPress={() => void handleVerify()}
        className={cn(
          'rounded-2xl py-md',
          status === 'verified'
            ? 'bg-brand-success'
            : status === 'failed'
              ? 'bg-brand-error'
              : 'bg-[#4F6BFF]',
        )}
      />
      {status === 'verified' && details?.nameOnPan ? (
        <Typography variant="success">Name on PAN: {details.nameOnPan}</Typography>
      ) : null}
      {status === 'manual_review' ? (
        <Typography variant="body" className="text-amber-700">
          {message ||
            'PAN verification is temporarily unavailable. Our team will verify it during review.'}
        </Typography>
      ) : null}
      {inputLocked ? (
        <View className="flex-row items-center justify-between">
          <Typography variant="legal" className="flex-1 text-brand-footer">
            {SELLER_REVERIFY_NOTICE}
          </Typography>
          {!locked && onEdit ? (
            <Pressable onPress={onEdit} accessibilityRole="button" hitSlop={8}>
              <Typography variant="link" className="text-[#4F6BFF]">
                Change
              </Typography>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});
