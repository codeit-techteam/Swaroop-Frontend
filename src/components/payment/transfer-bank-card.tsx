import { memo, useCallback } from 'react';

import { Pressable, View } from 'react-native';

import * as Clipboard from 'expo-clipboard';

import Toast from 'react-native-toast-message';

import { Typography } from '@/components/ui/typography';
import { PETROTRADE_TRANSFER_BANK, type TransferBankDetails } from '@/constants/paymentBanks';
import { BankIcon, CopyIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type TransferBankCardProps = {
  details?: TransferBankDetails;
  className?: string;
};

type BankDetailRowProps = {
  label: string;
  value: string;
  copyable?: boolean;
  monospace?: boolean;
  className?: string;
};

const BankDetailRow = memo(function BankDetailRow({
  label,
  value,
  copyable = false,
  monospace = false,
  className,
}: BankDetailRowProps) {
  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(value);
    Toast.show({
      type: 'success',
      text1: 'Copied Successfully',
      visibilityTime: 2000,
    });
  }, [value]);

  return (
    <View
      className={cn(
        'flex-row items-center justify-between rounded-xl bg-brand-white px-md py-md',
        className,
      )}
    >
      <View className="mr-sm flex-1">
        <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
          {label}
        </Typography>
        <Typography
          variant="roleTitle"
          className={cn(
            'mt-xs text-[14px] text-brand-heading',
            monospace && 'font-mono text-[13px]',
          )}
        >
          {value}
        </Typography>
      </View>
      {copyable ? (
        <Pressable
          onPress={handleCopy}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Copy ${label}`}
          className="h-9 w-9 items-center justify-center"
        >
          <CopyIcon size={iconSizes.md} color={brandColors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
});

export const TransferBankCard = memo(function TransferBankCard({
  details = PETROTRADE_TRANSFER_BANK,
  className,
}: TransferBankCardProps) {
  return (
    <View className={cn('rounded-2xl bg-brand-primary-light p-lg', className)}>
      <View className="mb-md flex-row items-center">
        <BankIcon size={iconSizes.md} color={brandColors.heading} />
        <Typography variant="roleTitle" className="ml-sm text-[16px] text-brand-heading">
          Transfer Bank Details
        </Typography>
      </View>

      <View style={{ gap: 10 }}>
        <BankDetailRow label="Transfer To" value={details.transferTo} copyable />

        <View className="flex-row" style={{ gap: 10 }}>
          <View className="flex-1">
            <BankDetailRow label="Bank Name" value={details.bankName} />
          </View>
          <View className="flex-1">
            <BankDetailRow label="IFSC Code" value={details.ifscCode} copyable monospace />
          </View>
        </View>

        <BankDetailRow label="Account Number" value={details.accountNumber} copyable monospace />
        <BankDetailRow label="UPI ID" value={details.upiId} copyable monospace />
      </View>
    </View>
  );
});
