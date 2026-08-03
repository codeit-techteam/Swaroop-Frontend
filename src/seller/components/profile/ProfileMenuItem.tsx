import { memo, type ReactNode } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { ChevronRightIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type ProfileInfoCardProps = {
  title: string;
  children: ReactNode;
};

export const ProfileInfoCard = memo(function ProfileInfoCard({ title, children }: ProfileInfoCardProps) {
  return (
    <View className="mt-lg">
      <Typography variant="badge" className="mb-sm text-[11px] uppercase tracking-wide text-brand-body">
        {title}
      </Typography>
      <View className="overflow-hidden rounded-2xl border border-brand-border bg-brand-white">
        {children}
      </View>
    </View>
  );
});

type ProfileMenuItemProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  subtitleAccent?: 'default' | 'success' | 'primary';
  showChevron?: boolean;
  onPress?: () => void;
  isLast?: boolean;
};

export const ProfileMenuItem = memo(function ProfileMenuItem({
  icon,
  title,
  subtitle,
  subtitleAccent = 'default',
  showChevron = true,
  onPress,
  isLast = false,
}: ProfileMenuItemProps) {
  const subtitleClass =
    subtitleAccent === 'success'
      ? 'text-brand-success'
      : subtitleAccent === 'primary'
        ? 'text-brand-primary'
        : 'text-brand-body';

  return (
    <Pressable
      onPress={onPress}
      className={!isLast ? 'border-b border-brand-border' : undefined}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <View className="flex-row items-center px-lg py-md">
        <View className="mr-md h-10 w-10 items-center justify-center rounded-xl bg-brand-primary-light">
          {icon}
        </View>
        <View className="min-w-0 flex-1">
          <Typography variant="roleTitle" className="text-[15px]">
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="legal" className={cn('mt-0.5 text-left', subtitleClass)}>
              {subtitle}
            </Typography>
          ) : null}
        </View>
        {showChevron ? <ChevronRightIcon size={18} color={brandColors.body} /> : null}
      </View>
    </Pressable>
  );
});
