import { memo, useCallback, useEffect, useMemo } from 'react';

import { ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import {
  CompanyDetailsCard,
  ComplianceCard,
  CustomQuoteCard,
  DocumentsCard,
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
import { useDocumentsStore } from '@/store/documents-store';
import type { DocumentTab } from '@/types/documents';

export const ProfileScreen = memo(function ProfileScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const logout = useAuthStore((state) => state.logout);
  const fetchDocuments = useDocumentsStore((state) => state.fetchFromApi);
  const purchaseOrdersCount = useDocumentsStore((state) => state.purchaseOrders.length);
  const invoicesCount = useDocumentsStore((state) => state.invoices.length);
  const proformasCount = useDocumentsStore((state) => state.proformas.length);
  const documentsHydrated = useDocumentsStore((state) => state.isHydrated);

  useEffect(() => {
    if (!documentsHydrated) {
      void fetchDocuments();
    }
  }, [documentsHydrated, fetchDocuments]);

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

  const handleDocuments = useCallback(
    (tab: DocumentTab) => {
      router.push({
        pathname: ROUTES.CUSTOMER.PROFILE_DOCUMENTS,
        params: { tab },
      } as unknown as Href);
    },
    [router],
  );

  const documentCounts = useMemo(
    () =>
      documentsHydrated
        ? {
            purchase_orders: purchaseOrdersCount,
            invoices: invoicesCount,
            proforma: proformasCount,
          }
        : undefined,
    [documentsHydrated, invoicesCount, proformasCount, purchaseOrdersCount],
  );

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

        <DocumentsCard counts={documentCounts} onPressItem={handleDocuments} />

        <LogisticsFinanceCard items={logisticsItems} />

        <SettingsMenu onLogout={() => void handleLogout()} onNotifications={handleNotifications} />

        <CustomQuoteCard />

        <ProfileVersionFooter />
      </ScrollView>
    </View>
  );
});
