import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Image } from 'expo-image';

import Animated, { FadeIn } from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { BuildingIcon, CheckCircleIcon, EditIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { KycVerificationStatus, MembershipTier, TradingStatus } from '@/types/profile';
import { cn } from '@/utils/cn';

type ProfileHeroCardProps = {
  displayName: string;
  companyName: string;
  profilePhotoUri: string | null;
  kycStatus: KycVerificationStatus;
  membership: MembershipTier;
  tradingStatus: TradingStatus;
  onEditPress: () => void;
  className?: string;
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'PT';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
};

export const ProfileHeroCard = memo(function ProfileHeroCard({
  displayName,
  companyName,
  profilePhotoUri,
  kycStatus,
  membership,
  tradingStatus,
  onEditPress,
  className,
}: ProfileHeroCardProps) {
  const isKycVerified = kycStatus === 'verified';
  const isTradingActive = tradingStatus === 'Active';

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className={cn('overflow-hidden rounded-2xl', className)}
    >
      <View className="relative overflow-hidden bg-brand-navy p-lg">
        <View className="absolute inset-0 bg-brand-card-blue/35" />
        <View className="absolute inset-x-0 top-0 h-1/2 bg-brand-primary-dark/25" />
        <View className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-white/5" />

        <View className="relative">
          <View className="flex-row items-start justify-between">
            <View className="h-[72px] w-[72px] overflow-hidden rounded-xl border-2 border-brand-white/20 bg-brand-primary-dark">
              {profilePhotoUri ? (
                <Image
                  source={{ uri: profilePhotoUri }}
                  className="h-full w-full"
                  contentFit="cover"
                  accessibilityLabel={`${displayName} profile photo`}
                />
              ) : (
                <View className="h-full w-full items-center justify-center bg-brand-primary-dark">
                  <Typography variant="roleTitle" className="text-[22px] text-brand-white">
                    {getInitials(displayName)}
                  </Typography>
                </View>
              )}
            </View>

            {isKycVerified ? (
              <View className="flex-row items-center gap-xs rounded-full bg-brand-white px-sm py-xs">
                <CheckCircleIcon size={14} color={brandColors.success} />
                <Typography
                  variant="badge"
                  className="text-[10px] tracking-[0.8px] text-brand-success"
                >
                  KYC VERIFIED
                </Typography>
              </View>
            ) : null}
          </View>

          <Typography
            variant="headingLeft"
            className="mt-md text-[22px] leading-[28px] text-brand-white"
          >
            {displayName}
          </Typography>

          <View className="mt-xs flex-row items-center gap-xs">
            <BuildingIcon size={14} color={brandColors.white} />
            <Typography
              variant="subheadingLeft"
              className="flex-1 text-[13px] text-brand-white/90"
              numberOfLines={2}
            >
              {companyName || 'Complete business information'}
            </Typography>
          </View>

          <View className="mt-md flex-row flex-wrap gap-sm">
            <View className="rounded-full border border-brand-white/40 px-md py-xs">
              <Typography variant="badge" className="text-[10px] tracking-[0.8px] text-brand-white">
                {membership.toUpperCase()}
              </Typography>
            </View>
            <View
              className={cn(
                'rounded-full border px-md py-xs',
                isTradingActive ? 'border-brand-success/60' : 'border-brand-white/30',
              )}
            >
              <Typography
                variant="badge"
                className={cn(
                  'text-[10px] tracking-[0.8px]',
                  isTradingActive ? 'text-brand-success' : 'text-brand-white/70',
                )}
              >
                {`TRADING: ${tradingStatus.toUpperCase()}`}
              </Typography>
            </View>
          </View>

          <Pressable
            onPress={onEditPress}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            className="mt-lg flex-row items-center gap-sm self-start rounded-lg bg-brand-white px-md py-sm"
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <EditIcon size={16} color={brandColors.primary} />
            <Typography variant="badge" className="text-[12px] tracking-[0.4px] text-brand-primary">
              Edit Profile
            </Typography>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
});
