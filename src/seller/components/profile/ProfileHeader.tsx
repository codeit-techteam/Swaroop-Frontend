import { memo } from 'react';

import { Image, Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { BuildingIcon, CheckCircleIcon, EditIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { elevation } from '@/theme/shadows';

import type { SellerProfileData } from '@/seller/types/profile';

type ProfileHeaderProps = {
  profile: SellerProfileData;
  onEditProfile?: () => void;
};

export const VerifiedBadge = memo(function VerifiedBadge() {
  return (
    <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full border-2 border-brand-white bg-brand-success">
      <CheckCircleIcon size={12} color={brandColors.white} />
    </View>
  );
});

export const ProfileHeader = memo(function ProfileHeader({
  profile,
  onEditProfile,
}: ProfileHeaderProps) {
  return (
    <View
      className="rounded-[24px] border border-brand-border bg-brand-white p-lg"
      style={elevation.sm}
    >
      <View className="flex-row items-start">
        <View className="relative">
          <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-brand-primary-light">
            {profile.profileImage ? (
              <Image
                source={{ uri: profile.profileImage }}
                className="h-full w-full"
                accessibilityLabel={`${profile.name} profile photo`}
              />
            ) : (
              <Typography
                variant="headingLeft"
                className="text-[26px] leading-[32px] text-brand-primary-dark"
                accessibilityLabel={`${profile.name} initials`}
              >
                {profile.initials}
              </Typography>
            )}
          </View>
          {profile.verified ? <VerifiedBadge /> : null}
        </View>

        <View className="ml-md min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-sm">
            <View className="min-w-0 flex-1">
              <Typography
                variant="headingLeft"
                className="text-[22px] leading-[28px]"
                numberOfLines={1}
              >
                {profile.name}
              </Typography>
              <View className="mt-xs flex-row items-center gap-xs">
                <BuildingIcon size={13} color={brandColors.body} />
                <Typography variant="roleDescription" className="flex-1 text-left" numberOfLines={1}>
                  {profile.company}
                </Typography>
              </View>
            </View>

            <Pressable
              onPress={onEditProfile ?? (() => undefined)}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              className="flex-row items-center gap-xs rounded-full border border-brand-border bg-brand-primary-light px-md py-xs"
              style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
            >
              <EditIcon size={14} color={brandColors.primaryDark} />
              <Typography variant="badge" className="text-[11px] text-brand-primary-dark">
                Edit
              </Typography>
            </Pressable>
          </View>

          <View className="mt-sm flex-row flex-wrap items-center gap-sm">
            <View className="rounded-full bg-brand-primary-light px-md py-xs">
              <Typography variant="badge" className="text-[10px] tracking-[0.6px] text-brand-primary-dark">
                {profile.badge.toUpperCase()}
              </Typography>
            </View>
            {profile.verified ? (
              <View className="flex-row items-center gap-xs rounded-full bg-brand-success-light px-md py-xs">
                <CheckCircleIcon size={12} color={brandColors.success} />
                <Typography variant="badge" className="text-[10px] tracking-[0.6px] text-brand-success">
                  VERIFIED
                </Typography>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
});
