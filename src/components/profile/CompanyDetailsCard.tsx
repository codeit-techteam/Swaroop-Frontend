import { memo } from 'react';

import { Pressable, View } from 'react-native';

import Animated, { FadeIn } from 'react-native-reanimated';

import { ProfileInfoRow } from '@/components/profile/ProfileInfoRow';
import { ProfileSectionHeader } from '@/components/profile/ProfileSectionHeader';
import { BuildingIcon, ChevronRightIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type CompanyDetailsCardProps = {
  gstNumber: string;
  gstRegisteredOn: string;
  onPress: () => void;
  className?: string;
};

export const CompanyDetailsCard = memo(function CompanyDetailsCard({
  gstNumber,
  gstRegisteredOn,
  onPress,
  className,
}: CompanyDetailsCardProps) {
  return (
    <Animated.View entering={FadeIn.duration(300).delay(50)}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="View company details"
        className={cn(
          'rounded-2xl border border-brand-border bg-brand-white p-lg shadow-sm',
          className,
        )}
        style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
      >
        <View className="flex-row items-center justify-between">
          <ProfileSectionHeader
            title="Company Details"
            icon={
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-tint">
                <BuildingIcon size={18} color={brandColors.primaryDark} />
              </View>
            }
          />
          <ChevronRightIcon color={brandColors.muted} />
        </View>

        <View className="mt-lg gap-md">
          <ProfileInfoRow label="GSTIN NUMBER" value={gstNumber} />
          <ProfileInfoRow label="GST REGISTERED ON" value={gstRegisteredOn || 'Not provided'} />
        </View>
      </Pressable>
    </Animated.View>
  );
});
