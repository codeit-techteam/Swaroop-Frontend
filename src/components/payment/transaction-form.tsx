import { memo } from 'react';

import { View } from 'react-native';

import { BankSelector } from '@/components/payment/bank-selector';
import { PaymentModeSelector } from '@/components/payment/payment-mode-selector';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { InputField } from '@/components/ui/input-field';
import { Typography } from '@/components/ui/typography';
import { formatPaymentCurrency } from '@/constants/payment';
import { ClipboardCheckIcon, LockIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { PaymentMode } from '@/types/order';
import { cn } from '@/utils/cn';

type TransactionFormProps = {
  amount: number;
  transactionDate: Date;
  onTransactionDateChange: (date: Date) => void;
  bank: string;
  onBankChange: (bank: string) => void;
  bankError?: string;
  paymentMode: PaymentMode;
  onPaymentModeChange: (mode: PaymentMode) => void;
  utr: string;
  onUtrChange: (utr: string) => void;
  utrError?: string;
  className?: string;
};

export const TransactionForm = memo(function TransactionForm({
  amount,
  transactionDate,
  onTransactionDateChange,
  bank,
  onBankChange,
  bankError,
  paymentMode,
  onPaymentModeChange,
  utr,
  onUtrChange,
  utrError,
  className,
}: TransactionFormProps) {
  return (
    <View className={cn('w-full', className)}>
      <View className="mb-lg flex-row items-center">
        <ClipboardCheckIcon size={iconSizes.md} color={brandColors.heading} />
        <Typography variant="roleTitle" className="ml-sm text-[16px] text-brand-heading">
          Transaction Details
        </Typography>
      </View>

      <InputField
        label="Transaction Amount"
        value={formatPaymentCurrency(amount)}
        editable={false}
        containerClassName="mb-lg"
        className="text-brand-heading"
        rightSlot={<LockIcon size={iconSizes.sm} color={brandColors.muted} />}
      />

      <DatePickerField
        label="Transaction Date"
        value={transactionDate}
        onChange={onTransactionDateChange}
        containerClassName="mb-lg"
      />

      <BankSelector
        value={bank}
        onChange={onBankChange}
        error={bankError}
        containerClassName="mb-lg"
      />

      <PaymentModeSelector
        value={paymentMode}
        onChange={onPaymentModeChange}
        containerClassName="mb-lg"
      />

      <InputField
        label="Transaction / UTR Number"
        value={utr}
        onChangeText={onUtrChange}
        placeholder="Enter 12 or 16 digit UTR"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={16}
        error={utrError}
        className="font-mono tracking-wide"
      />
    </View>
  );
});
