import { memo, type ReactNode } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { brandColors } from '@/theme/colors';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

const ACCENT = {
  default: {
    card: 'border-brand-border bg-brand-white',
    tint: 'bg-brand-primary-light',
    title: 'text-brand-body',
    value: 'text-brand-heading',
    icon: brandColors.primaryDark,
  },
  navy: {
    card: 'border-brand-navy bg-brand-navy',
    tint: 'bg-white/15',
    title: 'text-brand-white/75',
    value: 'text-brand-white',
    icon: brandColors.white,
  },
  success: {
    card: 'border-brand-success/20 bg-brand-success-light',
    tint: 'bg-brand-white',
    title: 'text-brand-success',
    value: 'text-brand-heading',
    icon: brandColors.success,
  },
  warning: {
    card: 'border-[#F59E0B]/25 bg-[#FEF3E8]',
    tint: 'bg-brand-white',
    title: 'text-[#B45309]',
    value: 'text-brand-heading',
    icon: '#B45309',
  },
} as const;

export const AmountCard = memo(function AmountCard({
  title,
  value,
  accent = 'default',
  icon,
  subtitle,
  selected = false,
  onPress,
  className,
}: {
  title: string;
  value: string;
  accent?: keyof typeof ACCENT;
  icon?: ReactNode;
  subtitle?: string;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
}) {
  const palette = ACCENT[accent];
  const cardStyle = [elevation.sm];

  const body = (
    <>
      <View className="flex-row items-center justify-between">
        {icon ? (
          <View className={cn('h-8 w-8 items-center justify-center rounded-xl', palette.tint)}>
            {icon}
          </View>
        ) : (
          <View />
        )}
        <Typography
          variant="headingLeft"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          className={cn('ml-sm flex-1 text-right text-[20px] leading-[24px]', palette.value)}
        >
          {value}
        </Typography>
      </View>
      <Typography
        variant="legal"
        numberOfLines={1}
        className={cn('mt-sm text-left text-[11px]', palette.title)}
      >
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="legal" numberOfLines={1} className="mt-xs text-left text-[10px] text-brand-footer">
          {subtitle}
        </Typography>
      ) : null}
    </>
  );

  const classNames = cn(
    'min-h-[92px] w-full rounded-2xl border px-md py-md',
    palette.card,
    selected && accent === 'default' && 'border-brand-navy bg-brand-primary-tint',
    className,
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title} ${value}`}
        className={classNames}
        style={({ pressed }) => [...cardStyle, { opacity: pressed ? 0.92 : 1 }]}
      >
        {body}
      </Pressable>
    );
  }

  return (
    <View accessibilityLabel={`${title} ${value}`} className={classNames} style={cardStyle}>
      {body}
    </View>
  );
});
