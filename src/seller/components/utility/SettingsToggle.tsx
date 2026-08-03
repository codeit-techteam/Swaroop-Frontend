import { memo } from 'react';

import { Pressable, Switch, View } from 'react-native';

import { Typography } from '@/components';
import { ChevronRightIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type SettingsToggleProps = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isLast?: boolean;
};

export const SettingsToggle = memo(function SettingsToggle({
  label,
  description,
  value,
  onValueChange,
  isLast = false,
}: SettingsToggleProps) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between py-md',
        !isLast && 'border-b border-brand-border',
      )}
    >
      <View className="mr-md flex-1">
        <Typography variant="roleTitle">{label}</Typography>
        {description ? (
          <Typography variant="legal" className="mt-0.5 text-left text-brand-body">
            {description}
          </Typography>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: brandColors.border, true: brandColors.primary }}
        thumbColor={brandColors.white}
      />
    </View>
  );
});

type SettingsSelectProps = {
  label: string;
  value: string;
  onPress: () => void;
  isLast?: boolean;
};

export const SettingsSelect = memo(function SettingsSelect({
  label,
  value,
  onPress,
  isLast = false,
}: SettingsSelectProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center justify-between py-md',
        !isLast && 'border-b border-brand-border',
      )}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      <Typography variant="roleTitle">{label}</Typography>
      <View className="flex-row items-center gap-xs">
        <Typography variant="legal" className="text-brand-primary">
          {value}
        </Typography>
        <ChevronRightIcon size={16} color={brandColors.body} />
      </View>
    </Pressable>
  );
});

type SettingsActionProps = {
  label: string;
  description?: string;
  onPress: () => void;
  destructive?: boolean;
  isLast?: boolean;
};

export const SettingsAction = memo(function SettingsAction({
  label,
  description,
  onPress,
  destructive = false,
  isLast = false,
}: SettingsActionProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center justify-between py-md',
        !isLast && 'border-b border-brand-border',
      )}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      <View className="flex-1">
        <Typography variant="roleTitle" className={destructive ? 'text-brand-error' : undefined}>
          {label}
        </Typography>
        {description ? (
          <Typography variant="legal" className="mt-0.5 text-left text-brand-body">
            {description}
          </Typography>
        ) : null}
      </View>
      <ChevronRightIcon size={16} color={brandColors.body} />
    </Pressable>
  );
});

type SettingsInfoProps = {
  label: string;
  value: string;
  isLast?: boolean;
};

export const SettingsInfo = memo(function SettingsInfo({ label, value, isLast = false }: SettingsInfoProps) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between py-md',
        !isLast && 'border-b border-brand-border',
      )}
    >
      <Typography variant="roleTitle">{label}</Typography>
      <Typography variant="legal" className="text-brand-body">
        {value}
      </Typography>
    </View>
  );
});

export const SettingsGroup = memo(function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mt-lg">
      <Typography variant="badge" className="mb-sm text-[11px] uppercase tracking-wide text-brand-body">
        {title}
      </Typography>
      <View className="rounded-[22px] border border-brand-border bg-brand-white px-lg">{children}</View>
    </View>
  );
});
