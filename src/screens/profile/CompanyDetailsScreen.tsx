import { memo, useCallback } from 'react';

import { View } from 'react-native';

import { useRouter } from 'expo-router';

import { AppHeader, ScreenWrapper } from '@/components';
import { ProfileInfoRow } from '@/components/profile';
import { useProfile } from '@/hooks/useProfile';

export const CompanyDetailsScreen = memo(function CompanyDetailsScreen() {
  const router = useRouter();
  const { profile } = useProfile();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <ScreenWrapper scrollable className="bg-brand-background" contentClassName="pb-xl">
      <AppHeader variant="back" title="Company Details" onBack={handleBack} />

      <View className="mt-lg gap-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
        <ProfileInfoRow label="GST NUMBER" value={profile.gstNumber} />
        <ProfileInfoRow label="PAN NUMBER" value={profile.panNumber} />
        <ProfileInfoRow label="BUSINESS TYPE" value={profile.companyType} />
        <ProfileInfoRow label="COMPANY REGISTRATION" value={profile.companyName} />
        <ProfileInfoRow label="STATE" value={profile.state} />
        <ProfileInfoRow label="CITY" value={profile.city} />
        <ProfileInfoRow label="PINCODE" value={profile.pincode} />
        <ProfileInfoRow label="NATURE OF BUSINESS" value={profile.natureOfBusiness} />
        <ProfileInfoRow label="ESTABLISHED" value={profile.establishedYear || 'Not provided'} />
      </View>
    </ScreenWrapper>
  );
});
