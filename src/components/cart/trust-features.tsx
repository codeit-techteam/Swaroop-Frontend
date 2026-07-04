import { memo, type ReactElement } from 'react';

import { View } from 'react-native';

import Animated, { FadeInDown } from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { CART_TRUST_FEATURES } from '@/constants/cart';
import { ClipboardCheckIcon, HeadsetIcon, ShieldCheckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type TrustFeaturesProps = {
  className?: string;
};

const ICON_MAP: Record<
  (typeof CART_TRUST_FEATURES)[number]['icon'],
  (props: { color: string; size: number }) => ReactElement
> = {
  shield: ({ color, size }) => <ShieldCheckIcon color={color} size={size} />,
  clipboard: ({ color, size }) => <ClipboardCheckIcon color={color} size={size} />,
  headset: ({ color, size }) => <HeadsetIcon color={color} size={size} />,
};

export const TrustFeatures = memo(function TrustFeatures({ className }: TrustFeaturesProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(240).duration(360).springify().damping(18)}
      className={cn('mx-lg flex-row', className)}
      style={{ gap: 10 }}
    >
      {CART_TRUST_FEATURES.map((feature) => {
        const Icon = ICON_MAP[feature.icon];
        return (
          <View
            key={feature.id}
            className="flex-1 items-center rounded-xl border border-brand-border bg-brand-surface px-xs py-md"
            style={elevation.sm}
          >
            <View className="mb-sm h-8 w-8 items-center justify-center rounded-full bg-brand-primary-light">
              {Icon({ color: brandColors.primary, size: iconSizes.sm })}
            </View>
            <Typography
              variant="fieldLabel"
              className="text-center text-[9px] tracking-[0.5px] text-brand-body"
            >
              {feature.title}
            </Typography>
          </View>
        );
      })}
    </Animated.View>
  );
});
