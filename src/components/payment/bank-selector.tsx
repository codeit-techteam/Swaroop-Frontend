import { memo, useCallback, useState } from 'react';

import { Pressable, View } from 'react-native';

import { AppBottomSheetPicker } from '@/components/ui/app-bottom-sheet-picker';
import { Typography } from '@/components/ui/typography';
import { INDIAN_BANKS } from '@/constants/paymentBanks';
import { ChevronDownIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type BankSelectorProps = {
  label?: string;
  value: string;
  onChange: (bank: string) => void;
  error?: string;
  containerClassName?: string;
};

export const BankSelector = memo(function BankSelector({
  label = 'Your Bank Name',
  value,
  onChange,
  error,
  containerClassName,
}: BankSelectorProps) {
  const [visible, setVisible] = useState(false);

  const openPicker = useCallback(() => {
    setVisible(true);
  }, []);

  const closePicker = useCallback(() => {
    setVisible(false);
  }, []);

  const handleSelect = useCallback(
    (bank: string) => {
      onChange(bank);
    },
    [onChange],
  );

  const displayValue = value || 'Select Bank';

  return (
    <View className={cn('w-full', containerClassName)}>
      <Typography variant="fieldLabel" className="mb-sm text-brand-body">
        {label}
      </Typography>

      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${displayValue}`}
        className={cn(
          'min-h-[48px] w-full flex-row items-center justify-between rounded-md border bg-brand-white px-md',
          error ? 'border-brand-error' : 'border-brand-border',
        )}
      >
        <Typography
          variant="body"
          className={cn('text-[15px]', value ? 'text-brand-heading' : 'text-brand-footer')}
        >
          {displayValue}
        </Typography>
        <ChevronDownIcon color={brandColors.muted} />
      </Pressable>

      {error ? (
        <Typography variant="error" className="mt-xs">
          {error}
        </Typography>
      ) : null}

      <AppBottomSheetPicker
        title="Select Bank"
        items={INDIAN_BANKS}
        selectedValue={value}
        onSelect={handleSelect}
        visible={visible}
        onClose={closePicker}
      />
    </View>
  );
});
