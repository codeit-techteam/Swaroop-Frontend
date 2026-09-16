import { memo, useState } from 'react';

import { ActivityIndicator, Linking, Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { SellerPrimaryButton, SellerTextField } from '@/seller/components/SellerPrimitives';
import {
  GST_BOOK_MEETING_URL,
  GST_KNOW_MORE_URL,
  type GstParseResult,
  normalizeGstin,
  parseGstin,
} from '@/seller/utils/gst';
import { cn } from '@/utils/cn';

const VALIDATE_DELAY_MS = 500;

type SellerGstValidateCardProps = {
  value: string;
  verified: boolean;
  result?: GstParseResult | null;
  error?: string;
  onChange: (gstNumber: string) => void;
  onVerified: (result: GstParseResult) => void;
  onBlur?: () => void;
  className?: string;
};

export const SellerGstValidateCard = memo(function SellerGstValidateCard({
  value,
  verified,
  result,
  error,
  onChange,
  onVerified,
  onBlur,
  className,
}: SellerGstValidateCardProps) {
  const [validating, setValidating] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();

  const handleValidate = () => {
    const parsed = parseGstin(value);
    if (!parsed.isValid) {
      setLocalError(parsed.error ?? 'Enter a valid GST number');
      return;
    }

    setLocalError(undefined);
    setValidating(true);
    setTimeout(() => {
      onVerified(parsed);
      setValidating(false);
    }, VALIDATE_DELAY_MS);
  };

  const showResult = verified && Boolean(result?.isValid);
  const displayError = localError ?? error;

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
          onChangeText={(text) => {
            onChange(normalizeGstin(text).slice(0, 15));
            setLocalError(undefined);
          }}
          onBlur={onBlur}
          error={displayError}
        />
      </View>

      <View className="mt-md">
        {validating ? (
          <View className="h-12 items-center justify-center rounded-2xl bg-[#4F6BFF]">
            <ActivityIndicator color="#FFFFFF" />
          </View>
        ) : (
          <SellerPrimaryButton
            label="Validate"
            disabled={value.length !== 15}
            onPress={handleValidate}
            className="rounded-2xl bg-[#4F6BFF] py-md"
          />
        )}
      </View>

      {showResult && result ? (
        <View className="mt-lg gap-sm">
          <Typography variant="success">✓ Valid GST Number</Typography>
          <Typography variant="body">
            GST Number: {result.gstNumber}
          </Typography>
          <Typography variant="body">State Code: {result.stateCode}</Typography>
          <Typography variant="body">State: {result.state}</Typography>
          <View className="flex-row flex-wrap items-center">
            <Typography variant="body">Company PAN: </Typography>
            <View className="rounded-md bg-brand-uploaded px-sm py-xs">
              <Typography variant="body" className="font-semibold text-brand-heading">
                {result.pan}
              </Typography>
            </View>
          </View>
          <Typography variant="roleTitle" className="mt-sm">
            For more details:
          </Typography>
          <Pressable
            onPress={() => void Linking.openURL(GST_BOOK_MEETING_URL)}
            accessibilityRole="link"
          >
            <Typography variant="link" className="text-[#4F6BFF]">
              Let's Connect – Book a meeting
            </Typography>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
});
