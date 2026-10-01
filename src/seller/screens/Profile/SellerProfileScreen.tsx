import { memo, useEffect, useMemo } from 'react';

import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { appConfig } from '@/config/env';
import {
  BankIcon,
  BellIcon,
  BuildingIcon,
  ClipboardCheckIcon,
  DocumentFileIcon,
  HeadsetIcon,
  LocationPinIcon,
  LogoutIcon,
  ProfileIcon,
  ShieldCheckIcon,
  StoreIcon,
  TruckIcon,
} from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  ProfileHeader,
  ProfileInfoCard,
  ProfileMenuItem,
  SellerBottomNavigation,
} from '@/seller/components';
import { usePullToRefresh } from '@/seller/hooks/usePullToRefresh';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import { useSellerStore } from '@/seller/store/sellerStore';
import type { SellerProfileData } from '@/seller/types/profile';
import {
  formatSellerAddress,
  formatSellerTypeLabel,
  type SellerAccountSummary,
} from '@/services/seller-profile';
import { showConfirmDialog } from '@/store/dialog-store';
import { brandColors } from '@/theme/colors';

const toProfileData = (account: SellerAccountSummary): SellerProfileData => ({
  name: account.ownerName,
  company: account.companyName,
  initials: account.initials,
  verified: account.verified,
  badge: formatSellerTypeLabel(account),
  gst: account.gstin ?? 'Not added',
  profileImage: account.logoUrl,
  address: formatSellerAddress(account) ?? 'Not added',
  bankVerified: account.bankVerified,
  kycStatus: account.verificationStatus,
  kycDocumentsCount: account.kycDocumentsCount,
  appVersion: `Version ${appConfig.version}`,
});

const PROFILE_ROUTE_MAP = {
  'company-profile': ROUTES.SELLER.PROFILE_COMPANY,
  'business-address': ROUTES.SELLER.PROFILE_ADDRESS,
  'gst-information': ROUTES.SELLER.PROFILE_GST,
  'my-offers': ROUTES.SELLER.OFFERS,
  'my-shipments': ROUTES.SELLER.SHIPMENTS,
  'purchase-requests': ROUTES.SELLER.PURCHASE_REQUESTS,
  'price-revisions': ROUTES.SELLER.PRICE_REVISIONS,
  'vehicle-slots': ROUTES.SELLER.VEHICLE_SLOTS,
  'procurement-workbench': ROUTES.SELLER.PROCUREMENT_WORKBENCH,
  'import-trading': ROUTES.SELLER.IMPORT_TRADING,
  payments: ROUTES.SELLER.PAYMENTS,
  'bank-details': ROUTES.SELLER.PROFILE_BANK,
  'kyc-documents': ROUTES.SELLER.PROFILE_KYC,
  'trade-licenses': ROUTES.SELLER.PROFILE_TRADE_LICENSES,
  'help-support': ROUTES.SELLER.SUPPORT,
  'documents-center': ROUTES.SELLER.PROFILE_DOCUMENTS,
  'app-settings': ROUTES.SELLER.SETTINGS,
  security: ROUTES.SELLER.PROFILE_SECURITY,
} as const;

