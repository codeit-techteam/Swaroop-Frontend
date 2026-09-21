import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { ArrowRightIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type CheckoutBottomBarProps = {
  enabled: boolean;
  loading?: boolean;
  onPlaceOrder: () => void;
  className?: string;
};

export const CheckoutBottomBar = memo(function CheckoutBottomBar({
  enabled,
  loading = false,
  onPlaceOrder,
  className,
}: CheckoutBottomBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn('border-t border-brand-border bg-brand-white px-lg pt-md', className)}
      style={[elevation.lg, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <Pressable
        onPress={onPlaceOrder}
        disabled={!enabled || loading}
        accessibilityRole="button"
        accessibilityState={{ disabled: !enabled || loading }}
        accessibilityLabel="Verify and place purchase request"
        className={cn(
          'h-14 flex-row items-center justify-center rounded-xl',
          enabled && !loading ? 'bg-brand-heading' : 'bg-brand-disabled',
        )}
        style={({ pressed }) => ({ opacity: enabled && !loading && pressed ? 0.85 : 1 })}
      >
        <Typography variant="button" className="mr-xs text-[15px] tracking-normal text-brand-white">
          {loading ? 'Submitting...' : 'Verify & Place Purchase Request'}
        </Typography>
        <ArrowRightIcon size={iconSizes.sm} color={brandColors.white} />
      </Pressable>
    </View>
  );
});
