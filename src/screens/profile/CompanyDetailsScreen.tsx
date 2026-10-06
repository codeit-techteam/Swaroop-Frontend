import { memo, useCallback } from 'react';

import { View } from 'react-native';

import { useRouter } from 'expo-router';

import { AppHeader, ScreenWrapper } from '@/components';
import { ProfileDataState, ProfileInfoRow } from '@/components/profile';
import { useCustomerKycStatus } from '@/hooks/use-customer-kyc-status';
import { useProfile } from '@/hooks/useProfile';
import { useCustomerKycOverviewStore } from '@/store/customer-kyc-overview-store';

export const CompanyDetailsScreen = memo(function CompanyDetailsScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { refresh } = useCustomerKycStatus();
  const status = useCustomerKycOverviewStore((state) => state.status);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRetry = useCallback(() => {
    void refresh();
  }, [refresh]);

  const loaded = profile.companySource === 'backend';
  const hasCompany = Boolean(profile.gstNumber || profile.panNumber || profile.companyName);

  return (
    <ScreenWrapper scrollable className="bg-brand-background" contentClassName="pb-xl">
      <AppHeader variant="back" title="Company Details" onBack={handleBack} />

      {!loaded && status === 'error' ? (
        <ProfileDataState
          variant="error"
          title="Couldn't load company details"
          message="Check your connection and try again."
          onRetry={handleRetry}
          className="mt-lg"
        />
      ) : !loaded ? (
        <ProfileDataState variant="loading" title="Loading company details" className="mt-lg" />
      ) : !hasCompany ? (
        <ProfileDataState
          variant="empty"
          title="No company details yet"
          message="Verify your PAN and GST in KYC to add your business here."
          className="mt-lg"
        />
      ) : (
        <View className="mt-lg gap-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
          <ProfileInfoRow label="GST NUMBER" value={profile.gstNumber} />
          <ProfileInfoRow label="PAN NUMBER" value={profile.panNumber} />
          <ProfileInfoRow label="BUSINESS TYPE" value={profile.companyType} />
          <ProfileInfoRow label="COMPANY REGISTRATION" value={profile.companyName} />
          <ProfileInfoRow label="REGISTERED ADDRESS" value={profile.businessAddress} />
          <ProfileInfoRow label="STATE" value={profile.state} />
          <ProfileInfoRow label="PINCODE" value={profile.pincode} />
          <ProfileInfoRow label="NATURE OF BUSINESS" value={profile.natureOfBusiness} />
          <ProfileInfoRow label="BUSINESS EMAIL" value={profile.email} />
          <ProfileInfoRow
            label="GST REGISTERED ON"
            value={profile.gstRegisteredOn || 'Not provided'}
          />
        </View>
      )}
    </ScreenWrapper>
  );
});