export const SellerProfileScreen = memo(function SellerProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const account = useSellerStore((state) => state.account);
  const accountStatus = useSellerStore((state) => state.accountStatus);
  const accountError = useSellerStore((state) => state.accountError);
  const refreshSellerAccount = useSellerStore((state) => state.refreshSellerAccount);
  const logoutSeller = useSellerStore((state) => state.logoutSeller);
  const profile = useMemo(() => (account ? toProfileData(account) : null), [account]);
  const { isRefreshing, refresh } = usePullToRefresh(async () => {
    await refreshSellerAccount();
  });

  useEffect(() => {
    void refreshSellerAccount();
  }, [refreshSellerAccount]);

  const navigateProfileRoute = (routeKey: keyof typeof PROFILE_ROUTE_MAP) => {
    router.push(PROFILE_ROUTE_MAP[routeKey] as Href);
  };

  const handleLogout = () => {
    logoutSeller();
    router.replace(ROUTES.AUTH.ROLE_SELECTION as Href);
  };

  const confirmLogout = () => {
    showConfirmDialog({
      title: 'Logout?',
      message: 'You will need to sign in again to access your seller account.',
      confirmLabel: 'Logout',
      cancelLabel: 'Stay signed in',
      variant: 'danger',
      onConfirm: handleLogout,
    });
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <View className="flex-1">
        <View
          className="bg-brand-white px-xl pb-md"
          style={{ paddingTop: Math.max(insets.top, 12) }}
        >
          <View className="min-h-12 flex-row items-center justify-between">
            <View className="flex-row items-center gap-sm">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-primary-light">
                <ProfileIcon size={18} color={brandColors.primaryDark} />
              </View>
              <Typography variant="logo" className="text-[18px] text-brand-heading">
                Account
              </Typography>
            </View>
            <Pressable
              onPress={() => router.push(ROUTES.SELLER.NOTIFICATIONS as Href)}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              className="h-10 w-10 items-center justify-center rounded-full"
              style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
            >
              <BellIcon />
            </Pressable>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 120 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />
          }
        >
          {profile ? (
            <ProfileHeader
              profile={profile}
              onEditProfile={() => router.push(ROUTES.SELLER.PROFILE_EDIT as Href)}
            />
          ) : (
            <View className="items-center rounded-[24px] border border-brand-border bg-brand-white p-lg">
              {accountStatus === 'error' ? (
                <>
                  <Typography variant="body" className="text-center text-brand-heading">
                    {accountError ?? 'Could not load seller profile.'}
                  </Typography>
                  <Pressable
                    onPress={() => void refreshSellerAccount()}
                    accessibilityRole="button"
                    className="mt-md rounded-full bg-brand-primary px-lg py-sm"
                  >
                    <Typography variant="badge" className="text-brand-white">
                      Retry
                    </Typography>
                  </Pressable>
                </>
              ) : (
                <ActivityIndicator color={brandColors.primary} />
              )}
            </View>
          )}
          <AccountManagerCard />

          <ProfileInfoCard title="Company Information">
            <ProfileMenuItem
              icon={<BuildingIcon size={18} color={brandColors.primaryDark} />}
              title="Company Profile"
              subtitle="View entity details"
              onPress={() => navigateProfileRoute('company-profile')}
            />
            <ProfileMenuItem
              icon={<LocationPinIcon size={18} color={brandColors.primaryDark} />}
              title="Business Address"
              subtitle={profile?.address ?? 'Registered business address'}
              onPress={() => navigateProfileRoute('business-address')}
            />
            <ProfileMenuItem
              icon={<DocumentFileIcon size={18} color={brandColors.primaryDark} />}
              title="GST Information"
              subtitle={profile?.gst ?? 'Tax registration'}
              subtitleAccent="primary"
              onPress={() => navigateProfileRoute('gst-information')}
            />
            <ProfileMenuItem
              icon={<StoreIcon size={18} color={brandColors.primaryDark} />}
              title="My Offers"
              subtitle="Manage active listings"
              onPress={() => navigateProfileRoute('my-offers')}
            />
            <ProfileMenuItem
              icon={<TruckIcon size={18} color={brandColors.primaryDark} />}
              title="My Shipments"
              subtitle="Track active deliveries"
              onPress={() => navigateProfileRoute('my-shipments')}
            />
            <ProfileMenuItem
              icon={<StoreIcon size={18} color={brandColors.primaryDark} />}
              title="Purchase Requests"
              subtitle="Accept, reject, or counter"
              onPress={() => navigateProfileRoute('purchase-requests')}
            />
            <ProfileMenuItem
              icon={<DocumentFileIcon size={18} color={brandColors.primaryDark} />}
              title="Price Revisions"
              subtitle="Buyer price negotiations"
              onPress={() => navigateProfileRoute('price-revisions')}
            />
            <ProfileMenuItem
              icon={<TruckIcon size={18} color={brandColors.primaryDark} />}
              title="Vehicle Slots"
              subtitle="Loading bay bookings"
              onPress={() => navigateProfileRoute('vehicle-slots')}
            />
            <ProfileMenuItem
              icon={<ClipboardCheckIcon size={18} color={brandColors.primaryDark} />}
              title="Procurement Workbench"
              subtitle="End-to-end deal pipeline"
              onPress={() => navigateProfileRoute('procurement-workbench')}
            />
            <ProfileMenuItem
              icon={<StoreIcon size={18} color={brandColors.primaryDark} />}
              title="Import Trading"
              subtitle="International sell offers & buy requests"
              onPress={() => navigateProfileRoute('import-trading')}
            />
            <ProfileMenuItem
              icon={<BankIcon size={18} color={brandColors.primaryDark} />}
              title="Payments & PI"
              subtitle="Payments and proforma invoices"
              onPress={() => navigateProfileRoute('payments')}
              isLast
            />
          </ProfileInfoCard>

          <ProfileInfoCard title="Financial & Compliance">
            <ProfileMenuItem
              icon={<BankIcon size={18} color={brandColors.primaryDark} />}
              title="Bank Details"
              subtitle={profile?.bankVerified ? 'Verified' : 'Pending verification'}
              subtitleAccent={profile?.bankVerified ? 'success' : 'default'}
              onPress={() => navigateProfileRoute('bank-details')}
            />
            <ProfileMenuItem
              icon={<DocumentFileIcon size={18} color={brandColors.primaryDark} />}
              title="KYC Documents"
              subtitle={`${profile?.kycDocumentsCount ?? 0} files uploaded`}
              onPress={() => navigateProfileRoute('kyc-documents')}
            />
            <ProfileMenuItem
              icon={<ShieldCheckIcon size={18} color={brandColors.primaryDark} />}
              title="Trade Licenses"
              subtitle="Licenses and certificates"
              onPress={() => navigateProfileRoute('trade-licenses')}
              isLast
            />
          </ProfileInfoCard>

          <ProfileInfoCard title="Support & Settings">
            <ProfileMenuItem
              icon={<HeadsetIcon size={18} color={brandColors.primaryDark} />}
              title="Help & Support"
              subtitle="FAQs and direct contact"
              onPress={() => navigateProfileRoute('help-support')}
            />
            <ProfileMenuItem
              icon={<DocumentFileIcon size={18} color={brandColors.primaryDark} />}
              title="Documents Center"
              subtitle="All Seller Documents"
              onPress={() => navigateProfileRoute('documents-center')}
            />
            <ProfileMenuItem
              icon={<ProfileIcon size={18} color={brandColors.primaryDark} />}
              title="App Settings"
              subtitle="Preferences and display"
              onPress={() => navigateProfileRoute('app-settings')}
            />
            <ProfileMenuItem
              icon={<ShieldCheckIcon size={18} color={brandColors.primaryDark} />}
              title="Security"
              subtitle="Password and 2FA"
              onPress={() => navigateProfileRoute('security')}
              isLast
            />
          </ProfileInfoCard>

          <Pressable
            onPress={confirmLogout}
            accessibilityRole="button"
            accessibilityLabel="Log out"
            className="mt-xl flex-row items-center justify-center gap-sm rounded-2xl border border-brand-error/40 bg-brand-white px-lg py-md"
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            <LogoutIcon size={18} color={brandColors.error} />
            <Typography variant="roleTitle" className="text-brand-error">
              Log out
            </Typography>
          </Pressable>

          <Typography variant="legal" className="mt-lg text-center text-brand-footer">
            {`Version ${appConfig.version}`}
          </Typography>
        </ScrollView>

        <SellerBottomNavigation
          active="profile"
          onNavigate={(target) => navigateSellerBottomTab(router, target)}
        />
      </View>
    </ScreenWrapper>
  );
});

const AccountManagerCard = memo(function AccountManagerCard() {
  const managers = useSellerStore((state) => state.accountManagers);
  const manager = managers.find((row) => row.isPrimary) ?? managers[0];
  if (!manager) return null;

  const name = manager.name || 'Seller Manager';
  const contact = [manager.phone, manager.email].filter(Boolean).join(' · ');
  const text = contact ? `${name} · ${contact}` : name;

  return (
    <View className="mb-md rounded-2xl bg-brand-white p-md">
      <Typography variant="legal" className="text-brand-footer">
        Account Manager
      </Typography>
      <Typography variant="body" className="mt-xs text-brand-heading">
        {text}
      </Typography>
    </View>
  );
});
