import { memo, useState } from 'react';

import { Linking, Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { SellerPrimaryButton, SellerTextField } from '@/seller/components/SellerPrimitives';
import {
  GST_BOOK_MEETING_URL,
  GST_KNOW_MORE_URL,
  normalizeGstin,
  parseGstin,
} from '@/seller/utils/gst';
import type { KycVerificationDetails, KycVerifyResult } from '@/services/customer-kyc';
import { sellerOnboardingErrorMessage, verifySellerGst } from '@/services/seller-onboarding';
import { cn } from '@/utils/cn';

export const SELLER_REVERIFY_NOTICE = 'Changing this information requires re-verification.';

export type SellerIdentityStatus = 'idle' | 'verified' | 'manual_review' | 'failed';

export function sellerIdentityStatus(status: KycVerifyResult['status'] | undefined | null) {
  if (status === 'VERIFIED') return 'verified' as const;
  if (status === 'MANUAL_REVIEW') return 'manual_review' as const;
  if (status === 'FAILED') return 'failed' as const;
  return 'idle' as const;
}

export function verifyButtonLabel(status: SellerIdentityStatus, verifying: boolean) {
  if (verifying) return 'Verifying…';
  if (status === 'verified') return '✓ Verified';
  if (status === 'failed') return '✕ Failed';
  if (status === 'manual_review') return 'Sent for review';
  return 'Verify';
}

type SellerGstValidateCardProps = {
  value: string;
  status: SellerIdentityStatus;
  details?: KycVerificationDetails | null;
  message?: string | null;
  /** Onboarding is submitted / approved — identifiers cannot change. */
  locked?: boolean;
  error?: string;
  onChange: (gstNumber: string) => void;
  onResult: (result: KycVerifyResult, gstin: string) => void;
  onEdit?: () => void;
  onBlur?: () => void;
  className?: string;
};

export const SellerGstValidateCard = memo(function SellerGstValidateCard({
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
  className,
}: SellerGstValidateCardProps) {
  const [verifying, setVerifying] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();
  const accepted = status === 'verified' || status === 'manual_review';
  const inputLocked = locked || accepted;

  const handleVerify = async () => {
    const parsed = parseGstin(value);
    if (!parsed.isValid) {
      setLocalError(parsed.error ?? 'Enter a valid GST number');
      return;
    }
    setLocalError(undefined);
    setVerifying(true);
    try {
      const result = await verifySellerGst(parsed.gstNumber);
      if (result.status === 'FAILED') setLocalError(result.message);
      onResult(result, parsed.gstNumber);
    } catch (err) {
      setLocalError(
        sellerOnboardingErrorMessage(err, 'GST verification failed. Please try again.'),
      );
    } finally {
      setVerifying(false);
    }
  };

  const displayError = localError ?? error;
  const rows: [string, string | null | undefined][] = details
    ? [
        ['Legal Name', details.legalName],
        ['Trade Name', details.tradeName],
        ['GST Status', details.gstStatus],
        ['State', details.state],
        ['State Code', details.stateCode],
        ['Company PAN', details.panMasked],
        ['Taxpayer Type', details.taxpayerType],
        ['Constitution', details.constitution],
        ['Registered On', details.registrationDate],
        ['Cancelled On', details.cancellationDate],
      ]
    : [];

  return (
    <View className={cn('rounded-2xl bg-brand-white p-lg shadow-sm', className)}>
      <Typography variant="headingLeft" className="text-center text-[20px]">
        Validate GST
      </Typography>
      <Pressable
        onPress={() => void Linking.openURL(GST_KNOW_MORE_URL)}
        accessibilityRole="link"
        className="mt-xs self-center"
      >
        <Typography variant="legal" className="text-center text-brand-footer">
          Know more about GST
        </Typography>
      </Pressable>

      <View className="mt-lg">
        <SellerTextField
          label="GST Identification Number"
          placeholder="19ABCCA6289R1ZP"
          autoCapitalize="characters"
          maxLength={15}
          value={value}
          editable={!inputLocked && !verifying}
          onChangeText={(text) => {
            onChange(normalizeGstin(text).slice(0, 15));
            setLocalError(undefined);
          }}
          onBlur={onBlur}
          error={displayError}
        />
      </View>

      <View className="mt-md">
        <SellerPrimaryButton
          label={verifyButtonLabel(status, verifying)}
          loading={verifying}
          disabled={inputLocked || value.length !== 15}
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
      </View>

      {inputLocked ? (
        <View className="mt-sm flex-row items-center justify-between">
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

      {accepted ? (
        <View className="mt-lg gap-sm">
          {status === 'verified' ? (
            <Typography variant="success">✓ GSTIN verified</Typography>
          ) : (
            <Typography variant="body" className="text-amber-700">
              {message ||
                'GST verification is temporarily unavailable. Our team will verify it during review.'}
            </Typography>
          )}
          <Typography variant="body">GST Number: {value}</Typography>
          {rows
            .filter(([, rowValue]) => Boolean(rowValue))
            .map(([label, rowValue]) => (
              <Typography key={label} variant="body">
                {label}: {rowValue}
              </Typography>
            ))}
          <Typography variant="roleTitle" className="mt-sm">
            For more details:
          </Typography>
          <Pressable
            onPress={() => void Linking.openURL(GST_BOOK_MEETING_URL)}
            accessibilityRole="link"
          >
            <Typography variant="link" className="text-[#4F6BFF]">
              Let&apos;s Connect – Book a meeting
            </Typography>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
});
