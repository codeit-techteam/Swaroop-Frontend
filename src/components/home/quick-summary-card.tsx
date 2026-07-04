import { memo } from 'react';

import { Pressable, View } from 'react-native';

import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { ChevronRightIcon, TruckIcon, WalletIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { QuickSummaryItem } from '@/types/home';
import { cn } from '@/utils/cn';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type QuickSummaryCardProps = {
  item: QuickSummaryItem;
  onPress: () => void;
  className?: string;
};

export const QuickSummaryCard = memo(function QuickSummaryCard({
  item,
  onPress,
  className,
}: QuickSummaryCardProps) {
  const scale = useSharedValue(1);
  const isDanger = item.valueTone === 'danger';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 16, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 320 });
      }}
      accessibilityRole="button"
      accessibilityLabel={`${item.label} ${item.value} ${item.subtitle}`.trim()}
      className={cn(
        'flex-1 rounded-xl border border-brand-border/60 bg-brand-white p-md shadow-sm',
        className,
      )}
      style={animatedStyle}
    >
      <View className="mb-md flex-row items-start justify-between">
        <View
          className={cn(
            'h-9 w-9 items-center justify-center rounded-lg',
            isDanger ? 'bg-brand-error-light' : 'bg-brand-primary-light',
          )}
        >
          {item.type === 'orders' ? (
            <TruckIcon color={brandColors.primary} />
          ) : (
            <WalletIcon color={brandColors.invoice} />
          )}
        </View>
        <ChevronRightIcon color={brandColors.muted} />
      </View>

      <Typography variant="fieldLabel" className="text-[10px] tracking-[1px] text-brand-muted">
        {item.label}
      </Typography>

      <View className="mt-xs flex-row items-end">
        <Typography
          variant="headingLeft"
          className={cn(
            'text-[22px] leading-[26px]',
            isDanger ? 'text-brand-invoice' : 'text-brand-primary',
          )}
        >
          {item.value}
        </Typography>
        {item.subtitle ? (
          <Typography variant="body" className="mb-0.5 ml-xs text-[14px] text-brand-heading">
            {item.subtitle}
          </Typography>
        ) : null}
      </View>
    </AnimatedPressable>
  );
});
