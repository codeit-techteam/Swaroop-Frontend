import { memo, useCallback } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { PAYMENT_MODES } from '@/constants/paymentBanks';
import type { PaymentMode } from '@/types/order';
import { cn } from '@/utils/cn';

type PaymentModeSelectorProps = {
  label?: string;
  value: PaymentMode;
  onChange: (mode: PaymentMode) => void;
  containerClassName?: string;
};

export const PaymentModeSelector = memo(function PaymentModeSelector({
  label = 'Payment Mode',
  value,
  onChange,
  containerClassName,
}: PaymentModeSelectorProps) {
  const handleSelect = useCallback(
    (mode: PaymentMode) => {
      onChange(mode);
    },
    [onChange],
  );

  return (
    <View className={cn('w-full', containerClassName)}>
      <Typography variant="fieldLabel" className="mb-sm text-brand-body">
        {label}
      </Typography>

      <View className="flex-row" style={{ gap: 8 }}>
        {PAYMENT_MODES.map((mode) => {
          const selected = mode === value;
          return (
            <Pressable
              key={mode}
              onPress={() => handleSelect(mode)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${mode} payment mode`}
              className={cn(
                'h-10 flex-1 items-center justify-center rounded-md border',
                selected
                  ? 'border-brand-heading bg-brand-heading'
                  : 'border-brand-border bg-brand-white',
              )}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <Typography
                variant="roleTitle"
                className={cn('text-[12px]', selected ? 'text-brand-white' : 'text-brand-heading')}
              >
                {mode}
              </Typography>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});
