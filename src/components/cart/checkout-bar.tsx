import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { formatCartCurrency } from '@/constants/cart';
import { ArrowRightIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type CheckoutBarProps = {
  totalPayable: number;
  enabled: boolean;
  onCheckout: () => void;
  className?: string;
};

export const CheckoutBar = memo(function CheckoutBar({
  totalPayable,
  enabled,
  onCheckout,
  className,
}: CheckoutBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn('border-t border-brand-border bg-brand-white px-lg pt-md', className)}
      style={[elevation.lg, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <View className="flex-row items-center" style={{ gap: 12 }}>
        <View className="mr-sm">
          <Typography
            variant="fieldLabel"
            className="text-[10px] tracking-[0.4px] text-brand-muted"
          >
            Total Payable
          </Typography>
          <Typography
            variant="roleTitle"
            className="text-[18px] text-brand-primary"
            accessibilityLiveRegion="polite"
          >
            {formatCartCurrency(totalPayable)}
          </Typography>
        </View>

        <Pressable
          onPress={onCheckout}
          disabled={!enabled}
          accessibilityRole="button"
          accessibilityState={{ disabled: !enabled }}
          accessibilityLabel="Proceed to checkout"
          className={cn(
            'h-12 flex-1 flex-row items-center justify-center rounded-xl px-md',
            enabled ? 'bg-brand-heading' : 'bg-brand-disabled',
          )}
          style={({ pressed }) => ({ opacity: enabled && pressed ? 0.85 : 1 })}
        >
          <Typography
            variant="button"
            className="mr-xs text-[14px] tracking-normal text-brand-white"
          >
            Proceed to Checkout
          </Typography>
          <ArrowRightIcon size={iconSizes.sm} color={brandColors.white} />
        </Pressable>
      </View>
    </View>
  );
});
