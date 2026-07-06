import { memo, useEffect } from 'react';

import { View } from 'react-native';

import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { PURCHASE_ORDER_COPY } from '@/constants/purchaseOrderTimeline';
import { CheckCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type PurchaseOrderInfoCardProps = {
  poNumber: string;
  orderNumber: string;
  className?: string;
};

export const PurchaseOrderInfoCard = memo(function PurchaseOrderInfoCard({
  poNumber,
  orderNumber,
  className,
}: PurchaseOrderInfoCardProps) {
  const badgeOpacity = useSharedValue(0);

  useEffect(() => {
    badgeOpacity.value = withTiming(1, { duration: 500 });
  }, [badgeOpacity]);

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
  }));

  return (
    <View
      className={cn(
        'overflow-hidden rounded-2xl border border-brand-border bg-brand-white',
        className,
      )}
      style={elevation.sm}
    >
      <View className="flex-row">
        <View className="w-1 bg-brand-primary" />
        <View className="flex-1 p-lg">
          <View className="flex-row items-start justify-between">
            <View className="min-w-0 flex-1 pr-md">
              <Typography
                variant="fieldLabel"
                className="text-[10px] tracking-[0.8px] text-brand-muted"
              >
                {PURCHASE_ORDER_COPY.poIdentificationLabel}
              </Typography>
              <Typography variant="headingLeft" className="mt-xs text-[18px] text-brand-heading">
                {poNumber}
              </Typography>

              <Typography variant="roleDescription" className="mt-md text-[12px] text-brand-muted">
                {PURCHASE_ORDER_COPY.referenceOrderLabel}
              </Typography>
              <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
                {orderNumber}
              </Typography>
            </View>

            <Animated.View
              style={badgeStyle}
              className="flex-row items-center rounded-full bg-brand-success-light px-sm py-xs"
            >
              <CheckCircleIcon size={iconSizes.sm} color={brandColors.success} />
              <Typography
                variant="badge"
                className="ml-xs text-[11px] text-brand-success"
              >
                {PURCHASE_ORDER_COPY.statusConfirmed}
              </Typography>
            </Animated.View>
          </View>
        </View>
      </View>
    </View>
  );
});
