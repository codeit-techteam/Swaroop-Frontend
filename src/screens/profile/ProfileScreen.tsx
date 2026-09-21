import { memo, useCallback, useMemo } from 'react';

import { ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import {
  CompanyDetailsCard,
  ComplianceCard,
  CustomQuoteCard,
  LogisticsFinanceCard,
  ProfileHeroCard,
  ProfileStickyHeader,
  ProfileVersionFooter,
  SettingsMenu,
} from '@/components/profile';
import { TAB_BAR_HEIGHT } from '@/constants/dashboard';
import { LOGISTICS_MENU_ITEMS } from '@/constants/profile';
import { useProfile } from '@/hooks/useProfile';
import { ROUTES } from '@/navigation/routes';
import { useAuthStore } from '@/store/auth-store';

export const ProfileScreen = memo(function ProfileScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const logout = useAuthStore((state) => state.logout);

  const logisticsItems = useMemo(
    () =>
      LOGISTICS_MENU_ITEMS.map((item) => {
        let subtitle = '';

        if (item.subtitleKey === 'addresses') {
          subtitle = `${profile.savedAddresses.length} saved ${profile.savedAddresses.length === 1 ? 'location' : 'locations'}`;
        } else if (item.subtitleKey === 'banks') {
          subtitle = `${profile.bankAccounts.length} Accounts Linked`;
        } else {
          subtitle = 'Forms 16A, 26AS';
        }

        const routeMap: Record<string, string> = {
          'saved-addresses': ROUTES.CUSTOMER.PROFILE_SAVED_ADDRESSES,
          'bank-accounts': ROUTES.CUSTOMER.PROFILE_BANK_ACCOUNTS,
          'tax-documents': ROUTES.CUSTOMER.PROFILE_TAX_DOCUMENTS,
        };

        return {
          id: item.id,
          title: item.title,
          subtitle,
          onPress: () => router.push(routeMap[item.id] as Href),
        };
      }),
    [profile.bankAccounts.length, profile.savedAddresses.length, router],
  );

  const handleEditProfile = useCallback(() => {
    router.push(ROUTES.CUSTOMER.PROFILE_EDIT as Href);
  }, [router]);

  const handleCompanyDetails = useCallback(() => {
    router.push(ROUTES.CUSTOMER.PROFILE_COMPANY_DETAILS as Href);
  }, [router]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace(ROUTES.AUTH.ROLE_SELECTION as Href);
  }, [logout, router]);

  const handleNotifications = useCallback(() => {
    router.push(ROUTES.CUSTOMER.NOTIFICATIONS as Href);
  }, [router]);

  return (
    <View className="flex-1 bg-brand-background">
      <ProfileStickyHeader />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-md px-lg pb-lg pt-md"
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeroCard
          displayName={profile.displayName}
          companyName={profile.companyName}
          profilePhotoUri={profile.profilePhotoUri}
          kycStatus={profile.kycStatus}
          membership={profile.membership}
          tradingStatus={profile.tradingStatus}
          onEditPress={handleEditProfile}
        />

        <CompanyDetailsCard
          gstNumber={profile.gstNumber}
          establishedYear={profile.establishedYear}
          onPress={handleCompanyDetails}
        />

        <ComplianceCard compliance={profile.compliance} />

        <LogisticsFinanceCard items={logisticsItems} />

        <SettingsMenu
          onLogout={() => void handleLogout()}
          onNotifications={handleNotifications}
        />

        <CustomQuoteCard />

        <ProfileVersionFooter />
      </ScrollView>
    </View>
  );
});
