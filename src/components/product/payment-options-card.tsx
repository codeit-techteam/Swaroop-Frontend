import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import type { PaymentMethodId } from '@/types/payment';
import type { ProductPaymentOption } from '@/types/product';
import { cn } from '@/utils/cn';

type PaymentOptionsCardProps = {
  options: ProductPaymentOption[];
  selectedId: PaymentMethodId;
  onSelect: (id: PaymentMethodId) => void;
  className?: string;
};

export const PaymentOptionsCard = memo(function PaymentOptionsCard({
  options,
  selectedId,
  onSelect,
  className,
}: PaymentOptionsCardProps) {
  const selected = options.find((option) => option.id === selectedId) ?? options.find((option) => option.eligible);

  return (
    <View
      className={cn(
        'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <Typography variant="fieldLabel" className="text-[10px] tracking-[0.8px] text-brand-muted">
        Payment Method
      </Typography>
      <View className="mt-md" style={{ gap: 8 }}>
        {options.map((option) => {
          const isSelected = option.id === selectedId;
          return (
            <Pressable
              key={option.id}
              onPress={() => {
                if (option.eligible) {
                  onSelect(option.id);
                }
              }}
              disabled={!option.eligible}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, disabled: !option.eligible }}
              accessibilityLabel={option.title}
              className={cn(
                'flex-row items-center rounded-lg border px-md py-md',
                isSelected
                  ? 'border-brand-primary bg-brand-primary-tint'
                  : 'border-brand-border bg-brand-surface',
                !option.eligible && 'opacity-50',
              )}
            >
              <View
                className={cn(
                  'h-4 w-4 items-center justify-center rounded-full border',
                  isSelected
                    ? 'border-brand-heading bg-brand-heading'
                    : 'border-brand-border bg-brand-white',
                )}
              >
                {isSelected ? <View className="h-1.5 w-1.5 rounded-full bg-brand-white" /> : null}
              </View>
              <View className="ml-sm min-w-0 flex-1">
                <View className="flex-row items-center justify-between">
                  <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                    {option.title}
                  </Typography>
                  {option.surchargeLabel ? (
                    <Typography
                      variant="caption"
                      className="font-sans text-[11px] normal-case tracking-normal text-brand-muted"
                    >
                      {option.surchargeLabel}
                    </Typography>
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {selected ? (
        <View className="mt-md rounded-lg border border-brand-success-light bg-brand-success-light/70 px-md py-md">
          <Typography
            variant="fieldLabel"
            className="text-[10px] tracking-[0.8px] text-brand-success"
          >
            Selected Payment
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
            {selected.title}
          </Typography>
          {selected.benefitLabel ? (
            <Typography variant="success" className="mt-xs text-[12px]">
              {selected.benefitLabel}
            </Typography>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});
