import { memo } from 'react';

import { Image, View } from 'react-native';

import { Typography } from '@/components';
import { CheckCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

import { SellerPrimaryButton } from '@/seller/components/SellerPrimitives';
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

export const ProfileHeader = memo(function ProfileHeader({ profile, onEditProfile }: ProfileHeaderProps) {
  return (
    <View className="rounded-[24px] border border-brand-border bg-brand-white px-lg py-lg">
      <View className="items-center">
        <View className="relative">
          <Image
            source={{ uri: profile.profileImage }}
            className="h-24 w-24 rounded-2xl bg-brand-overlay"
          />
          {profile.verified ? <VerifiedBadge /> : null}
        </View>

        <Typography variant="headingLeft" className="mt-md text-[26px]">
          {profile.name}
        </Typography>

        <View className="mt-sm rounded-full bg-brand-primary-light px-md py-xs">
          <Typography variant="badge" className="text-brand-primary-dark">
            {profile.badge}
          </Typography>
        </View>

        <Typography variant="roleDescription" className="mt-sm">
          {profile.company}
        </Typography>
      </View>

      <View className="mt-lg flex-row">
        {[
          { label: 'Trading Since', value: profile.tradingSince },
          { label: 'Total Sales', value: profile.sales },
          { label: 'Reliability', value: profile.reliability, accent: true },
        ].map((stat) => (
          <View key={stat.label} className="flex-1 items-center">
            <Typography variant="badge" className="text-[10px] uppercase text-brand-body">
              {stat.label}
            </Typography>
            <Typography
              variant="roleTitle"
              className={cn('mt-xs text-[15px]', stat.accent && 'text-brand-success')}
            >
              {stat.value}
            </Typography>
          </View>
        ))}
      </View>

      <SellerPrimaryButton
        label="Edit Profile"
        onPress={onEditProfile ?? (() => undefined)}
        className="mt-lg"
      />
    </View>
  );
});
