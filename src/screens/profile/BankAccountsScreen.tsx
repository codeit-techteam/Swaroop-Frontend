import { memo, useCallback } from 'react';

import { View } from 'react-native';

import { useRouter } from 'expo-router';

import { AppHeader, ScreenWrapper, Typography } from '@/components';
import { ProfileDataState, ProfileInfoRow } from '@/components/profile';
import { useProfile } from '@/hooks/useProfile';

export const BankAccountsScreen = memo(function BankAccountsScreen() {
  const router = useRouter();
  const { profile } = useProfile();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <ScreenWrapper scrollable className="bg-brand-background" contentClassName="pb-xl">
      <AppHeader variant="back" title="Bank Accounts" onBack={handleBack} />

      <View className="mt-lg gap-md">
        {profile.bankAccounts.length === 0 ? (
          <ProfileDataState
            variant="empty"
            title="No bank accounts linked"
            message="Bank accounts verified by PetroTrade will appear here."
          />
        ) : null}
        {profile.bankAccounts.map((account) => (
          <View
            key={account.id}
            className="rounded-2xl border border-brand-border bg-brand-white p-lg"
          >
            <View className="flex-row items-center justify-between">
              <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
                {account.bankName}
              </Typography>
              {account.isPrimary ? (
                <View className="rounded-full bg-brand-success-light px-sm py-xs">
                  <Typography variant="badge" className="text-[10px] text-brand-success">
                    PRIMARY
                  </Typography>
                </View>
              ) : null}
            </View>

            <View className="mt-md gap-md">
              <ProfileInfoRow label="ACCOUNT HOLDER" value={account.accountHolder} />
              <ProfileInfoRow label="ACCOUNT NUMBER" value={account.accountNumberMasked} />
              <ProfileInfoRow label="IFSC" value={account.ifsc} />
            </View>
          </View>
        ))}
      </View>
    </ScreenWrapper>
  );
});
