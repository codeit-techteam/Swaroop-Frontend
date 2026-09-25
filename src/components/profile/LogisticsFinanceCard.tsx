import { memo } from 'react';

import { Pressable, View } from 'react-native';

import Animated, { FadeIn } from 'react-native-reanimated';

import { ProfileSectionHeader } from '@/components/profile/ProfileSectionHeader';
import { Typography } from '@/components/ui/typography';
import {
  BankIcon,
  ChevronRightIcon,
  DocumentFileIcon,
  LocationPinIcon,
  WalletIcon,
} from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type LogisticsMenuRow = {
  id: string;
  title: string;
  subtitle: string;
  onPress: () => void;
};

type LogisticsFinanceCardProps = {
  items: LogisticsMenuRow[];
  className?: string;
};

const ROW_ICONS = {
  'saved-addresses': LocationPinIcon,
  'bank-accounts': BankIcon,
  'tax-documents': DocumentFileIcon,
  'trading-credit': WalletIcon,
} as const;

export const LogisticsFinanceCard = memo(function LogisticsFinanceCard({
  items,
  className,
}: LogisticsFinanceCardProps) {
  return (
    <Animated.View entering={FadeIn.duration(300).delay(150)}>
      <View
        className={cn(
          'rounded-2xl border border-brand-border bg-brand-white p-lg shadow-sm',
          className,
        )}
      >
        <ProfileSectionHeader
          title="Logistics & Finance"
          icon={
            <View className="h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-tint">
              <BankIcon size={18} color={brandColors.primaryDark} />
            </View>
          }
        />

        <View className="mt-md">
          {items.map((item, index) => {
            const IconComponent = ROW_ICONS[item.id as keyof typeof ROW_ICONS] ?? DocumentFileIcon;
            const isLast = index === items.length - 1;

            return (
              <Pressable
                key={item.id}
                onPress={item.onPress}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                className={cn(
                  'flex-row items-center py-md',
                  !isLast && 'border-b border-brand-border',
                )}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <View className="mr-md h-10 w-10 items-center justify-center rounded-lg bg-brand-surface">
                  <IconComponent size={20} color={brandColors.secondaryButton} />
                </View>

                <View className="flex-1">
                  <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
                    {item.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="mt-0.5 font-sans normal-case tracking-normal text-brand-muted"
                  >
                    {item.subtitle}
                  </Typography>
                </View>

                <ChevronRightIcon color={brandColors.muted} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
});
